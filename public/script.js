const socket = io("https://chat-app-backend-5clp.onrender.com");

const joinScreen = document.getElementById('joinScreen');
const chatScreen = document.getElementById('chatScreen');
const joinBtn = document.getElementById('joinBtn');
const usernameInput = document.getElementById('usernameInput');
const avatarFileInput = document.getElementById('avatarFile');
const avatarPreview = document.getElementById('avatarPreview');
const form = document.getElementById('form');
const input = document.getElementById('input');
const fileInput = document.getElementById('fileInput');
const messages = document.getElementById('messages');

let username = '';
let avatarUrl = '';

// 🟢 Show avatar preview
avatarFileInput.addEventListener('change', () => {
  const file = avatarFileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.src = e.target.result;
      avatarPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    avatarPreview.src = '';
    avatarPreview.style.display = 'none';
  }
});

// 🟢 Join button with avatar upload
joinBtn.addEventListener('click', async () => {
  const name = usernameInput.value.trim();

  if (!name) {
    alert("Please enter a name.");
    return;
  }

  username = name;
  const avatarFile = avatarFileInput.files[0];

  if (avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    try {
      const res = await fetch('https://chat-app-backend-5clp.onrender.com/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      avatarUrl = `https://chat-app-backend-5clp.onrender.com${data.fileUrl}`;
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Avatar upload failed. Try again.');
      return;
    }
  }

  joinScreen.style.display = 'none';
  chatScreen.style.display = 'block';
});

// 🟢 Message form
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Text message
  if (input.value.trim()) {
    socket.emit('chat message', {
      type: 'text',
      content: input.value,
      username,
      avatar: avatarUrl
    });
    input.value = '';
  }

  // Image message
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

// 🟢 Render messages
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
    img.style.maxWidth = '200px';
    img.style.borderRadius = '8px';
    li.appendChild(img);
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
});
// 🟢 Handle socket connection errors
// 🟢 Preview selected avatar image before upload
avatarFileInput.addEventListener('change', () => {
  const file = avatarFileInput.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.src = e.target.result;
      avatarPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    avatarPreview.style.display = 'none';
    avatarPreview.src = '';
  }
});
// 🟢 Handle socket connection errors