#!/bin/sh

set -e

while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
    echo "Waiting for Postgres Database Startup ($POSTGRES_HOST $POSTGRES_PORT)..."
    sleep 2
done

echo "Postgres Database Started Successfully ($POSTGRES_HOST $POSTGRES_PORT)"

alembic upgrade head

# cd app

exec uvicorn app.app:app --host 0.0.0.0 --port 8000 --reload
