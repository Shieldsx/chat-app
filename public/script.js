const socket = io("https://chat-app-backend-5clp.onrender.com");
const form = document.getElementById('form');
const input = document.getElementById('input');
const fileInput = document.getElementById('fileInput');
const messages = document.getElementById('messages');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Send text message
  if (input.value.trim()) {
    socket.emit('chat message', { type: 'text', content: input.value });
    input.value = '';
  }

  // Upload image
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://chat-app-backend-5clp.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    const backendUrl = 'https://chat-app-backend-5clp.onrender.com';
    const imageUrl = `${backendUrl}${data.fileUrl}`;
    socket.emit('chat message', { type: 'image', content: imageUrl });
    fileInput.value = '';
  }
});

// Render messages
socket.on('chat message', (msg) => {
  const li = document.createElement('li');

  if (msg.type === 'text') {
    li.textContent = msg.content;
  } else if (msg.type === 'image') {
    const img = document.createElement('img');
    img.src = msg.content;
    li.appendChild(img);
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
// Handle file input change