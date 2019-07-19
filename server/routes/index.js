const router = require('express').Router()
module.exports = router

router.use('/auth', require('./auth'))
router.use('/webhooks', require('./webhooks'))
router.use('/events', require('./events'))
