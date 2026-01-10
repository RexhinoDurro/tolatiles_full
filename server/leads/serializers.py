from rest_framework import serializers
from .models import ContactLead


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
