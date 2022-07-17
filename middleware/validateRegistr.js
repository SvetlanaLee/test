function validateRegistr(req, res, next) {
  if (!req.body.email || !req.body.password || !req.body.name) {
    res.status(400).json({ message: 'Пожалуйста, заполните все данные!' });
    return;
  }
  next();
}

module.exports = validateRegistr;
