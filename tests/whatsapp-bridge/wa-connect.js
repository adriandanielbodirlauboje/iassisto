// Importación de librerías necesarias
const {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const express = require('express');
const qrcode = require('qrcode');
const path = require('path');
const axios = require('axios');

let sock;
let currentQR = null;

// Servidor web simple para mostrar el QR en el navegador
const app = express();
app.use(express.json()); // Middleware para parsear JSON

app.get('/', async (req, res) => {
    if (!currentQR) return res.send('⏳ Esperando QR...');

    const qrImage = await qrcode.toDataURL(currentQR);
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

// Endpoint para enviar mensajes desde el backend
app.post('/send-message', async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Faltan campos: "to" y "message" son obligatorios.' });
    }

    try {
        await sock.sendMessage(to, { text: message });
        console.log(`📤 Mensaje enviado a ${to}: ${message}`);
        res.json({ status: 'ok' });
    } catch (err) {
        console.error(`❌ Error al enviar mensaje a ${to}:`, err.message);
        res.status(500).json({ error: 'Error al enviar mensaje.' });
    }
});

app.listen(3001, () => console.log('🌐 Visita http://localhost:3001 para escanear el QR'));

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth'));
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            currentQR = qr;
            console.log('🔗 Nuevo QR disponible en http://localhost:3001');
        }

        if (connection === 'close') {
            const shouldReconnect =
                (lastDisconnect?.error instanceof Boom &&
                    lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut);

            console.log('❌ Conexión cerrada. Reintentando:', shouldReconnect);
            if (shouldReconnect) {
                start();
            } else {
                console.log('🔒 Sesión cerrada por el usuario. Borra la carpeta auth/ para empezar de nuevo.');
            }
        }

        if (connection === 'open') {
            currentQR = null;
            console.log('✅ Conectado a WhatsApp');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            null;

        if (text) {
            console.log(`📩 Mensaje de ${sender}: ${text}`);
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

start();
