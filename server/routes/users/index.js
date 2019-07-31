const router = require('express').Router()
const { User } = require('../../db')
module.exports = router

router.get('/me', (req, res, next) => {
  if (!req.user || !req.user._id) res.status(400).send('No user found')

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) next(err)
    else res.status(200).send(user)
  })
})
