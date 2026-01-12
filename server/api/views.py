import os
import requests
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class GoogleReviewsView(APIView):
    """
    Fetch Google reviews from Places API (New)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        # Check cache first (cache for 1 hour)
        cache_key = 'google_reviews'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        api_key = os.environ.get('GOOGLE_PLACES_API_KEY')
        place_id = os.environ.get('GOOGLE_PLACE_ID')

        if not api_key or not place_id:
            return Response({
                'error': 'Google Places API not configured'
            }, status=500)

        try:
            url = f"https://places.googleapis.com/v1/places/{place_id}"
            headers = {
                'X-Goog-Api-Key': api_key,
                'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews'
            }

            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Format the response
            result = {
                'displayName': data.get('displayName', {}).get('text', 'Tola Tiles'),
                'rating': data.get('rating', 0),
                'userRatingCount': data.get('userRatingCount', 0),
                'reviews': []
            }

            # Format reviews
            for review in data.get('reviews', []):
                result['reviews'].append({
                    'authorName': review.get('authorAttribution', {}).get('displayName', 'Anonymous'),
                    'profilePhotoUrl': review.get('authorAttribution', {}).get('photoUri', ''),
                    'rating': review.get('rating', 5),
                    'text': review.get('text', {}).get('text', ''),
                    'relativeTimeDescription': review.get('relativePublishTimeDescription', ''),
                    'publishTime': review.get('publishTime', ''),
                })

            # Cache for 1 hour
            cache.set(cache_key, result, 60 * 60)

            return Response(result)

        except requests.RequestException as e:
            return Response({
                'error': f'Failed to fetch reviews: {str(e)}'
            }, status=500)
