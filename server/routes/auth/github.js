const router = require('express').Router()
const request = require('request')
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.put('/', (req, res) => {
  if (!req.user || !req.user._id) return res.status(400).send('No user')
  if (!req.query.code) return res.status(400).send('No code')

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

    User.findOne({ _id: req.user._id }, (err, user) => {
      if (err) res.status(500).send(err)
      if (!user) res.status(400).send('No user found')
      if (!user.apps) user.apps = {}

      user.apps.github = {
        accessToken: token
      }

      user
        .save()
        .then(obj => {
          res.status(200).send(obj)
        })
        .catch(err => {
          res.status(400).send(err)
        })
    })
  })
})
