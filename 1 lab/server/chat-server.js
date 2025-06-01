const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const Message = require('./models/Message');
const Chat = require('./models/Chat');
const cors = require('cors');

mongoose.connect('mongodb://127.0.0.1:27017/messagesdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://student-cms.local',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/messagesdb' })
}));

app.use(cors({
    origin: 'http://student-cms.local', // або '*' для тесту, але краще явно
    credentials: true
}));

app.use(express.json());

// API для отримання чатів та повідомлень
app.get('/api/chats/:userId', async (req, res) => {
    try {
        const chats = await Chat.find({ users: req.params.userId });
        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});
app.get('/api/messages/:chatId', async (req, res) => {
    const messages = await Message.find({ chatId: req.params.chatId });
    res.json(messages);
});

io.on('connection', (socket) => {
    socket.on('join', ({ chatId, userId }) => {
        socket.join(chatId);
        io.to(chatId).emit('user-status', { userId, status: 'online' });
    });

    socket.on('message', async (msg) => {
        const message = new Message(msg);
        await message.save();
        io.to(msg.chatId).emit('message', message);
    });

    socket.on('create-chat', async ({ users, name }) => {
        console.log('create-chat event:', users, name);
        if (!users || users.length < 2) return;
        const chat = new Chat({ users, name });
        await chat.save();

        // Додаємо системне повідомлення про створення чату
        const systemMessage = new Message({
            chatId: chat._id.toString(),
            senderId: 'system',
            senderName: 'Система',
            text: `Чат "${name}" створено`,
            createdAt: new Date()
        });
        await systemMessage.save();

        users.forEach(u => socket.to(u).emit('new-chat', chat));
        console.log('chat created:', chat);
    });
});

server.listen(4000, () => console.log('Chat server running on 4000'));