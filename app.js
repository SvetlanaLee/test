require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json({ extended: true }));
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.mongoUri;


const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

app.use('/users', usersRouter);
app.use('/', authRouter);


async function start() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.log('Server ERROR:', error.message)
  }
}

start();

