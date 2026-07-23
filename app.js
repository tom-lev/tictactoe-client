// מתחברים לשרת ה-Node.js שרץ אצלנו במחשב בפורט 3000
const SERVER_URL = "https://my-tictactoe-server.onrender.com"; 
const socket = io(SERVER_URL);

let mySymbol = null;   // יחזיק את התפקיד שלנו: 'X' או 'O'
let currentRoom = null;

// פונקציה שנפעלת כשהמשתמש לוחץ על כפתור "התחבר"
function join() {
  const roomInput = document.getElementById('roomId').value;
  if (!roomInput) return alert('נא להכניס שם חדר');
  
  currentRoom = roomInput;
  // שולחים לשרת אירוע: "אני רוצה להצטרף לחדר X"
  socket.emit('joinRoom', currentRoom);
}

// א. כשהשרת מודיע איזה תפקיד קיבלנו ('X' או 'O')
socket.on('playerAssigned', (data) => {
  mySymbol = data.symbol;
  document.getElementById('status').innerText = `ממתין לשחקן נוסף... אתה שחקן ${mySymbol}`;
  document.getElementById('setup').style.display = 'none'; // מוסתרים את טופס ההתחברות
});

// ב. כשהשרת מודיע שהצטרף שחקן שני והמשחק מתחיל
socket.on('gameStart', (room) => {
  document.getElementById('status').innerText = `המשחק החל! תור: ${room.turn} (אתה ${mySymbol})`;
  renderBoard(room.board);
});

// ג. כשהשרת שולח עדכון לוח אחרי מהלך
socket.on('updateState', (room) => {
  document.getElementById('status').innerText = `תור: ${room.turn} (אתה ${mySymbol})`;
  renderBoard(room.board);
});

// ד. אם החדר כבר מלא (2 שחקנים)
socket.on('roomFull', () => {
  alert('החדר הזה מלא! נסה שם חדר אחר.');
});

// פונקציה שמציירת את הלוח על המסך לפי המערך שהגיע מהשרת
function renderBoard(board) {
  const boardDiv = document.getElementById('board');
  boardDiv.style.display = 'grid'; // מציגים את הלוח
  boardDiv.innerHTML = '';        // מנקים ציור קודם

  board.forEach((val, idx) => {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerText = val || '';
    
    // בלחיצה על משבצת - שולחים לשרת אירוע מהלך
    cell.onclick = () => {
      socket.emit('makeMove', { index: idx });
    };
    
    boardDiv.appendChild(cell);
  });
}