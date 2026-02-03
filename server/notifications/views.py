from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.conf import settings
from datetime import timedelta

from .models import Notification, PushSubscription, NotificationPreference, DailyStats
from .serializers import (
    NotificationSerializer,
    PushSubscriptionSerializer,
    NotificationPreferenceSerializer,
    DailyStatsSerializer
)


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing notifications."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a single notification as read."""
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read."""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'status': 'success', 'count': count})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications."""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'count': count})


class NotificationPreferenceView(APIView):
    """View for managing notification preferences."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get notification preferences."""
        prefs, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        serializer = NotificationPreferenceSerializer(prefs)
        return Response(serializer.data)

    def put(self, request):
        """Update notification preferences."""
        prefs, created = NotificationPreference.objects.get_or_create(
            user=request.user
        )
        serializer = NotificationPreferenceSerializer(prefs, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PushSubscriptionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing push subscriptions."""

    serializer_class = PushSubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']

    def get_queryset(self):
        return PushSubscription.objects.filter(user=self.request.user)

    @action(detail=False, methods=['delete'])
    def unsubscribe(self, request):
        """Unsubscribe from push notifications by endpoint."""
        endpoint = request.data.get('endpoint')
        if not endpoint:
            return Response(
                {'error': 'endpoint is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted, _ = PushSubscription.objects.filter(
            user=request.user,
            endpoint=endpoint
        ).delete()

        if deleted:
            return Response({'status': 'unsubscribed'})
        return Response(
            {'error': 'subscription not found'},
            status=status.HTTP_404_NOT_FOUND
        )


class VapidKeyView(APIView):
    """View to get VAPID public key for push subscriptions."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Return VAPID public key."""
        vapid_public_key = getattr(settings, 'VAPID_PUBLIC_KEY', None)
        if not vapid_public_key:
            return Response(
                {'error': 'Push notifications not configured'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        return Response({'public_key': vapid_public_key})


class DailyStatsView(APIView):
    """View for daily statistics - fetches real-time data from leads, quotes, invoices."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get daily stats for a given period."""
        from leads.models import ContactLead, LocalAdsLead
        from quotes.models import Quote, Invoice
        from django.db.models import Sum, Count
        from django.db.models.functions import TruncDate
        from collections import defaultdict

        days = int(request.query_params.get('days', 30))
        days = min(days, 365)  # Cap at 1 year

        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days - 1)

        # Initialize daily data structure
        daily_data = defaultdict(lambda: {
            'new_leads_website': 0,
            'new_leads_local_ads': 0,
            'leads_contacted': 0,
            'leads_converted': 0,
            'quotes_created': 0,
            'quotes_sent': 0,
            'quotes_accepted': 0,
            'quotes_total_value': 0,
            'invoices_created': 0,
            'invoices_paid': 0,
            'invoices_paid_value': 0,
        })

        # Website leads by day
        website_leads = ContactLead.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id'))
        for item in website_leads:
            daily_data[item['day']]['new_leads_website'] = item['count']

        # Ads leads by day
        ads_leads = LocalAdsLead.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id'))
        for item in ads_leads:
            daily_data[item['day']]['new_leads_local_ads'] = item['count']

        # Contacted leads by day (based on updated_at)
        contacted_leads = ContactLead.objects.filter(
            status='contacted',
            updated_at__date__gte=start_date,
            updated_at__date__lte=end_date
        ).annotate(day=TruncDate('updated_at')).values('day').annotate(count=Count('id'))
        for item in contacted_leads:
            daily_data[item['day']]['leads_contacted'] = item['count']

        # Converted leads by day
        converted_leads = ContactLead.objects.filter(
            status='converted',
            updated_at__date__gte=start_date,
            updated_at__date__lte=end_date
        ).annotate(day=TruncDate('updated_at')).values('day').annotate(count=Count('id'))
        for item in converted_leads:
            daily_data[item['day']]['leads_converted'] = item['count']

        # Quotes created by day
        quotes_created = Quote.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).annotate(day=TruncDate('created_at')).values('day').annotate(
            count=Count('id'),
            value=Sum('total')
        )
        for item in quotes_created:
            daily_data[item['day']]['quotes_created'] = item['count']
            daily_data[item['day']]['quotes_total_value'] = float(item['value'] or 0)

        # Quotes sent by day
        quotes_sent = Quote.objects.filter(
            status='sent',
            updated_at__date__gte=start_date,
            updated_at__date__lte=end_date
        ).annotate(day=TruncDate('updated_at')).values('day').annotate(count=Count('id'))
        for item in quotes_sent:
            daily_data[item['day']]['quotes_sent'] = item['count']

        # Quotes accepted by day
        quotes_accepted = Quote.objects.filter(
            status='accepted',
            updated_at__date__gte=start_date,
            updated_at__date__lte=end_date
        ).annotate(day=TruncDate('updated_at')).values('day').annotate(count=Count('id'))
        for item in quotes_accepted:
            daily_data[item['day']]['quotes_accepted'] = item['count']

        # Invoices created by day
        invoices_created = Invoice.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        ).annotate(day=TruncDate('created_at')).values('day').annotate(count=Count('id'))
        for item in invoices_created:
            daily_data[item['day']]['invoices_created'] = item['count']

        # Invoices paid by day
        invoices_paid = Invoice.objects.filter(
            status='paid',
            paid_at__date__gte=start_date,
            paid_at__date__lte=end_date
        ).annotate(day=TruncDate('paid_at')).values('day').annotate(
            count=Count('id'),
            value=Sum('total')
        )
        for item in invoices_paid:
            daily_data[item['day']]['invoices_paid'] = item['count']
            daily_data[item['day']]['invoices_paid_value'] = float(item['value'] or 0)

        # Build ordered list of days
        days_list = []
        current_date = start_date
        while current_date <= end_date:
            data = daily_data[current_date]
            days_list.append({
                'date': current_date.isoformat(),
                'new_leads_website': data['new_leads_website'],
                'new_leads_local_ads': data['new_leads_local_ads'],
                'leads_contacted': data['leads_contacted'],
                'leads_converted': data['leads_converted'],
                'quotes_created': data['quotes_created'],
                'quotes_sent': data['quotes_sent'],
                'quotes_accepted': data['quotes_accepted'],
                'quotes_total_value': data['quotes_total_value'],
                'invoices_created': data['invoices_created'],
                'invoices_paid': data['invoices_paid'],
                'invoices_paid_value': data['invoices_paid_value'],
            })
            current_date += timedelta(days=1)

        # Calculate totals
        totals = {
            'total_leads_website': sum(d['new_leads_website'] for d in days_list),
            'total_leads_local_ads': sum(d['new_leads_local_ads'] for d in days_list),
            'total_leads': sum(d['new_leads_website'] + d['new_leads_local_ads'] for d in days_list),
            'total_contacted': sum(d['leads_contacted'] for d in days_list),
            'total_converted': sum(d['leads_converted'] for d in days_list),
            'total_quotes_created': sum(d['quotes_created'] for d in days_list),
            'total_quotes_sent': sum(d['quotes_sent'] for d in days_list),
            'total_quotes_accepted': sum(d['quotes_accepted'] for d in days_list),
            'total_quotes_value': sum(d['quotes_total_value'] for d in days_list),
            'total_invoices_created': sum(d['invoices_created'] for d in days_list),
            'total_invoices_paid': sum(d['invoices_paid'] for d in days_list),
            'total_invoices_paid_value': sum(d['invoices_paid_value'] for d in days_list),
        }

        return Response({
            'days': days_list,
            'totals': totals,
            'period': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days
            }
        })
