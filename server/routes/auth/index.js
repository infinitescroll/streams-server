const router = require('express').Router()
module.exports = router

router.use('/magic-link', require('./magicLink'))
