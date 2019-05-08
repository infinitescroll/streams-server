const router = require('express').Router()
module.exports = router

router.use('/invite', require('./invite'))
router.use('/auth', require('./auth'))
