FROM python:3.12.7-slim-bullseye

WORKDIR /app

COPY pyproject.toml .

RUN pip install poetry
RUN poetry install

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]