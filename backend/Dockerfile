FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (ffmpeg for pydub; build tools for basic-pitch/TensorFlow)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
        gcc \
        g++ \
        libsndfile1 \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create tmp directory for audio processing
RUN mkdir -p tmp

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
