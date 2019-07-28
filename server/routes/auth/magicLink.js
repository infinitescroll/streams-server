const router = require('express').Router()
module.exports = router

const { User } = require('../../db')
const {
  generateLoginCode,
  sendTokenizedEmail,
  verifyJWT
} = require('../../utils')

router.post('/', async (req, res, next) => {
  const email = req.body.email
  try {
    const user = await User.findOrCreate(email)
    const code = await generateLoginCode(user)
    await sendTokenizedEmail(email, code)
    return res.send().status(201)
  } catch (error) {
    next(error)
  }
})

router.get('/', async (req, res, next) => {
  const { sub } = await verifyJWT(req.query.token)
  const user = await User.findById(sub)
  if (user) {
    const code = await generateLoginCode(user)
    res.send(code).status(200)
  } else {
    next(new Error({ message: 'ERROR: no user found from JWT' }))
  }
})
