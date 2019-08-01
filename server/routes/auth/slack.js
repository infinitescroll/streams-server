const router = require('express').Router()
const request = require('request')
const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require('../../../secrets')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.put('/', fetchUserFromJwt, (req, res, next) => {
  const url =
    'https://slack.com/api/oauth.access?client_id=' +
    SLACK_CLIENT_ID +
    '&client_secret=' +
    SLACK_CLIENT_SECRET +
    '&code=' +
    req.query.code +
    '&redirect_uri=http://localhost:3000/authorize/app/slack'

  request(url, (error, response, body) => {
    if (error) return next(error)
    body = JSON.parse(body)
    if (!body || !body.access_token) {
      return res.status(400).send('No dice')
    }

    req.user.apps.slack = {
      profile: body.user,
      username: body.user.name,
      accessToken: body.access_token
    }

    req.user
      .save()
      .then(obj => res.status(204).send(obj))
      .catch(err => res.status(400).send(err))
  })
})
