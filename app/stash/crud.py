from sqlalchemy.orm import Session
from app.stash.models import Message, Consultant

# Función para guardar un mensaje en la base de datos
def save_message(db: Session, sender: str, text: str, msg_type: str):
    msg = Message(sender=sender, text=text, msg_type=msg_type)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

# Función para obtener todos los consultores de la base de datos
def get_all_consultants(db: Session):
    return db.query(Consultant).all()