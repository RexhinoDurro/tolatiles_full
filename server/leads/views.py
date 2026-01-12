from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings
import logging

from .models import ContactLead
from .serializers import (
    ContactLeadSerializer,
    ContactLeadCreateSerializer,
    ContactLeadUpdateSerializer,
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
