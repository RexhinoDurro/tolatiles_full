from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings
import logging

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

    def create(self, request, *args, **kwargs):
        """Handle public contact form submission."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        # Get the created lead data
        lead = serializer.instance
        customer_email = lead.email
        customer_name = lead.full_name

        # Send thank you email to customer
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
Email: {customer_email}
Phone: {lead.phone}
Project Type: {lead.get_project_type_display()}

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

        return Response({
            'total': total,
            'by_status': by_status,
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        """Quick action to update lead status."""
        lead = self.get_object()
        new_status = request.data.get('status')

        if new_status not in dict(ContactLead.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        lead.status = new_status
        lead.save()
        serializer = ContactLeadSerializer(lead)
        return Response(serializer.data)

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
