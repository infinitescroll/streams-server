const router = require('express').Router()
const request = require('request')
const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.get('/', (req, res) => {
  if (!req.user || !req.user._id) return res.status(400).send('No user')
  if (!req.query.code) return res.status(400).send('No code')

  const url =
    'https://slack.com/api/oauth.access?client_id=' +
    SLACK_CLIENT_ID +
    '&client_secret=' +
    SLACK_CLIENT_SECRET +
    '&code=' +
    req.query.code +
    '&redirect_uri=http://localhost:3000/authorize/app/slack'

  request(url, function(error, response, body) {
    if (error) return res.status(400).send(error)
    body = JSON.parse(body)
    if (!body || !body.access_token) {
      return res.status(400).send('No dice')
    }

    User.findOne({ _id: req.user._id }, (err, user) => {
      if (err) res.status(500).send(err)
      if (!user) res.status(404).send()
      if (!user.apps) user.apps = {}

      user.apps.slack = {
        profile: body.user,
        username: body.user.name,
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
