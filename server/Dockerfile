# Dockerfile
FROM python:3.11-slim

# Install build dependencies for pyaudio (and other possible C extensions)
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc build-essential libasound2-dev portaudio19-dev python3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Uvicorn listens on 8080 by convention on Fly
ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
