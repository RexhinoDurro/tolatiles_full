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
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Customer'
        verbose_name_plural = 'Customers'

    def __str__(self):
        return self.name


class CustomerPhoto(models.Model):
    """Photo attached to a customer profile."""
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='customers/photos/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Photo for {self.customer.name} ({self.id})"


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
    deal = models.ForeignKey(
        'Deal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='quotes',
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

    DISCOUNT_TYPE_CHOICES = [
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    ]

    # Totals (stored for performance, recalculated on save)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_type = models.CharField(
        max_length=10,
        choices=DISCOUNT_TYPE_CHOICES,
        default='percent',
        help_text='Whether discount is a percentage or fixed amount'
    )
    discount_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Fixed discount amount (used when discount_type=fixed)'
    )
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Percentage discount 0-100 (used when discount_type=percent)'
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

    # Pricing notes (visible to customer on PDF)
    payment_terms = models.TextField(
        blank=True,
        help_text='Pricing notes / payment terms shown to customer on the PDF'
    )

    # PDF storage with versioning
    pdf_file = models.FileField(upload_to='quotes/', blank=True, null=True)
    pdf_generated_at = models.DateTimeField(blank=True, null=True)
    pdf_version = models.PositiveIntegerField(default=1)
    pdf_versions = models.JSONField(default=list, blank=True)

    # Portal tracking
    created_via_portal = models.BooleanField(default=False, db_index=True)
    edited_by_admin = models.BooleanField(default=False)
    admin_edited_at = models.DateTimeField(null=True, blank=True)
    portal_contact_name = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text='Name entered by the portal user (not linked to a Customer record)',
    )

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
        line_items = self.line_items.all() if self.pk else []
        self.subtotal = sum(
            (item.line_total for item in line_items),
            Decimal('0.00')
        )

        if self.discount_type == 'percent':
            self.discount_amount = self.subtotal * (self.discount_percent / 100) if self.discount_percent > 0 else Decimal('0.00')
        # else: fixed — discount_amount is used as-is

        after_discount = self.subtotal - self.discount_amount

        if self.tax_rate > 0:
            self.tax_amount = after_discount * (self.tax_rate / 100)
        else:
            self.tax_amount = Decimal('0.00')

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

    @property
    def display_customer_name(self):
        """Return portal_contact_name if still assigned to Portal Inbox, otherwise real customer name."""
        if self.created_via_portal and self.customer.name.endswith('Portal Inbox'):
            return self.portal_contact_name or self.customer.name
        return self.customer.name


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
        ('partial', 'Partially Paid'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('EUR', 'Euro'),
    ]

    DISCOUNT_TYPE_CHOICES = [
        ('percent', 'Percentage'),
        ('fixed', 'Fixed Amount'),
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
    deal = models.ForeignKey(
        'Deal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoices',
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
    discount_type = models.CharField(
        max_length=10,
        choices=DISCOUNT_TYPE_CHOICES,
        default='fixed',
    )
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Percentage discount 0-100 (used when discount_type=percent)'
    )
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    shipping_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text='Sum of paid installments (auto-calculated)'
    )

    # PDF storage with versioning
    pdf_file = models.FileField(upload_to='invoices/', blank=True, null=True)
    pdf_generated_at = models.DateTimeField(blank=True, null=True)
    pdf_version = models.PositiveIntegerField(default=1)
    pdf_versions = models.JSONField(default=list, blank=True)

    # Receipt storage
    receipt_pdf_file = models.FileField(upload_to='receipts/invoices/', blank=True, null=True)
    receipt_generated_at = models.DateTimeField(blank=True, null=True)

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
        """Recalculate all totals from installment line items."""
        if self.pk:
            installments = list(self.installments.prefetch_related('line_items').all())
            subtotal = Decimal('0.00')
            amount_paid = Decimal('0.00')
            for inst in installments:
                inst_total = sum((item.line_total for item in inst.line_items.all()), Decimal('0.00'))
                subtotal += inst_total
                if inst.status == 'paid':
                    amount_paid += inst_total
            self.subtotal = subtotal
            self.amount_paid = amount_paid
        else:
            self.subtotal = Decimal('0.00')
            self.amount_paid = Decimal('0.00')

        if self.discount_type == 'percent':
            self.discount_amount = self.subtotal * (self.discount_percent / 100) if self.discount_percent > 0 else Decimal('0.00')
        # else: fixed — discount_amount used as-is

        after_discount = self.subtotal - self.discount_amount

        if self.tax_rate > 0:
            self.tax_amount = after_discount * (self.tax_rate / 100)
        else:
            self.tax_amount = Decimal('0.00')

        self.total = after_discount + self.tax_amount + self.shipping_amount

    def sync_installment_status(self):
        """Update invoice status to reflect installment payment state."""
        if not self.pk:
            return
        installments = list(self.installments.all())
        if not installments:
            return
        paid_count = sum(1 for i in installments if i.status == 'paid')
        total_count = len(installments)
        if paid_count == total_count and total_count > 0:
            self.status = 'paid'
            if not self.paid_at:
                self.paid_at = timezone.now()
        elif paid_count > 0:
            self.status = 'partial'
        # If no installments paid, preserve current status (draft/sent/overdue)

    def check_overdue(self):
        """Mark as overdue if past due date and not paid or partially paid."""
        if self.status == 'sent' and self.due_date < timezone.now().date():
            self.status = 'overdue'

    @property
    def balance_due(self):
        return self.total - self.amount_paid

    @property
    def is_overdue(self):
        return self.status in ('sent', 'overdue') and self.due_date < timezone.now().date()

    def get_public_url(self):
        return f"/invoices/{self.reference}"


class InvoiceInstallment(models.Model):
    """A payment phase within an invoice. Every invoice has at least one."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('overdue', 'Overdue'),
    ]

    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='installments'
    )
    title = models.CharField(max_length=200, default='Installment 1')
    order = models.PositiveIntegerField(default=0)
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    paid_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)

    # Receipt PDF for this specific installment payment
    receipt_pdf_file = models.FileField(upload_to='receipts/installments/', blank=True, null=True)
    receipt_generated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Invoice Installment'
        verbose_name_plural = 'Invoice Installments'

    @property
    def total(self):
        return sum((item.line_total for item in self.line_items.all()), Decimal('0.00'))

    def __str__(self):
        return f"{self.invoice.reference} — {self.title}"


class InvoiceLineItem(models.Model):
    """Line item belonging to an invoice installment."""
    installment = models.ForeignKey(
        InvoiceInstallment,
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
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.name} x {self.quantity}"


# ==================== ESTIMATE MODELS ====================

def generate_estimate_reference():
    """Generate unique reference: EST-YYYYMMDD-XXX"""
    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.digits, k=3))
    return f"EST-{date_str}-{random_str}"


class Estimate(models.Model):
    """Estimate combining site visit and financial document."""

    VISIT_STATUS_CHOICES = [
        ('not_scheduled', 'Not Scheduled'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    FINANCIAL_STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    reference = models.CharField(
        max_length=25,
        unique=True,
        default=generate_estimate_reference,
        editable=False,
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name='estimates',
    )
    title = models.CharField(max_length=200)

    # Visit details
    scheduled_date = models.DateTimeField(blank=True, null=True)
    visit_status = models.CharField(
        max_length=20, choices=VISIT_STATUS_CHOICES, default='not_scheduled'
    )
    visit_notes = models.TextField(blank=True)
    job_address = models.TextField(blank=True)

    # Financial status
    financial_status = models.CharField(
        max_length=20, choices=FINANCIAL_STATUS_CHOICES, default='draft'
    )

    # Totals
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Linked quote (set on convert)
    quote = models.ForeignKey(
        Quote,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='estimates',
    )

    # PDF
    pdf_file = models.FileField(upload_to='estimates/', blank=True, null=True)
    pdf_generated_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Estimate'
        verbose_name_plural = 'Estimates'

    def __str__(self):
        return f"{self.reference} - {self.title}"

    def save(self, *args, **kwargs):
        self.calculate_totals()
        super().save(*args, **kwargs)

    def calculate_totals(self):
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
        self.total = after_discount + self.tax_amount


class EstimateLineItem(models.Model):
    """Line item for estimates."""
    estimate = models.ForeignKey(
        Estimate,
        on_delete=models.CASCADE,
        related_name='line_items'
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('1.00'))
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    @property
    def line_total(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.name} x {self.quantity}"


class EstimatePhoto(models.Model):
    """Photo attached to an estimate site visit."""
    estimate = models.ForeignKey(
        Estimate,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    image = models.ImageField(upload_to='estimates/photos/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Photo for {self.estimate.reference}"


# ==================== DEAL (PIPELINE) MODEL ====================

class CustomJobType(models.Model):
    """Dynamic job type configurable via CRM settings."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Job Type'
        verbose_name_plural = 'Job Types'

    def __str__(self):
        return self.name


class CustomLeadSource(models.Model):
    """Dynamic lead source configurable via CRM settings."""
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Lead Source'
        verbose_name_plural = 'Lead Sources'

    def __str__(self):
        return self.name


class Deal(models.Model):
    """Deal / project container — central CRM entity."""

    STAGE_CHOICES = [
        ('new_deal', 'New Deal'),
        ('estimate_scheduled', 'Estimate Scheduled'),
        ('quote_sent', 'Quote Sent'),
        ('job_scheduled', 'Job Scheduled'),
        ('job_completed', 'Job Completed'),
        ('job_lost', 'Job Lost'),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='deals',
    )
    stage = models.CharField(max_length=30, choices=STAGE_CHOICES, default='new_deal')
    value = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    address = models.TextField(blank=True)
    job_type = models.CharField(max_length=100, blank=True)
    estimated_sqft = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    lead_source = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    reason = models.TextField(blank=True, help_text='Why was this deal won or lost')
    order = models.PositiveIntegerField(default=0, help_text='Within-column ordering')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    is_reviewed = models.BooleanField(default=False, db_index=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['stage', 'order', '-created_at']
        verbose_name = 'Deal'
        verbose_name_plural = 'Deals'

    def __str__(self):
        return f"{self.customer.name} — {self.job_type} ({self.get_stage_display()})"


class EstimateVisit(models.Model):
    """Site visit for a deal (estimate/inspection visit)."""

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='estimate_visits')
    title = models.CharField(max_length=200)
    scheduled_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_date']
        verbose_name = 'Estimate Visit'
        verbose_name_plural = 'Estimate Visits'

    def __str__(self):
        return f"{self.title} ({self.deal})"


class EstimateVisitPhoto(models.Model):
    """Photo attached to an estimate visit."""

    visit = models.ForeignKey(EstimateVisit, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='estimate_visits/photos/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Photo for {self.visit}"


class Appointment(models.Model):
    """General appointment (consultation, follow-up, etc.) for a deal."""

    TYPE_CHOICES = [
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up'),
        ('measurement', 'Measurement'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    deal = models.ForeignKey(Deal, on_delete=models.CASCADE, related_name='appointments', null=True, blank=True)
    title = models.CharField(max_length=200)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    appointment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='consultation')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_date', 'start_date']
        verbose_name = 'Appointment'
        verbose_name_plural = 'Appointments'

    def __str__(self):
        return f"{self.title} ({self.deal})"


class AppointmentDay(models.Model):
    """Per-day hours for a multi-day appointment."""

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='days')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)

    class Meta:
        ordering = ['date']
        verbose_name = 'Appointment Day'
        verbose_name_plural = 'Appointment Days'

    def __str__(self):
        return f"{self.appointment.title} — {self.date}"
