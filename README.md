# iassisto
IAssisto es un sistema inteligente que utiliza IA para permitir a los operarios registrar partes de trabajo, realizar pedidos de materiales y gestionar mantenimientos simplemente enviando mensajes de texto o voz a través de WhatsApp.

### Como usarlo
Para levantar el back-end usar
``uvicorn main:app --reload``

Para probar el puente al WhatsAPp
``node tests/whatsapp-bridge/wa-connect.js``

Ejemplo de prueba manual:
``curl -X POST http://localhost:8000/webhook -H "Content-Type: application/json" -d "{\"from\":\"1234\",\"message\":\"Quiero hacer un pedido urgente\"}"``

El output debería ser:
```{"Estado":"OK","Tipo":"pedido"}```
