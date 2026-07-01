#!/bin/sh
set -e

umask 022

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec "$@"
