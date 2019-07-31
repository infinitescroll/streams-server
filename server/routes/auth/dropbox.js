const router = require('express').Router()
const request = require('request')
const { DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.get('/callback', function(req, res) {
  if (!req.query || !req.query.state) return res.status(400).send('No user')
  if (!req.query.code) return res.status(400).send('No code')
  const url = 'https://api.dropbox.com/oauth2/token'

  request.post(
    url,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(DROPBOX_CLIENT_ID + ':' + DROPBOX_CLIENT_SECRET).toString(
            'base64'
          )
      },
      form: {
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3001/api/v0/auth/dropbox/callback'
      },
      json: true
    },
    function(error, response, body) {
      if (error) return res.status(400).send(error)
      if (!body || !body.access_token) {
        return res.status(400).send('No dice')
      }

      User.findOne({ _id: req.query.state }, (err, user) => {
        if (err) res.status(500).send(err)
        if (!user) res.status(404).send()
        if (!user.apps) user.apps = {}

        user.apps.dropbox = {
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
    }
  )
})
