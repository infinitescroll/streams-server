const router = require('express').Router()
const Event = require('../../db/models/event')
const mongoose = require('mongoose')

module.exports = router

router.post('/', async (req, res) => {
  var on = false
  console.log('res')

  setTimeout(function() {
    Event.fetchGitHubEvents().then(events => {
      Event.findOne()
        .sort({ created: -1 })
        .exec(function(err, doc) {
          // Get index of the last saved doc in new events
          const index = events.findIndex(item => doc.data.id === item.data.id)
          const newEntries = events.slice(0, index)
          console.log('newEnties', newEntries)
          Event.insertMany(newEntries)
        })
    })
  }, 5000)

  res.status(201)
})

router.post('/response', async (req, res) => {
  console.log('here', res)
})

router.post('/:webhookId', async (req, res) => {
  console.log('here', req.params)
  res.sendStatus(201)
  // const { accessToken } = req.user
  // delete req.user.accessToken
  // delete req.user.refreshToken

  // const { peerId } = req.query
  // try {
  //   res.sendStatus(201)
  // } catch (error) {
  //   next(error)
  //
})
