function validateLogin(req, res, next) {
  if (!req.body.password || !req.body.email) {
    res.status(400).json({ message: 'Пожалуйста, заполните все данные!' });
    return;
  }
  next();
}

module.exports = validateLogin;
