FROM python:3.13-slim

WORKDIR /app

COPY main.py /app
COPY requirements.txt /app
COPY formatted_output.txt /app

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
