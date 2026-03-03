const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

io.on('connection', (socket) => {
    socket.on('join', (data) => {
        socket.join(data.room);
        console.log(`Ключ ${data.room} активирован`);
    });

    socket.on('message', (data) => {
        io.to(data.room).emit('update', {
            u: data.user,
            m: data.msg,
            t: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server active on ${PORT}`));

