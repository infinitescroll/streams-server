const router = require('express').Router()
module.exports = router

router.use('/magic-link', require('./magicLink'))
router.use('/github', require('./github'))
