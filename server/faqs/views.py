from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny

from .models import FAQ
from .serializers import FAQSerializer


class FAQViewSet(viewsets.ModelViewSet):
    serializer_class = FAQSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return FAQ.objects.all()
        return FAQ.objects.filter(is_active=True)
