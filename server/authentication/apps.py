from django.apps import AppConfig


class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'

    def ready(self):
        from django.contrib.auth.models import User
        from django.db.models.signals import post_save
        from django.dispatch import receiver
        from .models import UserProfile

        @receiver(post_save, sender=User)
        def create_user_profile(sender, instance, created, **kwargs):
            try:
                UserProfile.objects.get_or_create(user=instance)
            except Exception:
                pass  # Migration not yet applied — safe to skip
