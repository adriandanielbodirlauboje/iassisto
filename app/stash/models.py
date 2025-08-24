from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.stash.db import Base
import enum

# Definición de los modelos de la base de datos

# Modelo para los tipos de mensajes
class MessageType(str, enum.Enum):
    parte = "parte"
    pedido = "pedido"
    mantenimiento = "mantenimiento"
    desconocido = "desconocido"

# Modelo para los mensajes
class Message(Base):
    __tablename__ = "mensajes"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, index=True)
    text = Column(Text, nullable=False)
    msg_type = Column(String, nullable=False)
    received_at = Column(DateTime, default=datetime.utcnow)

# Modelo para los consultores
class Consultant(Base):
    __tablename__ = "consultores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, nullable=False)
