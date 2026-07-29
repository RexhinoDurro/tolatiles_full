from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed


class OptionalJWTAuthentication(JWTAuthentication):
    """JWTAuthentication that treats an invalid/expired/stale token as 'no
    credentials' instead of raising 401.

    The frontend's ApiClient (client/lib/api.ts) attaches whatever access token
    is in localStorage to every request, including AllowAny public endpoints
    (e.g. /projects/public/, /login/). Once that token expires or otherwise
    fails validation (bad signature, deleted/inactive user, password changed
    since issuance), the stock JWTAuthentication raises before DRF gets to
    check permissions, so even AllowAny views 401 for anonymous visitors
    carrying a stale token. A valid token still authenticates normally, so
    admin-only behavior gated on request.user is unaffected.

    Catches rest_framework_simplejwt's AuthenticationFailed specifically
    (InvalidToken is a subclass of it) rather than DRF's own
    AuthenticationFailed, so genuinely protected endpoints (no AllowAny
    permission) still reject bad tokens via the permission check as normal —
    this only changes "raise" to "treat as anonymous", it doesn't grant access.
    """

    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except AuthenticationFailed:
            return None
