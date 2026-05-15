FROM python:3.11-slim

# HF Spaces runs containers as uid/gid 1000
RUN useradd -m -u 1000 user
USER user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /home/user/app

# Install deps first for layer caching
COPY --chown=user req.txt .
RUN pip install --no-cache-dir -r req.txt

# Copy application code
COPY --chown=user app/ ./app/

# HF Spaces expects the app on port 7860
EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
