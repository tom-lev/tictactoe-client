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
});

socket.on('updateState', (room) => {
  updateStatus(room);
  renderBoard(room.board);
});

socket.on('roomFull', () => {
  alert('החדר הזה מלא! נסה שם חדר אחר.');
});

function updateStatus(room) {
  const isMyTurn = room.turn === mySymbol;
  const statusEl = document.getElementById('status');
  
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
      cell.classList.add(val.toLowerCase()); // מוסיף קלאס 'x' או 'o' לעיצוב ולאנימציה
    }
    
    cell.onclick = () => {
      socket.emit('makeMove', { index: idx });
    };
    
    boardDiv.appendChild(cell);
  });
}
