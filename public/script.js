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

// 🟢 Preview selected avatar
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
    avatarPreview.src = '';
    avatarPreview.style.display = 'none';
  }
});

// 🟢 Join with optional avatar
joinBtn.addEventListener('click', async () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Please enter a name.");

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
      console.log('🖼️ Avatar URL:', data.fileUrl);
      avatarUrl = data.fileUrl; // ✅ use Cloudinary URL directly
    } catch (err) {
      console.error('Avatar upload failed', err);
      alert('Avatar upload failed. Try again.');
      return;
    }
  }
console.log('✅ Final avatarUrl:', avatarUrl);
  joinScreen.style.display = 'none';
  chatScreen.style.display = 'block';
});

// 🟢 Submit message
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (input.value.trim()) {
    socket.emit('chat message', {
      type: 'text',
      content: input.value,
      username,
      avatar: avatarUrl
    });
    input.value = '';
  }

  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://chat-app-backend-5clp.onrender.com/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    const imageUrl = data.fileUrl; // ✅ Cloudinary gives full URL

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
// 🟢 Handle disconnect