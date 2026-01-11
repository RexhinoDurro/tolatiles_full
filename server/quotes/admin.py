"""
Django Admin configuration for the Quote Generator and Invoice system.
"""
from django.contrib import admin
from .models import CompanySettings, Customer, Quote, LineItem, Invoice, InvoiceLineItem


@admin.register(CompanySettings)
class CompanySettingsAdmin(admin.ModelAdmin):
    """Admin for company settings (singleton)."""
    list_display = ['company_name', 'sender_name', 'email', 'phone']
    fieldsets = (
        ('Sender Information', {
            'fields': ('sender_name', 'title', 'email', 'phone')
        }),
        ('Company Information', {
            'fields': ('company_name', 'company_address', 'company_logo')
        }),
    )

    def has_add_permission(self, request):
        # Only allow one instance (singleton)
        return not CompanySettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of the singleton
        return False


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    """Admin for customer management."""
    list_display = ['name', 'email', 'phone', 'quote_count', 'invoice_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'phone', 'address']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['name']

    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'phone', 'email')
        }),
        ('Address', {
            'fields': ('address',),
            'classes': ('collapse',)
        }),
        ('Internal', {
            'fields': ('notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def quote_count(self, obj):
        return obj.quotes.count()
    quote_count.short_description = 'Quotes'

    def invoice_count(self, obj):
        return obj.invoices.count()
    invoice_count.short_description = 'Invoices'


class LineItemInline(admin.TabularInline):
    """Inline editor for quote line items."""
    model = LineItem
    extra = 1
    fields = ['name', 'description', 'quantity', 'unit_price', 'order']
    ordering = ['order', 'id']


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    """Admin for quote management."""
    list_display = [
        'reference', 'title', 'customer', 'status',
        'total_display', 'created_at', 'expires_at'
    ]
    list_filter = ['status', 'created_at', 'expires_at', 'currency']
    search_fields = ['reference', 'title', 'customer__name', 'customer__email']
    readonly_fields = [
        'reference', 'subtotal', 'tax_amount', 'total',
        'pdf_generated_at', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'
    list_editable = ['status']
    inlines = [LineItemInline]
    ordering = ['-created_at']

    fieldsets = (
        ('Quote Information', {
            'fields': ('reference', 'title', 'customer', 'status')
        }),
        ('Dates', {
            'fields': ('expires_at', 'created_at', 'updated_at')
        }),
        ('Content', {
            'fields': ('comments_text', 'terms'),
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': (
                'currency', 'discount_percent', 'discount_amount',
                'tax_rate', 'shipping_amount'
            )
        }),
        ('Totals (Calculated)', {
            'fields': ('subtotal', 'tax_amount', 'total'),
            'classes': ('collapse',)
        }),
        ('PDF', {
            'fields': ('pdf_file', 'pdf_generated_at'),
            'classes': ('collapse',)
        }),
    )

    def total_display(self, obj):
        return f"${obj.total:,.2f}"
    total_display.short_description = 'Total'
    total_display.admin_order_field = 'total'

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # Recalculate totals after saving
        obj.calculate_totals()
        obj.save()


class InvoiceLineItemInline(admin.TabularInline):
    """Inline editor for invoice line items."""
    model = InvoiceLineItem
    extra = 1
    fields = ['name', 'description', 'quantity', 'unit_price', 'order']
    ordering = ['order', 'id']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Admin for invoice management."""
    list_display = [
        'reference', 'title', 'customer', 'status',
        'total_display', 'balance_due_display', 'due_date', 'created_at'
    ]
    list_filter = ['status', 'created_at', 'due_date', 'currency']
    search_fields = ['reference', 'title', 'customer__name', 'customer__email']
    readonly_fields = [
        'reference', 'subtotal', 'tax_amount', 'total',
        'balance_due', 'pdf_generated_at', 'created_at', 'updated_at'
    ]
    date_hierarchy = 'created_at'
    list_editable = ['status']
    inlines = [InvoiceLineItemInline]
    ordering = ['-created_at']

    fieldsets = (
        ('Invoice Information', {
            'fields': ('reference', 'title', 'customer', 'quote', 'status')
        }),
        ('Dates', {
            'fields': ('due_date', 'paid_at', 'created_at', 'updated_at')
        }),
        ('Content', {
            'fields': ('notes', 'payment_terms'),
            'classes': ('collapse',)
        }),
        ('Pricing', {
            'fields': (
                'currency', 'discount_amount',
                'tax_rate', 'shipping_amount', 'amount_paid'
            )
        }),
        ('Totals (Calculated)', {
            'fields': ('subtotal', 'tax_amount', 'total', 'balance_due'),
            'classes': ('collapse',)
        }),
        ('PDF', {
            'fields': ('pdf_file', 'pdf_generated_at'),
            'classes': ('collapse',)
        }),
    )

    def total_display(self, obj):
        return f"${obj.total:,.2f}"
    total_display.short_description = 'Total'
    total_display.admin_order_field = 'total'

    def balance_due_display(self, obj):
        return f"${obj.balance_due:,.2f}"
    balance_due_display.short_description = 'Balance Due'

    def balance_due(self, obj):
        return obj.balance_due

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        obj.calculate_totals()
        obj.save()
