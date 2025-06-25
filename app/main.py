from fastapi import FastAPI, Request
import logging

app = FastAPI()

@app.post("/webhook")
async def receive_msg(request: Request):
    data = await request.json()
    logging.info(f"📥 Mensaje recibido desde WhatsApp: {data}")
    return {"status": "ok"}
