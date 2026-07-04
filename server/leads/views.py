import hashlib
import json
import logging
import urllib.parse
import urllib.request

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
from django.db.models import Count

from .meta_capi import send_lead_event
from .models import ContactLead, LocalAdsLead
from .serializers import (
    ContactLeadSerializer,
    ContactLeadCreateSerializer,
    ContactLeadUpdateSerializer,
    ContactLeadAdminCreateSerializer,
    LocalAdsLeadSerializer,
    LocalAdsLeadListSerializer,
    LocalAdsLeadStatusSerializer,
    LocalAdsLeadConvertSerializer,
    LocalAdsLeadCreateSerializer,
)

logger = logging.getLogger(__name__)


class ContactLeadViewSet(viewsets.ModelViewSet):
    """ViewSet for contact leads."""

    queryset = ContactLead.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'project_type']

    def get_serializer_class(self):
        if self.action == 'create':
            return ContactLeadCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ContactLeadUpdateSerializer
        return ContactLeadSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]

    def _get_client_ip(self, request):
        """Extract client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')

    def _is_allowed_tolatiles_origin(self, value: str) -> bool:
        """True if value is https://tolatiles.com, https://www.tolatiles.com, or any https://*.tolatiles.com subdomain."""
        import re
        return bool(re.match(r'^https://([\w-]+\.)?tolatiles\.com(/|$)', value))

    def _verify_turnstile(self, token: str, ip: str) -> bool:
        """Verify a Cloudflare Turnstile token via the siteverify API."""
        secret_key = getattr(settings, 'CLOUDFLARE_TURNSTILE_SECRET_KEY', '')
        if not secret_key:
            logger.warning('CLOUDFLARE_TURNSTILE_SECRET_KEY not set — skipping Turnstile check')
            return True  # Fail open in dev when key is absent

        payload = urllib.parse.urlencode({
            'secret': secret_key,
            'response': token,
            'remoteip': ip,
        }).encode('utf-8')

        req = urllib.request.Request(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data=payload,
            method='POST',
        )
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read())
                return bool(result.get('success', False))
        except Exception as exc:
            logger.error('Turnstile siteverify request failed: %s', exc)
            return False

    def create(self, request, *args, **kwargs):
        """Handle public contact form submission."""
        # IP-based rate limiting: max 3 submissions per IP per hour
        client_ip = self._get_client_ip(request)
        ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()[:16]
        cache_key = f'contact_form_rate:{ip_hash}'
        submission_count = cache.get(cache_key, 0)

        if submission_count >= 3:
            return Response(
                {'error': 'Too many submissions. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # User-Agent validation
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if not user_agent or len(user_agent) < 10:
            return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

        # Origin/Referer validation (skip in DEBUG mode)
        # Any *.tolatiles.com origin is allowed so landing-page subdomains (bathroom.tolatiles.com,
        # promotion.tolatiles.com, etc.) can submit leads, not just the main site.
        if not settings.DEBUG:
            origin = request.META.get('HTTP_ORIGIN', '')
            referer = request.META.get('HTTP_REFERER', '')
            if origin and not self._is_allowed_tolatiles_origin(origin):
                return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
            if not origin and referer and not self._is_allowed_tolatiles_origin(referer):
                return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

        # Cloudflare Turnstile verification (skip in DEBUG mode)
        if not settings.DEBUG:
            turnstile_token = request.data.get('cf_turnstile_response', '')
            if not turnstile_token:
                return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
            if not self._verify_turnstile(turnstile_token, client_ip):
                return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Increment rate limit counter
        cache.set(cache_key, submission_count + 1, 3600)  # 1 hour TTL

        # Get the created lead data
        lead = serializer.instance
        customer_email = lead.email
        customer_name = lead.full_name

        # Server-side Meta Conversions API event, deduplicated against the
        # browser pixel's fbq('track', 'Lead') via a shared event_id.
        try:
            send_lead_event(lead, request, client_ip, request.data.get('event_id', ''))
        except Exception as e:
            logger.error(f"Meta CAPI dispatch failed: {e}")

        # Send thank you email to customer (landing-page leads may not collect an email)
        if customer_email:
            try:
                send_mail(
                    subject='Thank You for Contacting Tola Tiles',
                    message=f'''Dear {customer_name},

Thank you for contacting us! We have received your inquiry and appreciate your interest in Tola Tiles.

Our team will review your message and get back to you as soon as possible.

Best regards,
Meni Tola
Tola Tiles''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[customer_email],
                    fail_silently=False,
                )
            except Exception as e:
                logger.error(f"Failed to send thank you email to {customer_email}: {e}")

        # Send notification email to admin
        try:
            send_mail(
                subject='New Lead - Tola Tiles Contact Form',
                message=f'''A new lead came through the contact form.

Name: {customer_name}
Email: {customer_email or '(not provided)'}
Phone: {lead.phone}
Project Type: {lead.get_project_type_display()}
Source: {lead.lead_source or 'Website'}

Message:
{lead.message}

---
View all leads in the admin dashboard.''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['menitola@tolatiles.com'],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send admin notification email: {e}")

        return Response(
            {'message': 'Thank you for your inquiry. We will contact you shortly.'},
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        """Get lead statistics."""
        total = ContactLead.objects.count()
        by_status = {}
        for status_choice in ContactLead.STATUS_CHOICES:
            by_status[status_choice[0]] = ContactLead.objects.filter(
                status=status_choice[0]
            ).count()

        landing_page_counts = (
            ContactLead.objects.exclude(landing_page__isnull=True)
            .values('landing_page__name')
            .annotate(count=Count('id'))
        )
        by_landing_page = {row['landing_page__name']: row['count'] for row in landing_page_counts}

        return Response({
            'total': total,
            'by_status': by_status,
            'by_landing_page': by_landing_page,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        """Quick action to update lead status."""
        lead = self.get_object()
        new_status = request.data.get('status')
        contact_result_reason = request.data.get('contact_result_reason', '')

        if new_status not in dict(ContactLead.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        lead.status = new_status
        if contact_result_reason:
            valid_reasons = dict(ContactLead.CONTACT_RESULT_REASON_CHOICES).keys()
            if contact_result_reason in valid_reasons:
                lead.contact_result_reason = contact_result_reason
        lead.save()
        serializer = ContactLeadSerializer(lead)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def convert_to_customer(self, request, pk=None):
        """Convert a qualified lead to a Customer."""
        lead = self.get_object()
        address = request.data.get('address', '').strip() or lead.address

        if not address:
            return Response(
                {'error': 'Address is required to convert a lead to a customer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from quotes.models import Customer
        customer = Customer.objects.create(
            name=lead.full_name,
            email=lead.email,
            phone=lead.phone or '',
            address=address,
        )

        lead.status = 'converted'
        lead.address = address
        lead.save()

        return Response({
            'customer_id': customer.id,
            'customer_name': customer.name,
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def admin_create(self, request):
        """Admin endpoint to manually create a website lead."""
        serializer = ContactLeadAdminCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = serializer.save()

        return Response(
            ContactLeadSerializer(lead).data,
            status=status.HTTP_201_CREATED
        )


class LocalAdsLeadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Local Ads Leads (Google Local Services Ads).
    Admin-only access for managing leads from LSA.
    """

    queryset = LocalAdsLead.objects.all()
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'charge_status', 'lead_type']

    def get_serializer_class(self):
        if self.action == 'list':
            return LocalAdsLeadListSerializer
        if self.action == 'create':
            return LocalAdsLeadCreateSerializer
        if self.action == 'update_status':
            return LocalAdsLeadStatusSerializer
        if self.action == 'convert_to_customer':
            return LocalAdsLeadConvertSerializer
        return LocalAdsLeadSerializer

    def create(self, request, *args, **kwargs):
        """Create a new Local Ads lead manually."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = serializer.save()
        return Response(
            LocalAdsLeadSerializer(lead).data,
            status=status.HTTP_201_CREATED
        )

    def get_queryset(self):
        queryset = super().get_queryset()

        # Date range filtering
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if date_from:
            queryset = queryset.filter(lead_received__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(lead_received__date__lte=date_to)

        return queryset

    def list(self, request, *args, **kwargs):
        """List all Local Ads leads with pagination."""
        queryset = self.filter_queryset(self.get_queryset())

        # Custom pagination
        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))

        # Calculate pagination
        total_count = queryset.count()
        start = (page - 1) * page_size
        end = start + page_size

        # Get paginated results
        leads = queryset[start:end]
        serializer = self.get_serializer(leads, many=True)

        # Build response with pagination info
        return Response({
            'count': total_count,
            'next': f"?page={page + 1}&page_size={page_size}" if end < total_count else None,
            'previous': f"?page={page - 1}&page_size={page_size}" if page > 1 else None,
            'results': serializer.data,
        })

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """Update the internal status of a Local Ads lead."""
        lead = self.get_object()
        serializer = LocalAdsLeadStatusSerializer(lead, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(LocalAdsLeadSerializer(lead).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='convert')
    def convert_to_customer(self, request, pk=None):
        """Convert a Local Ads lead to a Customer."""
        lead = self.get_object()

        if lead.customer:
            return Response(
                {'error': 'This lead has already been converted to a customer.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = LocalAdsLeadConvertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Override default values if provided
        if serializer.validated_data.get('name'):
            lead.customer_name = serializer.validated_data['name']
        if serializer.validated_data.get('address'):
            lead.location = serializer.validated_data['address']

        # Convert to customer
        customer = lead.convert_to_customer()

        # Update email if provided
        if serializer.validated_data.get('email'):
            customer.email = serializer.validated_data['email']
            customer.save()

        return Response({
            'message': 'Lead converted to customer successfully.',
            'customer_id': customer.id,
            'customer_name': customer.name,
            'lead': LocalAdsLeadSerializer(lead).data,
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get Local Ads lead statistics."""
        total = LocalAdsLead.objects.count()

        by_status = {}
        for status_choice in LocalAdsLead.STATUS_CHOICES:
            by_status[status_choice[0]] = LocalAdsLead.objects.filter(
                status=status_choice[0]
            ).count()

        by_charge_status = {}
        for charge_choice in LocalAdsLead.CHARGE_STATUS_CHOICES:
            by_charge_status[charge_choice[0]] = LocalAdsLead.objects.filter(
                charge_status=charge_choice[0]
            ).count()

        by_lead_type = {}
        for type_choice in LocalAdsLead.LEAD_TYPE_CHOICES:
            by_lead_type[type_choice[0]] = LocalAdsLead.objects.filter(
                lead_type=type_choice[0]
            ).count()

        return Response({
            'total': total,
            'by_status': by_status,
            'by_charge_status': by_charge_status,
            'by_lead_type': by_lead_type,
        })
