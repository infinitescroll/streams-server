const router = require('express').Router()
module.exports = router

router.use('/magic-link', require('./magicLink'))
router.use('/slack', require('./slack'))
router.use('/dropbox', require('./dropbox'))
router.use('/arena', require('./arena'))
