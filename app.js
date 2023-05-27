const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

const corsOptions = {
  origin: ['http://www.diegomarty.com', 'https://www.diegomarty.com', 'http://localhost:3000', 'http://127.0.0.1:3000'],
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use('/sprites', express.static(path.join(__dirname, '/sprites')));

module.exports = app;
