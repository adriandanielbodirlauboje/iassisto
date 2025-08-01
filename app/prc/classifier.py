# Método para clasificar mensajes
# Temporal: esto debería ser reemplazado por una clasificación mediante IA
def classify_message(text: str) -> str:
    text = text.lower()
    if "pedido" in text:
        return "pedido"
    elif "parte" in text:
        return "parte"
    elif "mantenimiento" in text:
        return "mantenimiento"
    else:
        return "otro"
