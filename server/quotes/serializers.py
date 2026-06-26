"""
Serializers for the Quote Generator and Invoice system.
"""
from rest_framework import serializers
from .models import CompanySettings, Customer, CustomerPhoto, Quote, LineItem, Invoice, InvoiceInstallment, InvoiceLineItem, Estimate, EstimateLineItem, EstimatePhoto, Deal, EstimateVisit, EstimateVisitPhoto, Appointment, AppointmentDay, CustomJobType, CustomLeadSource


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
            'quote_count', 'invoice_count', 'created_at', 'updated_at',
            'is_archived', 'archived_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_archived', 'archived_at']

    def get_quote_count(self, obj):
        return obj.quotes.count()

    def get_invoice_count(self, obj):
        return obj.invoices.count()


class CustomerPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomerPhoto
        fields = ['id', 'image', 'image_url', 'caption', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class CustomerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating customers."""

    class Meta:
        model = Customer
        fields = ['id', 'name', 'phone', 'email', 'address', 'notes']
        read_only_fields = ['id']

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
    customer_name = serializers.CharField(source='display_customer_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    line_item_count = serializers.SerializerMethodField()

    class Meta:
        model = Quote
        fields = [
            'id', 'reference', 'title', 'customer', 'customer_name', 'customer_phone',
            'deal', 'status', 'total', 'currency', 'created_at', 'expires_at', 'timeline',
            'line_item_count', 'created_via_portal', 'edited_by_admin', 'admin_edited_at',
            'portal_contact_name',
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
            'id', 'reference', 'title', 'customer', 'deal',
            'created_at', 'updated_at', 'expires_at', 'timeline', 'status', 'currency',
            'comments_text', 'terms', 'payment_terms',
            'subtotal', 'discount_type', 'discount_amount', 'discount_percent',
            'tax_rate', 'tax_amount', 'shipping_amount', 'total',
            'line_items', 'pdf_file', 'pdf_url', 'pdf_generated_at',
            'pdf_version', 'pdf_versions', 'public_url', 'invoice_id',
            'created_via_portal', 'edited_by_admin', 'admin_edited_at',
            'portal_contact_name',
        ]
        read_only_fields = [
            'reference', 'subtotal', 'tax_amount', 'total',
            'pdf_file', 'pdf_generated_at', 'pdf_version', 'pdf_versions',
            'created_via_portal', 'edited_by_admin', 'admin_edited_at'
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
    deal_id = serializers.PrimaryKeyRelatedField(
        queryset=Deal.objects.all(),
        source='deal',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Quote
        fields = [
            'id', 'title', 'customer_id', 'deal_id', 'expires_at', 'timeline', 'currency',
            'comments_text', 'terms', 'payment_terms', 'discount_type', 'discount_amount', 'discount_percent',
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


class PortalQuoteCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating quotes via the quotes portal.
    Does NOT require customer_id — the viewset auto-assigns the portal placeholder customer.
    Accepts portal_contact_name to record who submitted the quote.
    """
    line_items = LineItemCreateSerializer(many=True)

    class Meta:
        model = Quote
        fields = [
            'id', 'title', 'portal_contact_name', 'expires_at', 'timeline', 'currency',
            'comments_text', 'terms', 'payment_terms', 'discount_type', 'discount_amount',
            'discount_percent', 'tax_rate', 'shipping_amount', 'line_items',
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
        quote.save()
        return quote

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if line_items_data is not None:
            instance.line_items.all().delete()
            for idx, item_data in enumerate(line_items_data):
                item_data['order'] = item_data.get('order', idx)
                LineItem.objects.create(quote=instance, **item_data)
        instance.save()
        return instance


# ==================== INVOICE SERIALIZERS ====================

class InvoiceLineItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceLineItem
        fields = ['id', 'name', 'description', 'quantity', 'unit_price', 'order', 'line_total']


class InvoiceLineItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLineItem
        fields = ['name', 'description', 'quantity', 'unit_price', 'order']


class InvoiceInstallmentSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemSerializer(many=True, read_only=True)
    total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    receipt_url = serializers.SerializerMethodField()

    class Meta:
        model = InvoiceInstallment
        fields = [
            'id', 'title', 'order', 'start_date', 'due_date', 'paid_date',
            'status', 'notes', 'total', 'line_items',
            'receipt_pdf_file', 'receipt_url', 'receipt_generated_at',
        ]
        read_only_fields = ['receipt_pdf_file', 'receipt_generated_at']

    def get_receipt_url(self, obj):
        if obj.receipt_pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_pdf_file.url)
        return None


class InvoiceInstallmentCreateSerializer(serializers.ModelSerializer):
    line_items = InvoiceLineItemCreateSerializer(many=True, required=False)

    class Meta:
        model = InvoiceInstallment
        fields = ['id', 'title', 'order', 'start_date', 'due_date', 'notes', 'line_items']
        read_only_fields = ['id']

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items', [])
        installment = InvoiceInstallment.objects.create(**validated_data)
        for idx, item_data in enumerate(line_items_data):
            item_data['order'] = item_data.get('order', idx)
            InvoiceLineItem.objects.create(installment=installment, **item_data)
        return installment

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if line_items_data is not None:
            instance.line_items.all().delete()
            for idx, item_data in enumerate(line_items_data):
                item_data['order'] = item_data.get('order', idx)
                InvoiceLineItem.objects.create(installment=instance, **item_data)
        return instance


class InvoiceListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'reference', 'title', 'customer', 'customer_name', 'deal',
            'status', 'total', 'balance_due', 'due_date', 'created_at'
        ]


class InvoiceDetailSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    installments = InvoiceInstallmentSerializer(many=True, read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    pdf_url = serializers.SerializerMethodField()
    receipt_url = serializers.SerializerMethodField()
    public_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'id', 'reference', 'title', 'customer', 'deal', 'quote',
            'created_at', 'updated_at', 'due_date', 'paid_at',
            'status', 'currency', 'notes', 'payment_terms',
            'subtotal', 'discount_type', 'discount_amount', 'discount_percent',
            'tax_rate', 'tax_amount', 'shipping_amount', 'total',
            'amount_paid', 'balance_due',
            'installments',
            'pdf_file', 'pdf_url', 'pdf_generated_at',
            'pdf_version', 'pdf_versions',
            'receipt_pdf_file', 'receipt_url', 'receipt_generated_at',
            'public_url',
        ]
        read_only_fields = [
            'reference', 'subtotal', 'tax_amount', 'total', 'amount_paid',
            'pdf_file', 'pdf_generated_at', 'pdf_version', 'pdf_versions',
            'receipt_pdf_file', 'receipt_generated_at',
        ]

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                url = request.build_absolute_uri(obj.pdf_file.url)
                if obj.pdf_generated_at:
                    url = f"{url}?v={int(obj.pdf_generated_at.timestamp())}"
                return url
        return None

    def get_receipt_url(self, obj):
        if obj.receipt_pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.receipt_pdf_file.url)
        return None

    def get_public_url(self, obj):
        return obj.get_public_url()


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Create/update invoice with installments (each holding their own line items)."""
    installments = InvoiceInstallmentCreateSerializer(many=True, required=False)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(),
        source='customer',
        write_only=True,
    )
    deal_id = serializers.PrimaryKeyRelatedField(
        queryset=Deal.objects.all(),
        source='deal',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Invoice
        fields = [
            'id', 'title', 'customer_id', 'deal_id', 'due_date', 'currency',
            'notes', 'payment_terms',
            'discount_type', 'discount_amount', 'discount_percent',
            'tax_rate', 'shipping_amount',
            'installments',
        ]
        read_only_fields = ['id']

    def validate_installments(self, value):
        for inst in value:
            items = inst.get('line_items', [])
            if not items:
                raise serializers.ValidationError(
                    "Each installment must have at least one line item."
                )
        return value

    def _create_installments(self, invoice, installments_data):
        for idx, inst_data in enumerate(installments_data):
            line_items_data = inst_data.pop('line_items', [])
            inst_data['order'] = inst_data.get('order', idx)
            if 'title' not in inst_data:
                inst_data['title'] = f"Installment {idx + 1}"
            installment = InvoiceInstallment.objects.create(invoice=invoice, **inst_data)
            for item_idx, item_data in enumerate(line_items_data):
                item_data['order'] = item_data.get('order', item_idx)
                InvoiceLineItem.objects.create(installment=installment, **item_data)

    def create(self, validated_data):
        installments_data = validated_data.pop('installments', None)
        invoice = Invoice.objects.create(**validated_data)

        if installments_data:
            self._create_installments(invoice, installments_data)
        else:
            # Create a default empty installment
            InvoiceInstallment.objects.create(
                invoice=invoice,
                title='Installment 1',
                order=0,
                due_date=invoice.due_date,
            )

        invoice.save()
        return invoice

    def update(self, instance, validated_data):
        installments_data = validated_data.pop('installments', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if installments_data is not None:
            # Replace all installments (and their line items cascade-delete)
            instance.installments.all().delete()
            self._create_installments(instance, installments_data)

        instance.save()
        return instance


# ==================== PUBLIC SERIALIZERS ====================

class PublicQuoteSerializer(serializers.ModelSerializer):
    """Serializer for public quote view (limited fields)."""
    customer_name = serializers.CharField(source='display_customer_name', read_only=True)
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
    customer_name = serializers.CharField(source='display_customer_name', read_only=True)
    customer = CustomerSerializer(read_only=True)
    installments = InvoiceInstallmentSerializer(many=True, read_only=True)
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    company = serializers.SerializerMethodField()
    pdf_file = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            'reference', 'title', 'customer_name', 'customer',
            'created_at', 'due_date', 'status', 'currency',
            'notes', 'payment_terms',
            'subtotal', 'discount_type', 'discount_amount', 'discount_percent',
            'tax_rate', 'tax_amount',
            'shipping_amount', 'total', 'amount_paid', 'balance_due',
            'installments', 'company', 'pdf_file'
        ]

    def get_company(self, obj):
        company = CompanySettings.get_instance()
        return CompanySettingsSerializer(company).data

    def get_pdf_file(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                url = request.build_absolute_uri(obj.pdf_file.url)
                if obj.pdf_generated_at:
                    url = f"{url}?v={int(obj.pdf_generated_at.timestamp())}"
                return url
        return None


# ==================== ESTIMATE SERIALIZERS ====================

class EstimateLineItemSerializer(serializers.ModelSerializer):
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = EstimateLineItem
        fields = ['id', 'name', 'description', 'quantity', 'unit_price', 'order', 'line_total']


class EstimateLineItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstimateLineItem
        fields = ['name', 'description', 'quantity', 'unit_price', 'order']


class EstimatePhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = EstimatePhoto
        fields = ['id', 'image', 'image_url', 'caption', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class EstimateListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='display_customer_name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)

    class Meta:
        model = Estimate
        fields = [
            'id', 'reference', 'title', 'customer', 'customer_name', 'customer_phone',
            'scheduled_date', 'visit_status', 'financial_status', 'total', 'created_at',
        ]


class EstimateSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )
    line_items = EstimateLineItemSerializer(many=True, read_only=True)
    photos = EstimatePhotoSerializer(many=True, read_only=True)
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Estimate
        fields = [
            'id', 'reference', 'title', 'customer', 'customer_id',
            'scheduled_date', 'visit_status', 'visit_notes', 'job_address',
            'financial_status',
            'subtotal', 'discount_amount', 'tax_rate', 'tax_amount', 'total',
            'quote', 'pdf_file', 'pdf_url', 'pdf_generated_at',
            'line_items', 'photos', 'created_at', 'updated_at',
        ]
        read_only_fields = ['reference', 'subtotal', 'tax_amount', 'total', 'pdf_file', 'pdf_generated_at']

    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
        return None

    def create(self, validated_data):
        line_items_data = validated_data.pop('line_items', [])
        estimate = Estimate.objects.create(**validated_data)
        for idx, item_data in enumerate(line_items_data):
            item_data['order'] = item_data.get('order', idx)
            EstimateLineItem.objects.create(estimate=estimate, **item_data)
        estimate.save()
        return estimate

    def update(self, instance, validated_data):
        line_items_data = validated_data.pop('line_items', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if line_items_data is not None:
            instance.line_items.all().delete()
            for idx, item_data in enumerate(line_items_data):
                item_data['order'] = item_data.get('order', idx)
                EstimateLineItem.objects.create(estimate=instance, **item_data)
        instance.save()
        return instance


# ==================== DEAL SERIALIZERS ====================

class DealSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), source='customer', write_only=True
    )

    def get_customer_name(self, obj):
        return obj.customer.name if obj.customer_id else None

    def get_customer_phone(self, obj):
        return obj.customer.phone if obj.customer_id else None

    class Meta:
        model = Deal
        fields = [
            'id', 'customer', 'customer_id', 'customer_name', 'customer_phone',
            'stage', 'value', 'address', 'job_type', 'estimated_sqft', 'lead_source',
            'notes', 'reason', 'order', 'created_at', 'updated_at',
            'is_archived', 'archived_at', 'is_reviewed', 'reviewed_at',
        ]
        read_only_fields = ['customer', 'created_at', 'updated_at', 'is_archived', 'archived_at', 'is_reviewed', 'reviewed_at']


# ==================== CUSTOM JOB TYPE / LEAD SOURCE SERIALIZERS ====================

class CustomJobTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomJobType
        fields = ['id', 'name', 'slug', 'order', 'is_active']


class CustomLeadSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomLeadSource
        fields = ['id', 'name', 'slug', 'order', 'is_active']


# ==================== ESTIMATE VISIT SERIALIZERS ====================

class EstimateVisitPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = EstimateVisitPhoto
        fields = ['id', 'image', 'image_url', 'caption', 'uploaded_at']
        read_only_fields = ['uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class EstimateVisitSerializer(serializers.ModelSerializer):
    photos = EstimateVisitPhotoSerializer(many=True, read_only=True)

    class Meta:
        model = EstimateVisit
        fields = ['id', 'deal', 'title', 'scheduled_date', 'status', 'notes', 'photos', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


# ==================== APPOINTMENT SERIALIZERS ====================

class AppointmentDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentDay
        fields = ['id', 'date', 'start_time', 'end_time']


class AppointmentSerializer(serializers.ModelSerializer):
    days = AppointmentDaySerializer(many=True, required=False)

    class Meta:
        model = Appointment
        fields = [
            'id', 'deal', 'title', 'scheduled_date', 'start_date', 'end_date',
            'appointment_type', 'status', 'notes', 'days', 'created_at', 'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def create(self, validated_data):
        days_data = validated_data.pop('days', [])
        appointment = Appointment.objects.create(**validated_data)
        for day_data in days_data:
            AppointmentDay.objects.create(appointment=appointment, **day_data)
        return appointment

    def update(self, instance, validated_data):
        days_data = validated_data.pop('days', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if days_data is not None:
            instance.days.all().delete()
            for day_data in days_data:
                AppointmentDay.objects.create(appointment=instance, **day_data)
        return instance
