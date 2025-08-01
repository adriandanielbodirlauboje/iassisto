from fastapi import APIRouter, Request
import logging
from app.prc.classifier import classify_message

# Se crea un router para manejar las rutas relacionadas con la recepción de mensajes
router = APIRouter()

# Ruta para recibir mensajes a través de un webhook
@router.post("/webhook")
# Método para recibir mensajes
async def receive_msg(request: Request):
    # Se obtiene el cuerpo de la solicitud
    data = await request.json()
    sender = data.get("from")
    text = data.get("message")

    # Se clasifica el mensaje utilizando la función de clasificación
    msg_type = classify_message(text)
    logging.info(f"📥 Mensaje recibido de {sender}: {text}")
    logging.info(f"📌 Clasificado como: {msg_type.upper()}")

    # Se devuelve una respuesta indicando el estado y tipo del mensaje
    return {"Estado": "OK", "Tipo": msg_type}
