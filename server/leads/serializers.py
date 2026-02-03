from rest_framework import serializers
from .models import ContactLead, LocalAdsLead


class ContactLeadSerializer(serializers.ModelSerializer):
    """Full serializer for contact leads (admin view)."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = ContactLead
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'project_type',
            'message',
            'status',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class ContactLeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating contact leads (public form submission)."""

    class Meta:
        model = ContactLead
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'project_type',
            'message',
        ]

    def validate_email(self, value):
        """Validate email format."""
        return value.lower().strip()

    def validate_first_name(self, value):
        """Clean first name."""
        return value.strip().title()

    def validate_last_name(self, value):
        """Clean last name."""
        return value.strip().title()


class ContactLeadUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating contact lead status and notes."""

    class Meta:
        model = ContactLead
        fields = [
            'status',
            'notes',
        ]


# ============ Local Ads Lead Serializers ============

class LocalAdsLeadSerializer(serializers.ModelSerializer):
    """Full serializer for Local Ads leads (admin view)."""

    customer_id = serializers.PrimaryKeyRelatedField(
        source='customer',
        read_only=True
    )

    class Meta:
        model = LocalAdsLead
        fields = [
            'id',
            'google_lead_id',
            'customer_phone',
            'customer_name',
            'job_type',
            'location',
            'lead_type',
            'charge_status',
            'lead_received',
            'last_activity',
            'message',
            'call_duration',
            'metadata',
            'status',
            'notes',
            'customer_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'google_lead_id']


class LocalAdsLeadListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing Local Ads leads."""

    class Meta:
        model = LocalAdsLead
        fields = [
            'id',
            'customer_phone',
            'customer_name',
            'job_type',
            'location',
            'lead_type',
            'charge_status',
            'lead_received',
            'last_activity',
            'status',
            'created_at',
            'updated_at',
        ]


class LocalAdsLeadStatusSerializer(serializers.ModelSerializer):
    """Serializer for updating Local Ads lead status."""

    class Meta:
        model = LocalAdsLead
        fields = ['status']

    def validate_status(self, value):
        valid_statuses = [choice[0] for choice in LocalAdsLead.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError(
                f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        return value


class LocalAdsLeadConvertSerializer(serializers.Serializer):
    """Serializer for converting a Local Ads lead to a customer."""

    name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)


class LocalAdsLeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for manually creating Local Ads leads (admin only)."""

    class Meta:
        model = LocalAdsLead
        fields = [
            'customer_phone',
            'customer_name',
            'job_type',
            'location',
            'lead_type',
            'charge_status',
            'lead_received',
            'last_activity',
            'message',
            'call_duration',
            'status',
            'notes',
        ]

    def validate_customer_phone(self, value):
        """Clean phone number."""
        return value.strip()

    def validate_customer_name(self, value):
        """Clean customer name."""
        return value.strip().title() if value else ''

    def create(self, validated_data):
        """Create a manually-entered Local Ads lead."""
        import uuid
        from django.utils import timezone

        # Generate a unique google_lead_id for manual entries
        validated_data['google_lead_id'] = f"MANUAL-{uuid.uuid4().hex[:12].upper()}"

        # Set default timestamps if not provided
        if not validated_data.get('lead_received'):
            validated_data['lead_received'] = timezone.now()
        if not validated_data.get('last_activity'):
            validated_data['last_activity'] = validated_data['lead_received']

        return super().create(validated_data)


class ContactLeadAdminCreateSerializer(serializers.ModelSerializer):
    """Serializer for admin to manually create website leads."""

    class Meta:
        model = ContactLead
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'project_type',
            'message',
            'status',
            'notes',
        ]

    def validate_email(self, value):
        """Validate email format."""
        return value.lower().strip()

    def validate_first_name(self, value):
        """Clean first name."""
        return value.strip().title()

    def validate_last_name(self, value):
        """Clean last name."""
        return value.strip().title()
