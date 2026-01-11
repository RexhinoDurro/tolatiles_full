"""
Models for the Quote Generator and Invoice system.
"""
import random
import string
from decimal import Decimal

from django.db import models
from django.utils import timezone


def generate_quote_reference():
    """Generate unique reference: YYYYMMDD-XXXXX"""
    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"{date_str}-{random_str}"


def generate_invoice_reference():
    """Generate unique reference: INV-YYYYMMDD-XXX"""
    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.digits, k=3))
    return f"INV-{date_str}-{random_str}"


class CompanySettings(models.Model):
    """
    Global company settings for quotes/invoices (singleton pattern).
    Only one instance should exist.
    """
    sender_name = models.CharField(max_length=100, help_text='Name of the person sending quotes')
    title = models.CharField(max_length=100, blank=True, help_text='Job title (e.g., Sales Representative)')
    email = models.EmailField(help_text='Contact email for quotes')
    phone = models.CharField(max_length=20, blank=True, help_text='Contact phone number')
    company_name = models.CharField(max_length=200, help_text='Company name')
    company_address = models.TextField(help_text='Full company address')
    company_logo = models.ImageField(upload_to='company/', blank=True, null=True, help_text='Company logo for PDFs')

    class Meta:
        verbose_name = 'Company Settings'
        verbose_name_plural = 'Company Settings'

    def save(self, *args, **kwargs):
        # Ensure only one instance exists (singleton pattern)
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_instance(cls):
        """Get or create the singleton instance."""
        obj, _ = cls.objects.get_or_create(pk=1, defaults={
            'sender_name': 'Meni Tola',
            'email': 'contact@tolatiles.com',
            'phone': '+1 904-866-1738',
            'company_name': 'TolaTiles Inc',
            'company_address': '445 Hutchinson Ln, St. Augustine, FL 32095, United States',
        })
        return obj

    def __str__(self):
        return self.company_name


class Customer(models.Model):
    """Customer information for quotes and invoices."""
    name = models.CharField(max_length=200, help_text='Customer name or company name')
    phone = models.CharField(max_length=20, help_text='Primary phone number')
    email = models.EmailField(blank=True, help_text='Email address for sending quotes')
    address = models.TextField(blank=True, help_text='Full address')
    notes = models.TextField(blank=True, help_text='Internal notes about this customer')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return self.name


class Quote(models.Model):
    """Quote model with full details for professional quote generation."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('accepted', 'Accepted'),
        ('expired', 'Expired'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
    ]

    # Identifiers
    reference = models.CharField(
        max_length=20,
        unique=True,
        default=generate_quote_reference,
        editable=False,
        help_text='Auto-generated quote reference'
    )
    title = models.CharField(max_length=200, help_text='Quote title / project name')

    # Relations
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='quotes',
        help_text='Customer for this quote'
    )

    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateField(help_text='Quote expiration date')

    # Timeline
    timeline = models.CharField(
        max_length=100,
        blank=True,
        default='2-3 weeks',
        help_text='Project timeline (e.g., "2-3 weeks", "1 month")'
    )

    # Status & Currency
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')

    # Content sections
    comments_text = models.TextField(
        blank=True,
        help_text='Scope of work / comments section (supports multiple paragraphs)'
    )
    terms = models.JSONField(
        default=list,
        blank=True,
        help_text='Array of purchase terms (strings)'
    )

    # Totals (stored for performance, recalculated on save)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Fixed discount amount'
    )
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Percentage discount (0-100)'
    )
    tax_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Tax rate percentage (0-100)'
    )
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    shipping_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Shipping/delivery cost'
    )
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # PDF storage
    pdf_file = models.FileField(upload_to='quotes/', blank=True, null=True)
    pdf_generated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Quote'
        verbose_name_plural = 'Quotes'

    def __str__(self):
        return f"{self.reference} - {self.title}"

    def save(self, *args, **kwargs):
        # Recalculate totals before saving
        self.calculate_totals()
        # Check for expiration
        self.check_expiration()
        super().save(*args, **kwargs)

    def calculate_totals(self):
        """Recalculate all totals from line items."""
        # Sum line item totals (using line_total property which handles services)
        line_items = self.line_items.all() if self.pk else []
        self.subtotal = sum(
            (item.line_total for item in line_items),
            Decimal('0.00')
        )

        # Calculate discount
        if self.discount_percent > 0:
            self.discount_amount = self.subtotal * (self.discount_percent / 100)

        after_discount = self.subtotal - self.discount_amount

        # Calculate tax
        if self.tax_rate > 0:
            self.tax_amount = after_discount * (self.tax_rate / 100)
        else:
            self.tax_amount = Decimal('0.00')

        # Final total
        self.total = after_discount + self.tax_amount + self.shipping_amount

    def check_expiration(self):
        """Auto-expire if past expiration date and status is 'sent'."""
        if self.status == 'sent' and self.expires_at < timezone.now().date():
            self.status = 'expired'

    @property
    def is_expired(self):
        """Check if quote has expired."""
        return self.expires_at < timezone.now().date()

    def get_public_url(self):
        """Get the public shareable URL for this quote."""
        return f"/quotes/{self.reference}"


class LineItem(models.Model):
    """Line item for quotes - products or services with pricing."""
    quote = models.ForeignKey(
        Quote,
        on_delete=models.CASCADE,
        related_name='line_items'
    )
    name = models.CharField(max_length=200, help_text='Item/service name')
    description = models.TextField(blank=True, help_text='Detailed description')
    is_service = models.BooleanField(
        default=False,
        help_text='If True, this is a service (no quantity shown, uses flat price)'
    )
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('1.00'),
        help_text='Quantity (ignored if is_service is True)'
    )
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text='Price per unit (or flat price for services)'
    )
    detail_lines = models.JSONField(
        default=list,
        blank=True,
        help_text='Array of sub-detail strings (shown as smaller text below item)'
    )
    order = models.PositiveIntegerField(default=0, help_text='Display order')

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Line Item'
        verbose_name_plural = 'Line Items'

    @property
    def line_total(self):
        """Calculate line total (quantity * unit_price, or flat price for services)."""
        if self.is_service:
            return self.unit_price
        return self.quantity * self.unit_price

    def __str__(self):
        if self.is_service:
            return self.name
        return f"{self.name} x {self.quantity}"


# ==================== INVOICE MODELS ====================

class Invoice(models.Model):
    """Invoice model for billing customers."""

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
    ]

    # Identifiers
    reference = models.CharField(
        max_length=20,
        unique=True,
        default=generate_invoice_reference,
        editable=False,
        help_text='Auto-generated invoice reference'
    )
    title = models.CharField(max_length=200, help_text='Invoice title / project name')

    # Relations
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='invoices'
    )
    quote = models.ForeignKey(
        Quote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
        help_text='Original quote if created from one'
    )

    # Dates
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(help_text='Payment due date')
    paid_at = models.DateTimeField(blank=True, null=True, help_text='Date payment received')

    # Status & Currency
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')

    # Content
    notes = models.TextField(blank=True, help_text='Additional notes for customer')
    payment_terms = models.TextField(blank=True, help_text='Payment terms and instructions')

    # Totals
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Amount already paid'
    )

    # PDF storage
    pdf_file = models.FileField(upload_to='invoices/', blank=True, null=True)
    pdf_generated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"{self.reference} - {self.title}"

    def save(self, *args, **kwargs):
        self.calculate_totals()
        self.check_overdue()
        super().save(*args, **kwargs)

    def calculate_totals(self):
        """Recalculate all totals from line items."""
        line_items = self.line_items.all() if self.pk else []
        self.subtotal = sum(
            (item.quantity * item.unit_price for item in line_items),
            Decimal('0.00')
        )

        after_discount = self.subtotal - self.discount_amount

        if self.tax_rate > 0:
            self.tax_amount = after_discount * (self.tax_rate / 100)
        else:
            self.tax_amount = Decimal('0.00')

        self.total = after_discount + self.tax_amount + self.shipping_amount

    def check_overdue(self):
        """Mark as overdue if past due date and not paid."""
        if self.status == 'sent' and self.due_date < timezone.now().date():
            self.status = 'overdue'

    @property
    def balance_due(self):
        """Calculate remaining balance."""
        return self.total - self.amount_paid

    @property
    def is_overdue(self):
        """Check if invoice is overdue."""
        return self.status in ('sent', 'overdue') and self.due_date < timezone.now().date()

    def get_public_url(self):
        """Get the public shareable URL for this invoice."""
        return f"/invoices/{self.reference}"


class InvoiceLineItem(models.Model):
    """Line item for invoices."""
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='line_items'
    )
    name = models.CharField(max_length=200, help_text='Item/service name')
    description = models.TextField(blank=True, help_text='Detailed description')
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('1.00')
    )
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    order = models.PositiveIntegerField(default=0, help_text='Display order')

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Invoice Line Item'
        verbose_name_plural = 'Invoice Line Items'

    @property
    def line_total(self):
        """Calculate line total."""
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.name} x {self.quantity}"
