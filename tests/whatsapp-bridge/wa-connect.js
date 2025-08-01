// Importación de librerías necesarias
const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require('@whiskeysockets/baileys'); // Librería para conectarse a WhatsApp Web

const { Boom } = require('@hapi/boom');    // Librería para manejar errores
const express = require('express');        // Servidor web para mostrar el QR
const qrcode = require('qrcode');          // Para generar imágenes QR
const path = require('path');              // Utilidades para rutas de archivos
const axios = require('axios');            // Cliente HTTP para comunicarse con el backend

let sock;                // Almacena la conexión activa con WhatsApp
let currentQR = null;    // Último código QR generado

// Servidor web simple para mostrar el QR en el navegador
const app = express();
app.get('/', async (req, res) => {
    if (!currentQR) return res.send('⏳ Esperando QR...');

    const qrImage = await qrcode.toDataURL(currentQR); // Convierte el QR a imagen
    res.send(`
        <html>
        <body style="text-align:center; font-family:sans-serif;">
            <h2>Escanea este código QR con WhatsApp</h2>
            <img src="${qrImage}" style="width:300px;"/>
            <p style="color:gray">El QR se actualiza si expira. Mantén abierta esta página.</p>
        </body>
        </html>
    `);
});
app.listen(3001, () => console.log('🌐 Visita http://localhost:3001 para escanear el QR'));

async function start() {
    // Carga o crea credenciales de WhatsApp en la carpeta 'auth'
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth'));

    // Obtiene la versión más reciente compatible con WhatsApp Web
    const { version } = await fetchLatestBaileysVersion();

    // Crea la conexión con WhatsApp
    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false  // Desactiva impresión del QR en consola (se muestra en la web)
    });

    // Guarda automáticamente las credenciales cuando cambian
    sock.ev.on('creds.update', saveCreds);

    // Detecta cambios de conexión (QR, conectado, desconectado)
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Se genera un nuevo QR cuando se requiere iniciar sesión
            currentQR = qr;
            console.log('🔗 Nuevo QR disponible en http://localhost:3001');
        }

        if (connection === 'close') {
            // Si la sesión se ha cerrado, decide si volver a conectar
            const shouldReconnect =
                (lastDisconnect?.error instanceof Boom &&
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);

            console.log('❌ Conexión cerrada. Reintentando:', shouldReconnect);

            if (shouldReconnect) {
                start(); // Intenta reconectar automáticamente
            } else {
                console.log('🔒 Sesión cerrada por el usuario. Borra la carpeta auth/ para empezar de nuevo.');
            }
        }

        if (connection === 'open') {
            // Una vez conectado correctamente, se limpia el QR
            currentQR = null;
            console.log('✅ Conectado a WhatsApp');
        }
    });

    // Captura mensajes recibidos de WhatsApp
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return; // Ignora mensajes vacíos o enviados por uno mismo

        const sender = msg.key.remoteJid; // Número del remitente

        // Intenta obtener el texto del mensaje, sea texto simple, texto extendido o pie de imagen
        const text =
            msg.message.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            null;

        if (text) {
            console.log(`📩 Mensaje de ${sender}: ${text}`);

            // Enviar mensaje al backend (en este caso: un FastAPI en localhost:8000)
            try {
                await axios.post('http://localhost:8000/webhook', {
                    from: sender,
                    message: text
                });
            } catch (err) {
                console.error('❌ Error al enviar al backend:', err.message);
            }
        }
    });
}

start(); // Inicia el proceso de conexión con WhatsApp
