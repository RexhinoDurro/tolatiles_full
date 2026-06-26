"""
Views and ViewSets for the Quote Generator and Invoice system.
"""
from decimal import Decimal
from django.db import models
from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, BasePermission
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import CompanySettings, Customer, CustomerPhoto, Quote, LineItem, Invoice, InvoiceInstallment, InvoiceLineItem, Estimate, EstimateLineItem, EstimatePhoto, Deal, EstimateVisit, EstimateVisitPhoto, Appointment, CustomJobType, CustomLeadSource
from .serializers import (
    CompanySettingsSerializer,
    CustomerSerializer, CustomerCreateSerializer, CustomerPhotoSerializer,
    QuoteListSerializer, QuoteDetailSerializer, QuoteCreateSerializer, PortalQuoteCreateSerializer,
    InvoiceListSerializer, InvoiceDetailSerializer, InvoiceCreateSerializer,
    InvoiceInstallmentSerializer, InvoiceInstallmentCreateSerializer,
    PublicQuoteSerializer, PublicInvoiceSerializer,
    EstimateListSerializer, EstimateSerializer, EstimatePhotoSerializer,
    DealSerializer, EstimateVisitSerializer, EstimateVisitPhotoSerializer, AppointmentSerializer,
    CustomJobTypeSerializer, CustomLeadSourceSerializer,
)


class IsAdminOrQuotesManager(BasePermission):
    """Allows access to Admin users or authenticated quotes portal users."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        if request.user.is_staff or request.user.is_superuser:
            return True
        try:
            return request.user.profile.is_quotes_manager
        except Exception:
            return False


# ==================== COMPANY SETTINGS ====================

class CompanySettingsView(APIView):
    """
    Singleton company settings endpoint.
    GET: Retrieve current settings
    PUT: Update settings
    """
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        settings = CompanySettings.get_instance()
        serializer = CompanySettingsSerializer(settings, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        settings = CompanySettings.get_instance()
        serializer = CompanySettingsSerializer(settings, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ==================== CUSTOMER VIEWSET ====================

class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for customer management.

    Endpoints:
    - GET /api/customers/ - List all active customers
    - POST /api/customers/ - Create customer
    - GET /api/customers/{id}/ - Get customer details
    - PATCH /api/customers/{id}/ - Update customer
    - DELETE /api/customers/{id}/ - Archive customer (soft delete)
    - POST /api/customers/{id}/archive/ - Archive customer
    - POST /api/customers/{id}/unarchive/ - Unarchive customer
    - DELETE /api/customers/{id}/hard_delete/ - Permanently delete customer
    - GET /api/customers/archived_list/ - List archived customers
    - GET /api/customers/search/?q= - Search active customers
    """
    permission_classes = [IsAdminUser]
    pagination_class = None
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']

    def get_queryset(self):
        return Customer.objects.filter(is_archived=False)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateSerializer
        return CustomerSerializer

    def destroy(self, request, *args, **kwargs):
        """Archive instead of delete."""
        instance = self.get_object()
        instance.is_archived = True
        instance.archived_at = timezone.now()
        instance.save(update_fields=['is_archived', 'archived_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a customer."""
        instance = self.get_object()
        instance.is_archived = True
        instance.archived_at = timezone.now()
        instance.save(update_fields=['is_archived', 'archived_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        """Unarchive a customer."""
        instance = Customer.objects.get(pk=pk)
        instance.is_archived = False
        instance.archived_at = None
        instance.save(update_fields=['is_archived', 'archived_at'])
        serializer = CustomerSerializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def hard_delete(self, request, pk=None):
        """Permanently delete a customer."""
        instance = Customer.objects.get(pk=pk)
        try:
            instance.delete()
        except ProtectedError:
            return Response(
                {'error': 'Cannot permanently delete: customer has associated quotes or invoices'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def archived_list(self, request):
        """List all archived customers."""
        customers = Customer.objects.filter(is_archived=True)
        serializer = CustomerSerializer(customers, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search active customers by name, email, or phone."""
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])

        customers = Customer.objects.filter(is_archived=False).filter(
            models.Q(name__icontains=query) |
            models.Q(email__icontains=query) |
            models.Q(phone__icontains=query)
        )[:10]

        serializer = CustomerSerializer(customers, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def photos(self, request, pk=None):
        """List all photos for this customer."""
        customer = self.get_object()
        photos = customer.photos.all()
        serializer = CustomerPhotoSerializer(photos, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='upload_photo', parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        """Upload a photo for this customer."""
        customer = self.get_object()
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        caption = request.data.get('caption', '')
        photo = CustomerPhoto.objects.create(customer=customer, image=image, caption=caption)
        serializer = CustomerPhotoSerializer(photo, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='photos/(?P<photo_id>[^/.]+)')
    def delete_photo(self, request, pk=None, photo_id=None):
        """Delete a photo from this customer."""
        customer = self.get_object()
        photo = get_object_or_404(CustomerPhoto, id=photo_id, customer=customer)
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==================== QUOTE VIEWSET ====================

class QuoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for quote management.

    Endpoints:
    - GET /api/quotes/ - List all quotes
    - POST /api/quotes/ - Create quote
    - GET /api/quotes/{id}/ - Get quote details
    - PATCH /api/quotes/{id}/ - Update quote
    - DELETE /api/quotes/{id}/ - Delete quote

    Custom Actions:
    - POST /api/quotes/{id}/generate_pdf/ - Generate PDF
    - POST /api/quotes/{id}/send_email/ - Send via email
    - POST /api/quotes/{id}/update_status/ - Update status
    - POST /api/quotes/{id}/duplicate/ - Create copy
    - GET /api/quotes/stats/ - Get statistics
    """
    queryset = Quote.objects.select_related('customer').prefetch_related('line_items')
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'customer', 'created_via_portal']

    def get_serializer_class(self):
        if self.action == 'list':
            return QuoteListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return QuoteCreateSerializer
        return QuoteDetailSerializer

    def _generate_pdf_after_save(self, quote, request):
        """Regenerate PDF synchronously after every save."""
        try:
            from .tasks import generate_quote_pdf
            generate_quote_pdf(quote.id)
        except Exception:
            pass  # PDF failure must not block save response

    def perform_create(self, serializer):
        instance = serializer.save()
        self._generate_pdf_after_save(instance, self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.created_via_portal:
            Quote.objects.filter(pk=instance.pk).update(
                edited_by_admin=True,
                admin_edited_at=timezone.now()
            )
        self._generate_pdf_after_save(instance, self.request)

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF synchronously."""
        quote = self.get_object()

        try:
            from .tasks import generate_quote_pdf
            # Run synchronously (without .delay()) for immediate result
            result = generate_quote_pdf(quote.id)

            if result.get('status') == 'success':
                quote.refresh_from_db()
                pdf_url = None
                if quote.pdf_file:
                    pdf_url = request.build_absolute_uri(quote.pdf_file.url)
                return Response({
                    'message': 'PDF generated successfully',
                    'quote_id': quote.id,
                    'reference': quote.reference,
                    'pdf_url': pdf_url
                })
            else:
                return Response({
                    'error': result.get('reason', 'PDF generation failed')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """Send quote to customer via email."""
        quote = self.get_object()

        if not quote.customer.email:
            return Response(
                {'error': 'Customer has no email address'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from .tasks import send_quote_email
        send_quote_email.delay(quote.id)

        return Response({
            'message': 'Email queued for delivery',
            'quote_id': quote.id,
            'email': quote.customer.email
        })

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Quick status update."""
        quote = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = dict(Quote.STATUS_CHOICES).keys()
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Valid options: {list(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        quote.status = new_status
        quote.save()

        serializer = QuoteDetailSerializer(quote, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a copy of this quote."""
        original = self.get_object()

        # Create new quote with copied data
        new_quote = Quote.objects.create(
            title=f"{original.title} (Copy)",
            customer=original.customer,
            expires_at=original.expires_at,
            currency=original.currency,
            comments_text=original.comments_text,
            terms=original.terms,
            discount_percent=original.discount_percent,
            discount_amount=original.discount_amount,
            tax_rate=original.tax_rate,
            shipping_amount=original.shipping_amount,
        )

        # Copy line items
        for item in original.line_items.all():
            LineItem.objects.create(
                quote=new_quote,
                name=item.name,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                detail_lines=item.detail_lines,
                order=item.order,
            )

        new_quote.save()  # Recalculate totals

        serializer = QuoteDetailSerializer(new_quote, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get quote statistics."""
        total = Quote.objects.count()
        by_status = {}

        for status_key, status_label in Quote.STATUS_CHOICES:
            by_status[status_key] = Quote.objects.filter(status=status_key).count()

        # Calculate totals
        total_value = Quote.objects.aggregate(
            total_value=models.Sum('total')
        )['total_value'] or 0

        accepted_value = Quote.objects.filter(status='accepted').aggregate(
            total_value=models.Sum('total')
        )['total_value'] or 0

        return Response({
            'total': total,
            'by_status': by_status,
            'total_value': float(total_value),
            'accepted_value': float(accepted_value),
        })

    @action(detail=True, methods=['post'])
    def convert_to_invoice(self, request, pk=None):
        """Convert an accepted quote to an invoice."""
        quote = self.get_object()

        if quote.status != 'accepted':
            return Response(
                {'error': 'Only accepted quotes can be converted to invoices'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if invoice already exists for this quote
        if quote.invoices.exists():
            return Response(
                {'error': 'An invoice already exists for this quote'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get due date from request or default to 30 days from now
        due_date = request.data.get('due_date')
        if not due_date:
            from datetime import timedelta
            due_date = (timezone.now() + timedelta(days=30)).date()

        # Create invoice from quote
        invoice = Invoice.objects.create(
            title=quote.title,
            customer=quote.customer,
            quote=quote,
            due_date=due_date,
            currency=quote.currency,
            notes=quote.comments_text,
            discount_type=quote.discount_type,
            discount_amount=quote.discount_amount,
            discount_percent=quote.discount_percent,
            tax_rate=quote.tax_rate,
            shipping_amount=quote.shipping_amount,
        )

        # Create default installment containing all line items
        installment = InvoiceInstallment.objects.create(
            invoice=invoice,
            title='Installment 1',
            order=0,
            due_date=due_date,
        )
        for item in quote.line_items.all():
            InvoiceLineItem.objects.create(
                installment=installment,
                name=item.name,
                description=item.description,
                quantity=Decimal('1.00') if item.is_service else item.quantity,
                unit_price=item.unit_price,
                order=item.order,
            )

        invoice.save()  # Recalculate totals

        serializer = InvoiceDetailSerializer(invoice, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def link_to_deal(self, request, pk=None):
        """
        Link a portal (orphan) quote to a real customer and deal.

        Body: { "customer_id": int, "deal_id": int (optional) }
        """
        quote = self.get_object()
        customer_id = request.data.get('customer_id')
        deal_id = request.data.get('deal_id') or None

        if not customer_id:
            return Response({'error': 'customer_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(pk=customer_id)
        except Customer.DoesNotExist:
            return Response({'error': 'Customer not found'}, status=status.HTTP_404_NOT_FOUND)

        deal = None
        if deal_id:
            try:
                from .models import Deal
                deal = Deal.objects.get(pk=deal_id)
                # Ensure deal belongs to the chosen customer
                if deal.customer_id != customer.id:
                    return Response(
                        {'error': 'Deal does not belong to the selected customer'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            except Deal.DoesNotExist:
                return Response({'error': 'Deal not found'}, status=status.HTTP_404_NOT_FOUND)

        quote.customer = customer
        quote.deal = deal
        quote.save()

        serializer = QuoteDetailSerializer(quote, context={'request': request})
        return Response(serializer.data)



# ==================== PUBLIC QUOTE VIEW ====================

class PublicQuoteView(APIView):
    """
    Public endpoint for viewing quotes by reference.
    No authentication required.
    """
    permission_classes = [AllowAny]

    def get(self, request, reference):
        quote = get_object_or_404(
            Quote.objects.select_related('customer').prefetch_related('line_items'),
            reference=reference
        )
        serializer = PublicQuoteSerializer(quote, context={'request': request})
        return Response(serializer.data)


# ==================== INVOICE VIEWSET ====================

class InvoiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for invoice management.

    Endpoints:
    - GET /api/invoices/ - List all invoices
    - POST /api/invoices/ - Create invoice
    - GET /api/invoices/{id}/ - Get invoice details
    - PATCH /api/invoices/{id}/ - Update invoice
    - DELETE /api/invoices/{id}/ - Delete invoice

    Custom Actions:
    - POST /api/invoices/{id}/generate_pdf/ - Generate PDF
    - POST /api/invoices/{id}/send_email/ - Send via email
    - POST /api/invoices/{id}/mark_paid/ - Mark as paid
    - POST /api/invoices/{id}/record_payment/ - Record partial payment
    - GET /api/invoices/stats/ - Get statistics
    """
    queryset = Invoice.objects.select_related('customer', 'quote').prefetch_related(
        'installments__line_items'
    )
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'customer']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return InvoiceCreateSerializer
        return InvoiceDetailSerializer

    def _generate_pdf_after_save(self, invoice, request):
        """Regenerate PDF synchronously after every save."""
        try:
            from .tasks import generate_invoice_pdf
            generate_invoice_pdf(invoice.id)
        except Exception:
            pass

    def perform_create(self, serializer):
        instance = serializer.save()
        self._generate_pdf_after_save(instance, self.request)

    def perform_update(self, serializer):
        instance = serializer.save()
        self._generate_pdf_after_save(instance, self.request)

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Generate PDF synchronously."""
        invoice = self.get_object()

        try:
            from .tasks import generate_invoice_pdf
            # Run synchronously (without .delay()) for immediate result
            result = generate_invoice_pdf(invoice.id)

            if result.get('status') == 'success':
                invoice.refresh_from_db()
                pdf_url = None
                if invoice.pdf_file:
                    pdf_url = request.build_absolute_uri(invoice.pdf_file.url)
                return Response({
                    'message': 'PDF generated successfully',
                    'invoice_id': invoice.id,
                    'reference': invoice.reference,
                    'pdf_url': pdf_url
                })
            else:
                return Response({
                    'error': result.get('reason', 'PDF generation failed')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """Send invoice to customer via email."""
        invoice = self.get_object()

        if not invoice.customer.email:
            return Response(
                {'error': 'Customer has no email address'},
                status=status.HTTP_400_BAD_REQUEST
            )

        from .tasks import send_invoice_email
        send_invoice_email.delay(invoice.id)

        return Response({
            'message': 'Email queued for delivery',
            'invoice_id': invoice.id,
            'email': invoice.customer.email
        })

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark all installments as paid and set invoice to paid."""
        invoice = self.get_object()
        today = timezone.now().date()
        invoice.installments.filter(status='pending').update(status='paid', paid_date=today)
        invoice.sync_installment_status()
        invoice.save()
        serializer = InvoiceDetailSerializer(invoice, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a payment against the oldest unpaid installment."""
        invoice = self.get_object()
        amount = request.data.get('amount')

        if amount is None:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

        unpaid = invoice.installments.filter(status='pending').order_by('order', 'id')
        remaining = amount
        for inst in unpaid:
            if remaining <= 0:
                break
            if remaining >= inst.total:
                inst.status = 'paid'
                inst.paid_date = timezone.now().date()
                inst.save(update_fields=['status', 'paid_date'])
                remaining -= inst.total

        invoice.sync_installment_status()
        invoice.save()

        serializer = InvoiceDetailSerializer(invoice, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Quick status update."""
        invoice = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = dict(Invoice.STATUS_CHOICES).keys()
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Valid options: {list(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        invoice.status = new_status
        if new_status == 'paid' and not invoice.paid_at:
            invoice.paid_at = timezone.now()
            today = timezone.now().date()
            invoice.installments.all().update(status='paid', paid_date=today)
        invoice.save()

        serializer = InvoiceDetailSerializer(invoice, context={'request': request})
        return Response(serializer.data)

    # ── Installment actions ───────────────────────────────────────────────

    @action(detail=True, methods=['post'], url_path='installments')
    def add_installment(self, request, pk=None):
        """Add a new installment to this invoice."""
        invoice = self.get_object()
        serializer = InvoiceInstallmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        installment = serializer.save(invoice=invoice)
        invoice.save()  # Recalculate totals
        return Response(
            InvoiceInstallmentSerializer(installment, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=['patch'], url_path='installments/(?P<installment_id>[^/.]+)')
    def update_installment(self, request, pk=None, installment_id=None):
        """Update an installment (title, dates, line items)."""
        invoice = self.get_object()
        installment = get_object_or_404(InvoiceInstallment, id=installment_id, invoice=invoice)
        serializer = InvoiceInstallmentCreateSerializer(installment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        installment = serializer.save()
        invoice.save()  # Recalculate totals
        return Response(InvoiceInstallmentSerializer(installment, context={'request': request}).data)

    @action(detail=True, methods=['delete'], url_path='installments/(?P<installment_id>[^/.]+)')
    def remove_installment(self, request, pk=None, installment_id=None):
        """Delete an installment (not allowed if it's the last one)."""
        invoice = self.get_object()
        if invoice.installments.count() <= 1:
            return Response(
                {'error': 'Cannot delete the last installment. An invoice must have at least one.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        installment = get_object_or_404(InvoiceInstallment, id=installment_id, invoice=invoice)
        installment.delete()
        invoice.save()  # Recalculate totals
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'],
            url_path='installments/(?P<installment_id>[^/.]+)/mark_paid')
    def mark_installment_paid(self, request, pk=None, installment_id=None):
        """Mark a single installment as paid."""
        invoice = self.get_object()
        installment = get_object_or_404(InvoiceInstallment, id=installment_id, invoice=invoice)
        installment.status = 'paid'
        installment.paid_date = timezone.now().date()
        installment.save(update_fields=['status', 'paid_date'])
        invoice.sync_installment_status()
        invoice.save()
        self._generate_pdf_after_save(invoice, request)
        return Response(InvoiceInstallmentSerializer(installment, context={'request': request}).data)

    @action(detail=True, methods=['post'],
            url_path='installments/(?P<installment_id>[^/.]+)/generate_receipt')
    def generate_installment_receipt(self, request, pk=None, installment_id=None):
        """Generate a per-installment receipt PDF."""
        invoice = self.get_object()
        installment = get_object_or_404(InvoiceInstallment, id=installment_id, invoice=invoice)
        if installment.status != 'paid':
            return Response(
                {'error': 'Receipt can only be generated for paid installments.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            from .tasks import generate_installment_receipt_pdf
            result = generate_installment_receipt_pdf(installment.id)
            if result.get('status') == 'success':
                installment.refresh_from_db()
                receipt_url = None
                if installment.receipt_pdf_file:
                    receipt_url = request.build_absolute_uri(installment.receipt_pdf_file.url)
                return Response({'message': 'Receipt generated', 'receipt_url': receipt_url})
            return Response({'error': result.get('reason', 'Generation failed')},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='generate_receipt')
    def generate_invoice_receipt(self, request, pk=None):
        """Generate a master invoice receipt PDF."""
        invoice = self.get_object()
        try:
            from .tasks import generate_invoice_receipt_pdf
            result = generate_invoice_receipt_pdf(invoice.id)
            if result.get('status') == 'success':
                invoice.refresh_from_db()
                receipt_url = None
                if invoice.receipt_pdf_file:
                    receipt_url = request.build_absolute_uri(invoice.receipt_pdf_file.url)
                return Response({'message': 'Receipt generated', 'receipt_url': receipt_url})
            return Response({'error': result.get('reason', 'Generation failed')},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get invoice statistics."""
        total = Invoice.objects.count()
        by_status = {}

        for status_key, status_label in Invoice.STATUS_CHOICES:
            by_status[status_key] = Invoice.objects.filter(status=status_key).count()

        # Calculate totals
        total_value = Invoice.objects.aggregate(
            total_value=models.Sum('total')
        )['total_value'] or 0

        paid_value = Invoice.objects.filter(status='paid').aggregate(
            total_value=models.Sum('total')
        )['total_value'] or 0

        outstanding = Invoice.objects.filter(
            status__in=['sent', 'overdue', 'partial']
        ).aggregate(
            total_value=models.Sum('total')
        )['total_value'] or 0

        return Response({
            'total': total,
            'by_status': by_status,
            'total_value': float(total_value),
            'paid_value': float(paid_value),
            'outstanding': float(outstanding),
        })


# ==================== PUBLIC INVOICE VIEW ====================

class PublicInvoiceView(APIView):
    """
    Public endpoint for viewing invoices by reference.
    No authentication required.
    """
    permission_classes = [AllowAny]

    def get(self, request, reference):
        invoice = get_object_or_404(
            Invoice.objects.select_related('customer').prefetch_related('installments__line_items'),
            reference=reference
        )
        serializer = PublicInvoiceSerializer(invoice, context={'request': request})
        return Response(serializer.data)


# ==================== ESTIMATE VIEWSET ====================

class EstimateViewSet(viewsets.ModelViewSet):
    """ViewSet for estimate management."""
    queryset = Estimate.objects.select_related('customer').prefetch_related('line_items', 'photos')
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['visit_status', 'financial_status', 'customer']

    def get_serializer_class(self):
        if self.action == 'list':
            return EstimateListSerializer
        return EstimateSerializer

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        """Upload a photo for this estimate."""
        estimate = self.get_object()
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        photo = EstimatePhoto.objects.create(
            estimate=estimate,
            image=image,
            caption=request.data.get('caption', ''),
        )
        serializer = EstimatePhotoSerializer(photo, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='photos/(?P<photo_id>[^/.]+)')
    def delete_photo(self, request, pk=None, photo_id=None):
        """Delete a photo from this estimate."""
        estimate = self.get_object()
        photo = get_object_or_404(EstimatePhoto, id=photo_id, estimate=estimate)
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def convert_to_quote(self, request, pk=None):
        """Convert this estimate to a quote."""
        estimate = self.get_object()
        from datetime import timedelta

        expires_at = (timezone.now() + timedelta(days=30)).date()

        quote = Quote.objects.create(
            title=estimate.title,
            customer=estimate.customer,
            expires_at=expires_at,
            discount_amount=estimate.discount_amount,
            tax_rate=estimate.tax_rate,
        )

        for item in estimate.line_items.all():
            LineItem.objects.create(
                quote=quote,
                name=item.name,
                description=item.description,
                quantity=item.quantity,
                unit_price=item.unit_price,
                order=item.order,
            )

        quote.save()

        estimate.quote = quote
        estimate.save(update_fields=['quote'])

        serializer = QuoteDetailSerializer(quote, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get estimate statistics."""
        total = Estimate.objects.count()
        pending = Estimate.objects.filter(visit_status__in=['not_scheduled', 'scheduled']).count()
        by_visit_status = {}
        for key, _ in Estimate.VISIT_STATUS_CHOICES:
            by_visit_status[key] = Estimate.objects.filter(visit_status=key).count()
        by_financial_status = {}
        for key, _ in Estimate.FINANCIAL_STATUS_CHOICES:
            by_financial_status[key] = Estimate.objects.filter(financial_status=key).count()

        return Response({
            'total': total,
            'pending': pending,
            'by_visit_status': by_visit_status,
            'by_financial_status': by_financial_status,
        })


# ==================== DEAL VIEWSET ====================

class DealViewSet(viewsets.ModelViewSet):
    """ViewSet for pipeline deal management."""
    permission_classes = [IsAdminOrQuotesManager]
    pagination_class = None
    serializer_class = DealSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['stage', 'customer', 'is_archived']

    def get_queryset(self):
        is_archived = self.request.query_params.get('is_archived', '').lower()
        if is_archived == 'true':
            return Deal.objects.select_related('customer').filter(is_archived=True)
        return Deal.objects.select_related('customer').filter(is_archived=False)

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Archive a deal."""
        deal = self.get_object()
        deal.is_archived = True
        deal.archived_at = timezone.now()
        deal.save(update_fields=['is_archived', 'archived_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        """Unarchive a deal."""
        deal = Deal.objects.get(pk=pk)
        deal.is_archived = False
        deal.archived_at = None
        deal.save(update_fields=['is_archived', 'archived_at'])
        serializer = DealSerializer(deal, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def hard_delete(self, request, pk=None):
        """Permanently delete a deal."""
        deal = Deal.objects.get(pk=pk)
        deal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Mark a deal as customer-reviewed."""
        deal = self.get_object()
        deal.is_reviewed = True
        deal.reviewed_at = timezone.now()
        deal.save(update_fields=['is_reviewed', 'reviewed_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def unreview(self, request, pk=None):
        """Remove the customer-reviewed mark from a deal."""
        deal = Deal.objects.get(pk=pk)
        deal.is_reviewed = False
        deal.reviewed_at = None
        deal.save(update_fields=['is_reviewed', 'reviewed_at'])
        serializer = DealSerializer(deal, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def reviewed_list(self, request):
        """List all reviewed (but not archived) deals."""
        qs = Deal.objects.select_related('customer').filter(is_reviewed=True, is_archived=False)
        serializer = DealSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def archived_list(self, request):
        """List all archived deals."""
        customer_id = request.query_params.get('customer')
        qs = Deal.objects.select_related('customer').filter(is_archived=True)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        serializer = DealSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_stage(self, request, pk=None):
        """Update the stage of a deal."""
        deal = self.get_object()
        new_stage = request.data.get('stage')
        new_order = request.data.get('order')

        valid_stages = dict(Deal.STAGE_CHOICES).keys()
        if new_stage not in valid_stages:
            return Response(
                {'error': f'Invalid stage. Valid options: {list(valid_stages)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deal.stage = new_stage
        if new_order is not None:
            deal.order = new_order
        deal.save()

        serializer = DealSerializer(deal, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def estimate_visits(self, request, pk=None):
        """List or create estimate visits for a deal."""
        deal = self.get_object()
        if request.method == 'GET':
            visits = deal.estimate_visits.prefetch_related('photos').all()
            serializer = EstimateVisitSerializer(visits, many=True, context={'request': request})
            return Response(serializer.data)
        else:
            data = request.data.copy()
            data['deal'] = deal.id
            serializer = EstimateVisitSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'])
    def appointments(self, request, pk=None):
        """List or create appointments for a deal."""
        deal = self.get_object()
        if request.method == 'GET':
            appts = deal.appointments.all()
            serializer = AppointmentSerializer(appts, many=True, context={'request': request})
            return Response(serializer.data)
        else:
            data = request.data.copy()
            data['deal'] = deal.id
            serializer = AppointmentSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==================== ESTIMATE VISIT VIEWSET ====================

class EstimateVisitViewSet(viewsets.ModelViewSet):
    """ViewSet for estimate visit management."""
    queryset = EstimateVisit.objects.select_related('deal__customer').prefetch_related('photos')
    permission_classes = [IsAdminOrQuotesManager]
    serializer_class = EstimateVisitSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['deal', 'status']

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        """Upload a photo for this estimate visit."""
        visit = self.get_object()
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

        photo = EstimateVisitPhoto.objects.create(
            visit=visit,
            image=image,
            caption=request.data.get('caption', ''),
        )
        serializer = EstimateVisitPhotoSerializer(photo, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='photos/(?P<photo_id>[^/.]+)')
    def delete_photo(self, request, pk=None, photo_id=None):
        """Delete a photo from this estimate visit."""
        visit = self.get_object()
        photo = get_object_or_404(EstimateVisitPhoto, id=photo_id, visit=visit)
        photo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==================== APPOINTMENT VIEWSET ====================

class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet for appointment management."""
    queryset = Appointment.objects.select_related('deal__customer').prefetch_related('days')
    permission_classes = [IsAdminOrQuotesManager]
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['deal', 'status', 'appointment_type']


# ==================== CUSTOM JOB TYPE / LEAD SOURCE VIEWSETS ====================

class CustomJobTypeViewSet(viewsets.ModelViewSet):
    """CRUD for dynamic job types."""
    queryset = CustomJobType.objects.all()
    permission_classes = [IsAdminUser]
    serializer_class = CustomJobTypeSerializer


class CustomLeadSourceViewSet(viewsets.ModelViewSet):
    """CRUD for dynamic lead sources."""
    queryset = CustomLeadSource.objects.all()
    permission_classes = [IsAdminUser]
    serializer_class = CustomLeadSourceSerializer


# ==================== QUOTES PORTAL ====================

from rest_framework.permissions import BasePermission


class IsQuotesManager(BasePermission):
    """Allows access only to authenticated quotes portal users."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated and request.user.is_active):
            return False
        try:
            return request.user.profile.is_quotes_manager
        except Exception:
            return False


# Name of the system-owned placeholder customer used for all portal quotes.
# This customer is not shown in the CRM and never appears in customer-facing lists.
_PORTAL_PLACEHOLDER_NAME = '\u200bPortal Inbox'  # zero-width space prefix keeps it sorted to top


def _get_portal_placeholder_customer():
    """Get or create the system Portal Inbox customer (created once, reused forever)."""
    customer, _ = Customer.objects.get_or_create(
        name=_PORTAL_PLACEHOLDER_NAME,
        defaults={
            'phone': 'system',
            'notes': 'System placeholder for unlinked portal quotes. Do not edit.',
        },
    )
    return customer


class QuotesPortalViewSet(viewsets.ModelViewSet):
    """
    Quotes portal viewset — restricted to is_quotes_manager users.
    Portal users can list, create, retrieve, and update their quotes.
    Deletion is not permitted (admin only).
    The customer field is auto-assigned (Portal Inbox placeholder);
    the real customer + deal are linked later by an admin via link_to_deal.
    """
    permission_classes = [IsQuotesManager]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    def get_queryset(self):
        return Quote.objects.filter(created_via_portal=True).select_related('customer').prefetch_related('line_items')

    def get_serializer_class(self):
        if self.action == 'list':
            return QuoteListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return PortalQuoteCreateSerializer
        return QuoteDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("PORTAL QUOTE CREATE ERRORS:", serializer.errors)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        customer = _get_portal_placeholder_customer()
        instance = serializer.save(created_via_portal=True, customer=customer)
        try:
            from .tasks import generate_quote_pdf
            generate_quote_pdf(instance.id)
        except Exception:
            pass

    def perform_update(self, serializer):
        # Reset admin-edit flag when portal user edits the quote
        instance = serializer.save(edited_by_admin=False, admin_edited_at=None)
        try:
            from .tasks import generate_quote_pdf
            generate_quote_pdf(instance.id)
        except Exception:
            pass

    def destroy(self, request, *args, **kwargs):
        return Response(
            {'error': 'Quotes cannot be deleted from the portal.'},
            status=status.HTTP_403_FORBIDDEN
        )

    @action(detail=True, methods=['post'])
    def generate_pdf(self, request, pk=None):
        """Generate/regenerate PDF for a portal quote."""
        quote = self.get_object()
        try:
            from .tasks import generate_quote_pdf
            result = generate_quote_pdf(quote.id)
            if result.get('status') == 'success':
                quote.refresh_from_db()
                pdf_url = None
                if quote.pdf_file:
                    pdf_url = request.build_absolute_uri(quote.pdf_file.url)
                return Response({
                    'message': 'PDF generated successfully',
                    'quote_id': quote.id,
                    'pdf_url': pdf_url,
                })
            else:
                return Response(
                    {'error': result.get('reason', 'PDF generation failed')},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def send_email(self, request, pk=None):
        """Send quote to customer via email (portal)."""
        quote = self.get_object()
        if not quote.customer.email:
            return Response(
                {'error': 'Customer has no email address'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        from .tasks import send_quote_email
        send_quote_email.delay(quote.id)
        return Response({
            'message': 'Email queued for delivery',
            'quote_id': quote.id,
            'email': quote.customer.email,
        })


class PortalCustomerSearchView(APIView):
    """Customer search endpoint for quotes portal users."""

    permission_classes = [IsQuotesManager]

    def get(self, request):
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])

        customers = Customer.objects.filter(is_archived=False).filter(
            models.Q(name__icontains=query) |
            models.Q(email__icontains=query) |
            models.Q(phone__icontains=query)
        )[:10]

        serializer = CustomerSerializer(customers, many=True, context={'request': request})
        return Response(serializer.data)


class PortalCustomerCreateView(APIView):
    """Create a customer from the quotes portal."""

    permission_classes = [IsQuotesManager]

    def post(self, request):
        serializer = CustomerCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()
        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)
