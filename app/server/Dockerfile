FROM python:3.12-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /src

# Copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente
COPY ./src ./src

# Exponer el puerto donde correrá FastAPI
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
