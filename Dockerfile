FROM python:3.11-alpine3.17

WORKDIR /app

COPY requirements.txt .
COPY ./app /app
COPY ./scripts /scripts

EXPOSE 8000

RUN python -m venv /venv && \
  /venv/bin/pip install --upgrade pip && \
  /venv/bin/pip install -r requirements.txt && \
   chmod -R +x /scripts

ENV PATH="/scripts:/venv/bin:$PATH"
ENV PYTHONPATH=/app


CMD ["commands.sh"]