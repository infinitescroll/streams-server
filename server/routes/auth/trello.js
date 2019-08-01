const router = require('express').Router()
const request = require('request')
const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } = require('../../../secrets')
const { User } = require('../../db')
module.exports = router

router.put('/', (req, res) => {
  if (!req.user || !req.user._id) return res.status(400).send('No user')
  if (!req.query.token) return res.status(400).send('No token')

  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) res.status(500).send(err)
    if (!user) res.status(404).send()
    if (!user.apps) user.apps = {}

    user.apps.trello = {
      accessToken: req.query.token
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
})
