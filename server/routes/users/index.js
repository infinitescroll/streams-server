const router = require('express').Router()
const { User } = require('../../db')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.get('/me', fetchUserFromJwt, (req, res) => {
  res.status(200).send(req.user)
})
