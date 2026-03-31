const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const io = new Server(server, {
  cors: { origin: clientUrl, methods: ['GET', 'POST', 'PATCH'] },
});

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use('/uploads', express.static(uploadPath));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', clientUrl });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/bills', require('./routes/bills'));

// Socket.io — real time bill claiming
io.on('connection', (socket) => {
  socket.on('join-bill', (billId) => {
    socket.join(billId);
  });

  socket.on('claim-item', (data) => {
    socket.to(data.billId).emit('item-claimed', data);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
