from fastapi import FastAPI
from app.inbox.router import router as inbox_router # Importando el router de inbox
import logging

# Se configura el registro de logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# Se crea la instancia de la aplicación FastAPI
app = FastAPI()

# Se incluye el router de inbox para manejar las rutas relacionadas con la recepción de mensajes
app.include_router(inbox_router)
