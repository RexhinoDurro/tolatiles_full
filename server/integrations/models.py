from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from cryptography.fernet import Fernet
import base64
import hashlib


def get_encryption_key():
    """Derive a Fernet key from Django's SECRET_KEY."""
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return base64.urlsafe_b64encode(key)


class GoogleSearchConsoleCredential(models.Model):
    """
    Stores encrypted Google OAuth credentials for Search Console API access.
    Uses a singleton pattern - only one active credential per account.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='search_console_credential'
    )

    # Encrypted tokens
    _refresh_token = models.TextField(
        db_column='refresh_token',
        blank=True,
        null=True
    )
    _access_token = models.TextField(
        db_column='access_token',
        blank=True,
        null=True
    )

    # Token metadata
    token_expiry = models.DateTimeField(null=True, blank=True)
    scope = models.CharField(max_length=500, default='https://www.googleapis.com/auth/webmasters.readonly')

    # Connection status
    is_connected = models.BooleanField(default=False)
    connected_email = models.EmailField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Google Search Console Credential'
        verbose_name_plural = 'Google Search Console Credentials'

    def __str__(self):
        return f"Search Console - {self.connected_email or 'Not connected'}"

    def _encrypt(self, value):
        """Encrypt a value using Fernet encryption."""
        if not value:
            return None
        fernet = Fernet(get_encryption_key())
        return fernet.encrypt(value.encode()).decode()

    def _decrypt(self, value):
        """Decrypt a value using Fernet encryption."""
        if not value:
            return None
        fernet = Fernet(get_encryption_key())
        return fernet.decrypt(value.encode()).decode()

    @property
    def refresh_token(self):
        return self._decrypt(self._refresh_token)

    @refresh_token.setter
    def refresh_token(self, value):
        self._refresh_token = self._encrypt(value)

    @property
    def access_token(self):
        return self._decrypt(self._access_token)

    @access_token.setter
    def access_token(self, value):
        self._access_token = self._encrypt(value)

    def clear_tokens(self):
        """Clear all tokens and mark as disconnected."""
        self._refresh_token = None
        self._access_token = None
        self.token_expiry = None
        self.is_connected = False
        self.connected_email = None
        self.save()


class GoogleAdsCredential(models.Model):
    """
    Stores encrypted Google OAuth credentials for Google Ads API access.
    Used for fetching Local Services Ads leads.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='google_ads_credential'
    )

    # Encrypted tokens
    _refresh_token = models.TextField(
        db_column='ads_refresh_token',
        blank=True,
        null=True
    )
    _access_token = models.TextField(
        db_column='ads_access_token',
        blank=True,
        null=True
    )

    # Token metadata
    token_expiry = models.DateTimeField(null=True, blank=True)

    # Connection status
    is_connected = models.BooleanField(default=False)
    connected_email = models.EmailField(blank=True, null=True)

    # Last sync info
    last_sync_at = models.DateTimeField(null=True, blank=True)
    last_sync_status = models.CharField(max_length=50, blank=True)
    last_sync_count = models.IntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Google Ads Credential'
        verbose_name_plural = 'Google Ads Credentials'

    def __str__(self):
        return f"Google Ads - {self.connected_email or 'Not connected'}"

    def _encrypt(self, value):
        """Encrypt a value using Fernet encryption."""
        if not value:
            return None
        fernet = Fernet(get_encryption_key())
        return fernet.encrypt(value.encode()).decode()

    def _decrypt(self, value):
        """Decrypt a value using Fernet encryption."""
        if not value:
            return None
        fernet = Fernet(get_encryption_key())
        return fernet.decrypt(value.encode()).decode()

    @property
    def refresh_token(self):
        return self._decrypt(self._refresh_token)

    @refresh_token.setter
    def refresh_token(self, value):
        self._refresh_token = self._encrypt(value)

    @property
    def access_token(self):
        return self._decrypt(self._access_token)

    @access_token.setter
    def access_token(self, value):
        self._access_token = self._encrypt(value)

    def clear_tokens(self):
        """Clear all tokens and mark as disconnected."""
        self._refresh_token = None
        self._access_token = None
        self.token_expiry = None
        self.is_connected = False
        self.connected_email = None
        self.save()
