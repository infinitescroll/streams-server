const router = require('express').Router()
const request = require('request')
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../../../secrets')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.put('/', fetchUserFromJwt, (req, res, next) => {
  const url =
    'https://github.com/login/oauth/access_token?client_id=' +
    GITHUB_CLIENT_ID +
    '&client_secret=' +
    GITHUB_CLIENT_SECRET +
    '&code=' +
    req.query.code +
    '&redirect_uri=http://localhost:3000/authorize/app/github'

  request.post(url, {}, (error, response, body) => {
    if (error) return res.status(400).send(error)
    if (!body) return res.status(400).send('No. body.')

    const token = body.substring(body.indexOf('=') + 1, body.indexOf('&'))
    if (!token) return res.status(400).send('No dice')

    req.user.apps.github = {
      accessToken: token
    }

    req.user
      .save()
      .then(obj => res.status(200).send(obj))
      .catch(err => next(err))
  })
})
