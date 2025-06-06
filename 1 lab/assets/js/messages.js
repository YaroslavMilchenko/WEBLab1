const socket = io('http://localhost:4000');
let currentChatId = null;
let unreadChats = new Set();

async function fetchChats() {
    const res = await fetch('http://localhost:4000/api/chats/' + window.currentUserId);
    return res.json();
}
async function fetchMessages(chatId) {
    const res = await fetch('http://localhost:4000/api/messages/' + chatId);
    return res.json();
}

function renderChats(chats) {
    const chatList = document.getElementById('chat-list');
    // Залишаємо header з кнопками, очищаємо тільки список чатів
    chatList.querySelectorAll('.chat-item').forEach(e => e.remove());
    chats.forEach(chat => {
        const div = document.createElement('div');
        div.textContent = chat.name;
        div.className = 'chat-item';
        div.onclick = () => selectChat(chat);
        if (chat.users.includes(window.currentUserId)) div.classList.add('me');
        chatList.appendChild(div);
    });
}

function selectChat(chat) {
    currentChatId = chat._id;
    document.getElementById('chat-title').textContent = chat.name;
    socket.emit('join', { chatId: currentChatId, userId: window.currentUserId });
    fetchMessages(currentChatId).then(renderMessages);

    // Якщо цей чат був у непрочитаних — видаляємо
    if (unreadChats.has(chat._id)) {
        unreadChats.delete(chat._id);
        // Якщо більше немає непрочитаних — гасимо індикатор
        if (unreadChats.size === 0) {
            document.querySelector('.notification-indicator').classList.remove('active');
            // Синхронізуємо з іншими вкладками
            localStorage.setItem('clear-notifications', '1');
        }
    }
}

function renderMessages(messages) {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = '';
    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message' + (msg.senderId === window.currentUserId ? ' self' : '');
        div.textContent = `${msg.senderName}: ${msg.text}`;
        messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

document.getElementById('message-form').onsubmit = e => {
    e.preventDefault();
    if (!currentChatId) return;
    const input = document.getElementById('message-input');
    socket.emit('message', {
        chatId: currentChatId,
        senderId: window.currentUserId,
        senderName: window.currentUserName,
        text: input.value
    });
    input.value = '';
};

socket.on('message', msg => {
    if (msg.chatId === currentChatId) {
        // Якщо користувач у чаті — одразу показуємо
        fetchMessages(currentChatId).then(renderMessages);
        // Синхронізуємо прочитане для інших вкладок
        localStorage.setItem('chat-read', msg.chatId + ':' + Date.now());
    } else {
        // Додаємо чат до непрочитаних
        unreadChats.add(msg.chatId);
        document.querySelector('.notification-indicator').classList.add('active');
    }
});

socket.on('new-chat', chat => {
    fetchChats().then(chats => {
        renderChats(chats);
        selectChat(chat); // одразу відкриває новий чат
    });
});

document.getElementById('new-chat-btn').onclick = () => {
    document.getElementById('new-chat-modal').classList.remove('hidden');
    // Підгрузи адміністраторів через PHP API
    fetch('/Control/api.php?action=getAdmins')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('students-list');
            list.innerHTML = '';
            if (data.success && Array.isArray(data.admins)) {
                data.admins.forEach(admin => {
                    const label = document.createElement('label');
                    label.innerHTML = `<input type="checkbox" value="${admin.id}"> ${admin.username}`;
                    list.appendChild(label);
                });
            } else {
                list.innerHTML = '<div style="color:red;">Не вдалося завантажити адміністраторів</div>';
            }
        });
};

document.getElementById('close-new-chat').onclick = () => {
    document.getElementById('new-chat-modal').classList.add('hidden');
};

document.getElementById('create-chat-confirm').onclick = () => {
    const checked = Array.from(document.querySelectorAll('#students-list input[type=checkbox]:checked'))
        .map(cb => cb.value);
    if (!checked.includes(window.currentUserId)) checked.push(window.currentUserId); // Додаємо себе
    const name = document.getElementById('chat-name').value || 'Новий чат';
    console.log('Створення чату:', {users: checked, name});
    socket.emit('create-chat', { users: checked, name });
    document.getElementById('new-chat-modal').classList.add('hidden');
};

document.getElementById('back-btn').onclick = () => {
    window.location.href = 'student.php';
};

// Отримати chatId з URL
const urlParams = new URLSearchParams(window.location.search);
const initialChatId = urlParams.get('chat');
if (initialChatId) {
    fetchChats().then(chats => {
        renderChats(chats);
        const chat = chats.find(c => c._id === initialChatId);
        if (chat) selectChat(chat);
    });
} else {
    fetchChats().then(renderChats);
}