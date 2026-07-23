const SERVER_URL = "https://my-tictactoe-server.onrender.com"; 
const socket = io(SERVER_URL);

let mySymbol = null;
let currentRoom = null;

function join() {
  const roomInput = document.getElementById('roomId').value;
  if (!roomInput) return alert('נא להכניס שם חדר');
  
  currentRoom = roomInput;
  socket.emit('joinRoom', currentRoom);
}

socket.on('playerAssigned', (data) => {
  mySymbol = data.symbol;
  document.getElementById('status').innerText = `ממתין לשחקן נוסף... (אתה ${mySymbol})`;
  document.getElementById('setup').style.display = 'none';
});

socket.on('gameStart', (room) => {
  updateStatus(room);
  renderBoard(room.board);
  document.getElementById('chat-box').style.display = 'flex'; // מציג את הצ'אט כשהמשחק מתחיל
});

socket.on('updateState', (room) => {
  updateStatus(room);
  renderBoard(room.board);
});

socket.on('roomFull', () => {
  alert('החדר הזה מלא! נסה שם חדר אחר.');
});

function updateStatus(room) {
  const statusEl = document.getElementById('status');
  
  // אם יש מנצח או תיקו
  if (room.winner) {
    if (room.winner === 'draw') {
      statusEl.innerHTML = `<span style="color: #f59e0b;">תיקו! המשחק הסתיים.</span>`;
    } else if (room.winner === mySymbol) {
      statusEl.innerHTML = `<span style="color: #22c55e; font-size: 1.3rem;">🎉 ניצחת המשחק!</span>`;
    } else {
      statusEl.innerHTML = `<span style="color: #ef4444; font-size: 1.3rem;">הפסדת! ${room.winner} ניצח.</span>`;
    }
    return;
  }

  // המשחק עדיין פעיל
  const isMyTurn = room.turn === mySymbol;
  if (isMyTurn) {
    statusEl.innerHTML = `<span style="color: #38bdf8;">תורך לשחק!</span> (אתה ${mySymbol})`;
  } else {
    statusEl.innerHTML = `תור היריב (${room.turn})... (אתה ${mySymbol})`;
  }
}

function renderBoard(board) {
  const boardDiv = document.getElementById('board');
  boardDiv.style.display = 'grid';
  boardDiv.innerHTML = '';

  board.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    
    if (val) {
      cell.innerText = val;
      cell.classList.add(val.toLowerCase());
    }
    
    cell.onclick = () => {
      socket.emit('makeMove', { index: idx });
    };
    
    boardDiv.appendChild(cell);
  });
}

// --- לוגיקת הצ'אט ---

function sendMsg() {
  const input = document.getElementById('msgInput');
  const text = input.value;
  if (text.trim() !== '') {
    socket.emit('sendMessage', text);
    input.value = '';
  }
}

function handleKeyPress(e) {
  if (e.key === 'Enter') {
    sendMsg();
  }
}

// קבלת הודעה מהשרת והצגתה
socket.on('receiveMessage', (data) => {
  const messagesDiv = document.getElementById('chat-messages');
  const msgEl = document.createElement('div');
  
  const isMe = data.sender === mySymbol;
  msgEl.className = `message ${isMe ? 'my-msg' : 'other-msg'}`;
  msgEl.innerHTML = `<strong>${data.sender}:</strong> ${data.text}`;
  
  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // גלילה אוטומטית להודעה האחרונה
});
