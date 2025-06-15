const socket = io("https://chat-app-backend-5clp.onrender.com");

const joinScreen = document.getElementById('joinScreen');
const chatScreen = document.getElementById('chatScreen');
const joinBtn = document.getElementById('joinBtn');
const usernameInput = document.getElementById('usernameInput');
const avatarInput = document.getElementById('avatarInput');

const form = document.getElementById('form');
const input = document.getElementById('input');
const fileInput = document.getElementById('fileInput');
const messages = document.getElementById('messages');

let username = '';
let avatarUrl = '';

// Join button click
joinBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  const avatar = avatarInput.value.trim();

  if (!name) {
    alert("Please enter a name.");
    return;
  }

  username = name;
  avatarUrl = avatar || ''; // optional

  joinScreen.style.display = 'none';
  chatScreen.style.display = 'block';
});

// Handle message form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Send text message
  if (input.value.trim()) {
    socket.emit('chat message', {
      type: 'text',
      content: input.value,
      username,
      avatar: avatarUrl
    });
    input.value = '';
  }

  // Send image
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://chat-app-backend-5clp.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    const imageUrl = `https://chat-app-backend-5clp.onrender.com${data.fileUrl}`;

    socket.emit('chat message', {
      type: 'image',
      content: imageUrl,
      username,
      avatar: avatarUrl
    });

    fileInput.value = '';
  }
});

// Render received messages
socket.on('chat message', (msg) => {
  const li = document.createElement('li');

  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.alignItems = 'center';
  header.style.marginBottom = '5px';

  if (msg.avatar) {
    const avatar = document.createElement('img');
    avatar.src = msg.avatar;
    avatar.style.width = '24px';
    avatar.style.height = '24px';
    avatar.style.borderRadius = '50%';
    avatar.style.marginRight = '6px';
    header.appendChild(avatar);
  }

  const nameSpan = document.createElement('strong');
  nameSpan.textContent = msg.username || 'Anonymous';
  header.appendChild(nameSpan);
  li.appendChild(header);

  if (msg.type === 'text') {
    li.appendChild(document.createTextNode(msg.content));
  } else if (msg.type === 'image') {
    const img = document.createElement('img');
    img.src = msg.content;
    li.appendChild(img);
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
// Handle user disconnect