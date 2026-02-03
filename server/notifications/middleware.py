"""JWT authentication middleware for WebSocket connections."""

import logging
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser, User
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user(user_id):
    """Get user from database."""
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    JWT authentication middleware for Django Channels.

    Authenticates WebSocket connections using JWT tokens passed in the query string.
    Usage: ws://host/ws/path/?token=<JWT_TOKEN>
    """

    async def __call__(self, scope, receive, send):
        # Parse query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)

        # Get token from query params
        token_list = query_params.get('token', [])
        token = token_list[0] if token_list else None

        if token:
            try:
                # Validate token and get user
                access_token = AccessToken(token)
                user_id = access_token.get('user_id')
                scope['user'] = await get_user(user_id)
                logger.debug(f"WebSocket authenticated for user {user_id}")
            except TokenError as e:
                logger.warning(f"Invalid JWT token: {e}")
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Convenience wrapper for JWT auth middleware."""
    return JWTAuthMiddleware(inner)
