from fastapi import APIRouter, Request
import logging
import app.prc.classifier as classifier
from app.stash.crud import save_message, get_all_consultants
from app.stash.db import SessionLocal
from app.stash.models import MessageType
import app.echo.notifier as notifier

router = APIRouter()

def extract_sender_number(sender: str) -> str:
    if not sender:
        return "unknown"
    number = sender.split("@")[0]
    if number.startswith("+"):
        return number
    return "+" + number

def classify_msg(text: str) -> str:
    return classifier.classify_message(text)

def persist_message(db, sender, text, msg_type):
    new_msg = save_message(db, sender=sender, text=text, msg_type=MessageType(msg_type))
    return new_msg

def notify_sender(sender, msg_type):
    notifier.send_whatsapp_message(sender, f"✅ Tu mensaje ha sido recibido y está siendo procesado. Tipo: {msg_type}")

def notify_consultants(db, sender_number, text):
    consultants = get_all_consultants(db)
    for consultant in consultants:
        if consultant.phone_number:
            consultant_url_number = consultant.phone_number + "@s.whatsapp.net"
            notifier.send_whatsapp_message(consultant_url_number, f"📬 Nuevo mensaje de {sender_number}: {text}")

@router.post("/webhook")
async def receive_msg(request: Request):
    data = await request.json()
    sender = data.get("from")
    sender_number = extract_sender_number(sender)
    text = data.get("message")
    msg_type = classify_msg(text)

    logging.info(f"📥 Mensaje recibido de {sender}: {text}")
    logging.info(f"📌 Clasificado como: {msg_type.upper()}")

    db = SessionLocal()
    try:
        persist_message(db, sender, text, msg_type)
        notify_sender(sender, msg_type)
        notify_consultants(db, sender_number, text)
    except Exception as e:
        db.rollback()
        logging.error(f"❌ Error al guardar el mensaje: {e}")
        return {"status": "error", "detail": str(e)}
    finally:
        db.close()

    return {"Estado": "OK", "Tipo": msg_type}
