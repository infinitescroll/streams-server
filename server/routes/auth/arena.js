const router = require('express').Router()
const request = require('request')
const { ARENA_CLIENT_ID, ARENA_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.get('/callback', function(req, res) {
  if (!req.user || !req.user._id) return res.status(400).send('No user')

  // we'll use this check for the deployed version
  // if (!req.query.code) return res.status(400).send('No code')

  const url =
    'https://dev.are.na/oauth/token?client_id=' +
    ARENA_CLIENT_ID +
    '&client_secret=' +
    ARENA_CLIENT_SECRET +
    '&code=' +
    '<for local testing, arena gives codes in the frontend auth process>' +
    '&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob'

  request.post(url, {}, function(error, response, body) {
    if (error) return res.status(400).send(error)
    body = JSON.parse(body)
    if (!body || !body.access_token || !req.user || !req.user._id) {
      return res.status(400).send('No dice')
    }

    User.findOne({ _id: req.user._id }, (err, user) => {
      if (err) res.status(500).send(err)
      if (!user) res.status(404).send()
      if (!user.apps) user.apps = {}

      user.apps.arena = {
        accessToken: body.access_token
      }

      user
        .save()
        .then(obj => {
          res.redirect('/sucess')
        })
        .catch(err => {
          res.redirect('/error')
        })
    })
  })
})
