from django.db import models


class ContactLead(models.Model):
    """Contact form submission model."""

    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('closed', 'Closed'),
    ]

    PROJECT_TYPE_CHOICES = [
        ('kitchen-backsplash', 'Kitchen Backsplash'),
        ('bathroom', 'Bathroom Tiles'),
        ('flooring', 'Flooring'),
        ('patio', 'Patio/Outdoor'),
        ('fireplace', 'Fireplace'),
        ('commercial', 'Commercial Project'),
        ('other', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    project_type = models.CharField(max_length=50, choices=PROJECT_TYPE_CHOICES)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True, help_text='Internal notes about this lead')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Lead'
        verbose_name_plural = 'Contact Leads'

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.project_type}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class LocalAdsLead(models.Model):
    """
    Lead from Google Local Services Ads (LSA).
    These leads come from phone calls or messages through Google's LSA platform.
    """

    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('closed', 'Closed'),
    ]

    LEAD_TYPE_CHOICES = [
        ('phone', 'Phone Call'),
        ('message', 'Message'),
    ]

    CHARGE_STATUS_CHOICES = [
        ('charged', 'Charged'),
        ('not_charged', 'Not Charged'),
    ]

    # Google LSA identifiers
    google_lead_id = models.CharField(
        max_length=255,
        unique=True,
        help_text='Unique lead ID from Google LSA'
    )

    # Customer information
    customer_phone = models.CharField(max_length=50)
    customer_name = models.CharField(max_length=200, blank=True)

    # Lead details
    job_type = models.CharField(max_length=200, help_text='Type of job/service requested')
    location = models.CharField(max_length=500, blank=True, help_text='Customer location/address')
    lead_type = models.CharField(max_length=20, choices=LEAD_TYPE_CHOICES)
    charge_status = models.CharField(max_length=20, choices=CHARGE_STATUS_CHOICES, default='not_charged')

    # Timestamps from Google
    lead_received = models.DateTimeField(help_text='When the lead was received from Google')
    last_activity = models.DateTimeField(help_text='Last activity timestamp from Google')

    # Content
    message = models.TextField(blank=True, help_text='Message content if lead type is message')
    call_duration = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Call duration in seconds if lead type is phone'
    )

    # Additional metadata from Google (JSON)
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional data from Google LSA API'
    )

    # Internal status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True, help_text='Internal notes about this lead')

    # Link to customer (optional, set when converted)
    customer = models.ForeignKey(
        'quotes.Customer',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='local_ads_leads',
        help_text='Customer created from this lead'
    )

    # System timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-lead_received']
        verbose_name = 'Local Ads Lead'
        verbose_name_plural = 'Local Ads Leads'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['charge_status']),
            models.Index(fields=['lead_received']),
            models.Index(fields=['google_lead_id']),
        ]

    def __str__(self):
        return f"{self.customer_phone} - {self.job_type} ({self.lead_received.strftime('%Y-%m-%d')})"

    def convert_to_customer(self):
        """
        Convert this lead to a Customer record.
        Returns the created/existing Customer instance.
        """
        from quotes.models import Customer

        if self.customer:
            return self.customer

        # Create customer from lead data
        customer = Customer.objects.create(
            name=self.customer_name or f"Customer {self.customer_phone}",
            phone=self.customer_phone,
            address=self.location,
            notes=f"Converted from Local Ads Lead #{self.id}\nJob Type: {self.job_type}\nLead Date: {self.lead_received.strftime('%Y-%m-%d %H:%M')}"
        )

        self.customer = customer
        self.status = 'closed'
        self.save()

        return customer
