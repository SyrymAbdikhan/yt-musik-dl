FROM python:3.12-slim-bookworm

WORKDIR /app

COPY pyproject.toml .

RUN apt-get -y update && \
    apt-get -y upgrade && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir poetry
RUN poetry install --no-root

COPY . .

EXPOSE 8000

CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]