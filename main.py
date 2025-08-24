from fastapi import FastAPI, Depends, Request
from app.inbox.router import router as inbox_router # Importando el router de inbox
import logging
from app.stash.db import SessionLocal  # Importando la sesión de la base de datos

# Se configura el registro de logs
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

# Se crea la instancia de la aplicación FastAPI
app = FastAPI()

# Configuración de la base de datos con una dependencia para obtener la sesión
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Se incluye el router de inbox para manejar las rutas relacionadas con la recepción de mensajes
app.include_router(inbox_router, dependencies=[Depends(get_db)])
