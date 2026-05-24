FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt server.py download_models.py ./
RUN pip install --no-cache-dir -r requirements.txt \
  && python download_models.py

EXPOSE 8765
ENV VOICE_HOST=0.0.0.0
ENV VOICE_PORT=8765

CMD ["python", "server.py"]
