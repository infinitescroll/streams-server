const router = require('express').Router()
const request = require('request')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.put('/', fetchUserFromJwt, (req, res, next) => {
  req.user.apps.trello = {
    accessToken: req.query.token
  }

  req.user
    .save()
    .then(obj => res.status(200).send(obj))
    .catch(err => next(err))
})
