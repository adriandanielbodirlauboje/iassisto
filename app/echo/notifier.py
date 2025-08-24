import requests

def send_whatsapp_message(phone_number: str, message: str):
    try:
        res = requests.post("http://localhost:3001/send-message", json={
            "from": "iassisto",
            "to": phone_number,
            "message": message
        })
        res.raise_for_status()
        print(f"✅ Mensaje enviado a {phone_number}: {message}")
        return True
    except Exception as e:
        print(f"❌ Error al enviar mensaje a {phone_number}: {e}")
        return False
    