const authRouter = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const validateRegistr = require('../middleware/validateRegistr');
const validateLogin = require('../middleware/validateLogin');

const User = require('../models/user');
const Token = require('../models/token');

const secretKey = process.env.secretKey;

// регистрация 
authRouter.post('/registration', validateRegistr, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    const newUser = await User.findOne({ email });
    if (newUser) {
     return res.status(400).json({message: 'Пользователь с таким email уже зарегистрирован'})
    }
    
    const user = new User({ email, name, password: await bcrypt.hash(password, 10) });
    await user.save();

    res.status(201).json({ message: 'Новый пользователь зарегистрирован' });

  } catch (error) {
    res.status(500).json({ message: 'Что-то пошло не так. Попробуйте снова.' })
  }
})



// авторизация
authRouter.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      

      const accessToken = jwt.sign(
        { userId: user.id, userName: user.name },
        secretKey,
        { expiresIn: '15m'}
      );

      const refreshToken = jwt.sign(
        { userId: user.id, userName: user.name },
        secretKey,
        { expiresIn: '50d'}
      );

      const tokenCheck = await Token.findOne({ user: user.id });
      if (tokenCheck) {
        tokenCheck.refreshToken = refreshToken;
        await tokenCheck.save()
      }

      const newToken = new Token({ user: user.id, refreshToken });
      await newToken.save();
      
      res.cookie('refreshToken', refreshToken, {maxAge: 50 * 24 * 60 * 60 * 1000, httpOnly: true });
      res.json({ accessToken, refreshToken, userId: user.id })

    } else {
      res.status(400).json({ message: 'Неверные данные! Проверьте email и пароль' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Что-то пошло не так. Попробуйте снова.' })
  }
})


// log out
authRouter.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    await Token.deleteOne({ refreshToken });
    
    res.clearCookie('refreshToken');
    res.json({ message: 'Успешный выход'})

  } catch (error) {
    res.status(500).json({ message: 'Что-то пошло не так. Попробуйте снова.' })
  }
})

// обновление token`а
authRouter.get('/refresh', async (req, res) => {
  try {
    
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.json({ message: 'Необходимо авторизоваться' })
    }

    const validateRefresh = jwt.verify(refreshToken, secretKey);
    const tokenFromDb = await Token.findOne({ refreshToken });
    
    if (!validateRefresh || !tokenFromDb) {
      
      return res.json({ message: 'Пользователь не авторизован' })
    }

    const user = await User.findById(tokenFromDb.user);
    
    const accessToken = jwt.sign(
      { userId: user.id, userName: user.name },
      secretKey,
      { expiresIn: '15m'}
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id, userName: user.name },
      secretKey,
      { expiresIn: '50d'}
    );
    
    tokenFromDb.refreshToken = newRefreshToken;
    await tokenFromDb.save()
    
    res.cookie('refreshToken', newRefreshToken, {maxAge: 50 * 24 * 60 * 60 * 1000, httpOnly: true });
    res.json({ accessToken, newRefreshToken, userId: user.id })

  } catch (error) {
    res.status(500).json({ message: 'Что-то пошло не так. Попробуйте снова.' })
  }
})


module.exports = authRouter
