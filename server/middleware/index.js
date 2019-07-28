const { User } = require('../db')

const serializeUser = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const jwt = req.headers.authorization.split(' ')[1]
      const user = await User.findByJWT(jwt)
      req.user = user
    } catch (error) {
      next(error)
    }
  }
  next()
}

module.exports = { serializeUser }
