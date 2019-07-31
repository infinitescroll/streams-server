const router = require('express').Router()
const request = require('request')
const { DROPBOX_CLIENT_ID, DROPBOX_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.put('/', fetchUserFromJwt, (req, res, next) => {
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
      if (error) return next(error)
      if (!body || !body.access_token) {
        return res.status(400).send('No dice')
      }

      req.user.apps.dropbox = {
        accessToken: body.access_token
      }

      req.user
        .save()
        .then(obj => res.status(204).send(obj))
        .catch(err => next(err))
    }
  )
})
