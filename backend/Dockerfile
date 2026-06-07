# Usa Python 3.10 slim (leggero e stabile)
FROM python:3.10-slim

# Imposta la cartella di lavoro nel container
WORKDIR /app

# Copia i requisiti e installali
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia tutto il resto del codice sorgente
COPY . .

# Comando di avvio: Cloud Run passa la porta tramite la variabile $PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]