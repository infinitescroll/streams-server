const router = require('express').Router()
const mongoose = require('mongoose')

module.exports = router

router.get('/', async (req, res) => {
  var Event = mongoose.model('Event')

  Event.find(function(error, doc) {
    if (error) {
      res.sendStatus(401)
    } else {
      res.send(doc)
    }
  })
})
