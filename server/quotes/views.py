"""
Views and ViewSets for the Quote Generator and Invoice system.
"""
from decimal import Decimal
from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import CompanySettings, Customer, Quote, LineItem, Invoice, InvoiceLineItem
from .serializers import (
    CompanySettingsSerializer,
    CustomerSerializer, CustomerCreateSerializer,
    QuoteListSerializer, QuoteDetailSerializer, QuoteCreateSerializer,
    InvoiceListSerializer, InvoiceDetailSerializer, InvoiceCreateSerializer,
    PublicQuoteSerializer, PublicInvoiceSerializer,
)


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
    - GET /api/customers/ - List all customers
    - POST /api/customers/ - Create customer
    - GET /api/customers/{id}/ - Get customer details
    - PATCH /api/customers/{id}/ - Update customer
    - DELETE /api/customers/{id}/ - Delete customer
    - GET /api/customers/search/?q= - Search customers
    """
    queryset = Customer.objects.all()
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CustomerCreateSerializer
        return CustomerSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search customers by name, email, or phone."""
        query = request.query_params.get('q', '')
        if len(query) < 2:
            return Response([])

        customers = Customer.objects.filter(
            models.Q(name__icontains=query) |
            models.Q(email__icontains=query) |
            models.Q(phone__icontains=query)
        )[:10]

        serializer = CustomerSerializer(customers, many=True, context={'request': request})
        return Response(serializer.data)


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
    filterset_fields = ['status', 'customer']

    def get_serializer_class(self):
        if self.action == 'list':
            return QuoteListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return QuoteCreateSerializer
        return QuoteDetailSerializer

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
            discount_amount=quote.discount_amount,
            tax_rate=quote.tax_rate,
            shipping_amount=quote.shipping_amount,
        )

        # Copy line items
        for item in quote.line_items.all():
            InvoiceLineItem.objects.create(
                invoice=invoice,
                name=item.name,
                description=item.description,
                quantity=Decimal('1.00') if item.is_service else item.quantity,
                unit_price=item.unit_price,
                order=item.order,
            )

        invoice.save()  # Recalculate totals

        serializer = InvoiceDetailSerializer(invoice, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
    queryset = Invoice.objects.select_related('customer', 'quote').prefetch_related('line_items')
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'customer']

    def get_serializer_class(self):
        if self.action == 'list':
            return InvoiceListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return InvoiceCreateSerializer
        return InvoiceDetailSerializer

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
        """Mark invoice as fully paid."""
        invoice = self.get_object()
        invoice.status = 'paid'
        invoice.paid_at = timezone.now()
        invoice.amount_paid = invoice.total
        invoice.save()

        serializer = InvoiceDetailSerializer(invoice, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a partial payment."""
        invoice = self.get_object()
        amount = request.data.get('amount')

        if amount is None:
            return Response(
                {'error': 'Amount is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            return Response(
                {'error': 'Invalid amount'},
                status=status.HTTP_400_BAD_REQUEST
            )

        invoice.amount_paid += amount

        # Check if fully paid
        if invoice.amount_paid >= invoice.total:
            invoice.status = 'paid'
            invoice.paid_at = timezone.now()

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
            invoice.amount_paid = invoice.total
        invoice.save()

        serializer = InvoiceDetailSerializer(invoice, context={'request': request})
        return Response(serializer.data)

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
            status__in=['sent', 'overdue']
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
            Invoice.objects.select_related('customer').prefetch_related('line_items'),
            reference=reference
        )
        serializer = PublicInvoiceSerializer(invoice, context={'request': request})
        return Response(serializer.data)
