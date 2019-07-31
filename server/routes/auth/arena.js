const router = require('express').Router()
const request = require('request')
const { ARENA_CLIENT_ID, ARENA_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.put('/', fetchUserFromJwt, (req, res, next) => {
  const url =
    'https://dev.are.na/oauth/token?client_id=' +
    ARENA_CLIENT_ID +
    '&client_secret=' +
    ARENA_CLIENT_SECRET +
    '&code=' +
    req.query.code +
    '&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob'

  request.post(url, {}, (error, response, body) => {
    if (error) return next(error)
    body = JSON.parse(body)
    if (!body || !body.access_token || body.error) {
      return res.status(400).send('No dice')
    }

    User.findOne({ _id: req.user._id }, (err, user) => {
      if (err) return next(err)
      if (!user) return res.status(404).send()

      user.apps.arena = {
        accessToken: body.access_token
      }

      user
        .save()
        .then(obj => res.status(204).send(obj))
        .catch(err => next(err))
    })
  })
})
