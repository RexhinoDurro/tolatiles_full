"""
Serializers for the Quote Generator and Invoice system.
"""
from rest_framework import serializers
from .models import CompanySettings, Customer, Quote, LineItem, Invoice, InvoiceLineItem


class CompanySettingsSerializer(serializers.ModelSerializer):
    """Serializer for company settings (singleton)."""

    class Meta:
        model = CompanySettings
        fields = [
            'id', 'sender_name', 'title', 'email', 'phone',
            'company_name', 'company_address', 'company_logo'
        ]


# ==================== CUSTOMER SERIALIZERS ====================

class CustomerSerializer(serializers.ModelSerializer):
    """Full customer serializer with computed fields."""
    quote_count = serializers.SerializerMethodField()
    invoice_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'phone', 'email', 'address', 'notes',
            'quote_count', 'invoice_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_quote_count(self, obj):
        return obj.quotes.count()

    def get_invoice_count(self, obj):
        return obj.invoices.count()


class CustomerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating customers."""

    class Meta:
        model = Customer
        fields = ['name', 'phone', 'email', 'address', 'notes']

    def validate_name(self, value):
        return value.strip()

    def validate_email(self, value):
        if value:
            return value.lower().strip()
        return value


# ==================== LINE ITEM SERIALIZERS ====================

class LineItemSerializer(serializers.ModelSerializer):
    """Serializer for quote line items."""
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = LineItem
        fields = [
            'id', 'name', 'description', 'is_service', 'quantity', 'unit_price',
            'detail_lines', 'order', 'line_total'
        ]


class LineItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating line items (without quote FK)."""

    class Meta:
        model = LineItem
        fields = ['name', 'description', 'is_service', 'quantity', 'unit_price', 'detail_lines', 'order']


# ==================== QUOTE SERIALIZERS ====================

class QuoteListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for quote list views."""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    line_item_count = serializers.SerializerMethodField()

    class Meta:
        model = Quote
        fields = [
            'id', 'reference', 'title', 'customer', 'customer_name', 'customer_phone',
            'status', 'total', 'currency', 'created_at', 'expires_at', 'timeline', 'line_item_count'
        ]

    def get_line_item_count(self, obj):
        return obj.line_items.count()


class QuoteDetailSerializer(serializers.ModelSerializer):
    """Full serializer with nested data for detail views."""
    customer = CustomerSerializer(read_only=True)
    line_items = LineItemSerializer(many=True, read_only=True)
    pdf_url = serializers.SerializerMethodField()
    public_url = serializers.SerializerMethodField()
    invoice_id = serializers.SerializerMethodField()

    class Meta:
        model = Quote
        fields = [
            'id', 'reference', 'title', 'customer',
            'created_at', 'updated_at', 'expires_at', 'timeline', 'status', 'currency',
            'comments_text', 'terms',
            'subtotal', 'discount_amount', 'discount_percent',
            'tax_rate', 'tax_amount', 'shipping_amount', 'total',
            'line_items', 'pdf_file', 'pdf_url', 'pdf_generated_at', 'public_url', 'invoice_id'
        ]
        read_only_fields = [
            'reference', 'subtotal', 'tax_amount', 'total',
            'pdf_file', 'pdf_generated_at'
        ]

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None

    def get_public_url(self, obj):
        return obj.get_public_url()

    def get_invoice_id(self, obj):
        """Return the ID of the invoice if one exists for this quote."""
        invoice = obj.invoices.first()
        return invoice.id if invoice else None


class QuoteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating quotes with line items."""
    line_items = LineItemCreateSerializer(many=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source='customer',
        write_only=True
    )

    class Meta:
        model = Quote
        fields = [
            'id', 'title', 'customer_id', 'expires_at', 'timeline', 'currency',
            'comments_text', 'terms', 'discount_amount', 'discount_percent',
            'tax_rate', 'shipping_amount', 'line_items'
        ]
        read_only_fields = ['id']

    def validate_line_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "Please add at least one line item to the quote. "
                "Each item needs a name, quantity, and unit price."
            )
        return value

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        quote = Quote.objects.create(**validated_data)

        for idx, item_data in enumerate(line_items_data):
            item_data['order'] = item_data.get('order', idx)
            LineItem.objects.create(quote=quote, **item_data)

        # Recalculate totals
        quote.save()
        return quote

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)

        # Update quote fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Replace line items if provided
        if line_items_data is not None:
            instance.line_items.all().delete()
            for idx, item_data in enumerate(line_items_data):
                item_data['order'] = item_data.get('order', idx)
                LineItem.objects.create(quote=instance, **item_data)

        instance.save()
        return instance


# ==================== INVOICE SERIALIZERS ====================

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    """Serializer for invoice line items."""
    line_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'name', 'description', 'quantity', 'unit_price', 'order', 'line_total']


class InvoiceLineItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoice line items."""

    class Meta:
        model = InvoiceLineItem
        fields = ['name', 'description', 'quantity', 'unit_price', 'order']


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for invoice list views."""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'reference', 'title', 'customer', 'customer_name',
            'status', 'total', 'balance_due', 'due_date', 'created_at'
        ]


class InvoiceDetailSerializer(serializers.ModelSerializer):
    """Full serializer for invoice detail views."""
    customer = CustomerSerializer(read_only=True)
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    pdf_url = serializers.SerializerMethodField()
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'reference', 'title', 'customer', 'quote',
            'created_at', 'updated_at', 'due_date', 'paid_at',
            'status', 'currency', 'notes', 'payment_terms',
            'subtotal', 'discount_amount', 'tax_rate', 'tax_amount',
            'shipping_amount', 'total', 'amount_paid', 'balance_due',
            'line_items', 'pdf_file', 'pdf_url', 'pdf_generated_at', 'public_url'
        ]
        read_only_fields = [
            'reference', 'subtotal', 'tax_amount', 'total',
            'pdf_file', 'pdf_generated_at'
        ]

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None

    def get_public_url(self, obj):
        return obj.get_public_url()


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating invoices with line items."""
    line_items = InvoiceLineItemCreateSerializer(many=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source='customer',
        write_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            'id', 'title', 'customer_id', 'due_date', 'currency',
            'notes', 'payment_terms', 'discount_amount',
            'tax_rate', 'shipping_amount', 'line_items'
        ]
        read_only_fields = ['id']

    def validate_line_items(self, value):
        if not value:
            raise serializers.ValidationError(
                "Please add at least one line item to the invoice. "
                "Each item needs a name, quantity, and unit price."
            )
        return value

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items')
        invoice = Invoice.objects.create(**validated_data)

        for idx, item_data in enumerate(line_items_data):
            item_data['order'] = item_data.get('order', idx)
            InvoiceLineItem.objects.create(invoice=invoice, **item_data)

        invoice.save()
        return invoice

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if line_items_data is not None:
            instance.line_items.all().delete()
            for idx, item_data in enumerate(line_items_data):
                item_data['order'] = item_data.get('order', idx)
                InvoiceLineItem.objects.create(invoice=instance, **item_data)

        instance.save()
        return instance


# ==================== PUBLIC SERIALIZERS ====================

class PublicQuoteSerializer(serializers.ModelSerializer):
    """Serializer for public quote view (limited fields)."""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    line_items = LineItemSerializer(many=True, read_only=True)
    company = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Quote
        fields = [
            'reference', 'title', 'customer_name', 'customer_phone', 'customer_email',
            'created_at', 'expires_at', 'timeline', 'status', 'currency',
            'comments_text', 'terms',
            'subtotal', 'discount_amount', 'discount_percent',
            'tax_rate', 'tax_amount', 'shipping_amount', 'total',
            'line_items', 'company', 'pdf_url'
        ]

    def get_company(self, obj):
        company = CompanySettings.get_instance()
        return CompanySettingsSerializer(company).data

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None


class PublicInvoiceSerializer(serializers.ModelSerializer):
    """Serializer for public invoice view (limited fields)."""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer = CustomerSerializer(read_only=True)
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    company = serializers.SerializerMethodField()
    pdf_file = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'reference', 'title', 'customer_name', 'customer',
            'created_at', 'due_date', 'status', 'currency',
            'notes', 'payment_terms',
            'subtotal', 'discount_amount', 'tax_rate', 'tax_amount',
            'shipping_amount', 'total', 'amount_paid', 'balance_due',
            'line_items', 'company', 'pdf_file'
        ]

    def get_company(self, obj):
        company = CompanySettings.get_instance()
        return CompanySettingsSerializer(company).data

    def get_pdf_file(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None
