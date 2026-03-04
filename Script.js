const express = require('express');
const { Server } = require('ws');
const path = require('path');

const app = express();

// Чтобы сервер отдавал фронтенд (index.html)
app.use(express.static(__dirname));

// Важно: берем порт, который даст хостинг, или 3000 локально
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

const wss = new Server({ server });

wss.on('connection', (ws) => {
    console.log('Новое подключение');
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'join') {
                ws.room = data.room;
            }
            if (data.type === 'msg') {
                wss.clients.forEach(client => {
                    // Рассылаем всем в той же комнате, кроме отправителя
                    if (client !== ws && client.readyState === 1 && client.room === data.room) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
        } catch (e) {
            console.error("Ошибка обработки сообщения", e);
        }
    });
});
