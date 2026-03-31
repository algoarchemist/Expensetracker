const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/groups',   require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/bills',    require('./routes/bills'));
app.use('/api/trips',    require('./routes/trips'));

// Socket.io — real time bill claiming
io.on('connection', (socket) => {
  socket.on('join-bill', (billId) => {
    socket.join(billId);
  });
  socket.on('claim-item', (data) => {
    socket.to(data.billId).emit('item-claimed', data);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB Error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
