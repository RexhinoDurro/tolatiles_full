"""Server-side Meta Conversions API integration for landing-page lead events."""
import hashlib
import logging
import time

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

META_GRAPH_API_VERSION = 'v21.0'


def _hash(value: str) -> str:
    return hashlib.sha256(value.strip().lower().encode('utf-8')).hexdigest()


def send_lead_event(lead, request, client_ip: str, event_id: str = '') -> None:
    """
    Send a server-side 'Lead' event to Meta's Conversions API for the lead's
    landing page, mirroring the browser pixel's fbq('track', 'Lead') fired on
    submit. `event_id` should match the one passed to fbq so Meta deduplicates
    the two events into one. Only fires when the landing page has a Meta
    Pixel configured (settings.META_CAPI_ACCESS_TOKEN gates the feature).
    Never raises — failures are logged and swallowed so a tracking outage
    can't affect lead capture.
    """
    access_token = settings.META_CAPI_ACCESS_TOKEN
    landing_page = lead.landing_page
    if not access_token or not landing_page or not landing_page.meta_pixel_id:
        return

    user_data = {}
    if lead.phone:
        user_data['ph'] = [_hash(lead.phone)]
    if lead.email:
        user_data['em'] = [_hash(lead.email)]
    if client_ip:
        user_data['client_ip_address'] = client_ip
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    if user_agent:
        user_data['client_user_agent'] = user_agent
    fbp = request.COOKIES.get('_fbp')
    if fbp:
        user_data['fbp'] = fbp
    fbc = request.COOKIES.get('_fbc')
    if fbc:
        user_data['fbc'] = fbc

    payload = {
        'data': [{
            'event_name': 'Lead',
            'event_time': int(time.time()),
            'action_source': 'website',
            'event_source_url': f'https://{landing_page.subdomain}.tolatiles.com/',
            'event_id': event_id or f'lead-{lead.id}',
            'user_data': user_data,
        }],
    }
    if settings.META_CAPI_TEST_EVENT_CODE:
        payload['test_event_code'] = settings.META_CAPI_TEST_EVENT_CODE

    try:
        response = requests.post(
            f'https://graph.facebook.com/{META_GRAPH_API_VERSION}/{landing_page.meta_pixel_id}/events',
            params={'access_token': access_token},
            json=payload,
            timeout=10,
        )
        if not response.ok:
            logger.error('Meta CAPI event failed (%s): %s', response.status_code, response.text)
    except Exception:
        logger.exception('Meta CAPI request failed')
