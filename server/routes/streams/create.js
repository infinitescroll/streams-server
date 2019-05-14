const router = require('express').Router()

const { createWebhookThread } = require('../../textile')

module.exports = router

router.post('/webhook', async (req, res, next) => {
  try {
    createWebhookThread(req.body.peerId)
    res.sendStatus(201)
  } catch (err) {
    next(err)
  }
})
