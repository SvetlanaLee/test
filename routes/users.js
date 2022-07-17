const usersRouter = require('express').Router();
const User = require('../models/user');
const Token = require('../models/token');

// Получение всех пользователей
usersRouter.get('/', async (req, res) => {
  try {
    const allUsers = await User.find();
    if(allUsers.length > 0) {
     return res.json({ allUsers });
    }
    res.json({ message: 'В базе пока нет пользователей' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


// редактирование имени пользователя
usersRouter.patch('/:id', async (req, res) => {
  try {
    const { name } = req.body;

    if (name) {
      const user = await User.findOne({ id: req.params.id });
      user.name = name;
      await user.save();
      return res.json({ message: 'Данные успешно изменены'})
    }

    res.json({ message: 'Внесите данные для изменения' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// удаление пользователя
usersRouter.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });

    if (user) {
      await User.deleteOne({ id: req.params.id });
      await Token.deleteOne({ refreshToken: req.cookies.refreshToken });
      return res.json({ message: 'Пользователь удален' })
    }

    res.json({ message: 'Такого пользователя не существует' })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})


module.exports = usersRouter
