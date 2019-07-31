const router = require('express').Router()
const { User } = require('../../db')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.get('/me', fetchUserFromJwt, (req, res, next) => {
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) next(err)
    else res.status(200).send(user)
  })
})
