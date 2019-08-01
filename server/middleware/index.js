const { User } = require('../db')

const fetchUserFromJwt = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const jwt = req.headers.authorization.split(' ')[1]
      const user = await User.findByJWT(jwt)
      req.user = user
      next()
    } catch (error) {
      next(error)
    }
  } else {
    return res.status(400).send('No JWT sent in request')
  }
}

module.exports = { fetchUserFromJwt }
