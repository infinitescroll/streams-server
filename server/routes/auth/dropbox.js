const router = require('express').Router()
const request = require('request')
const { DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.put('/', (req, res, next) => {
  if (!req.user || !req.user._id) return res.status(400).send('No user')
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
        redirect_uri: 'http://localhost:3000/authorize/app/dropbox'
      },
      json: true
    },
    (error, response, body) => {
      if (error) return res.status(400).send(error)
      if (!body || !body.access_token) {
        return res.status(400).send('No dice')
      }

      User.findOne({ _id: req.user._id }, (err, user) => {
        if (err) res.status(500).send(err)
        if (!user) res.status(400).send('No user found')
        if (!user.apps) user.apps = {}

        user.apps.dropbox = {
          accessToken: body.access_token
        }

        user
          .save()
          .then(obj => {
            res.status(200).send(obj)
          })
          .catch(err => {
            next(err)
          })
      })
    }
  )
})
