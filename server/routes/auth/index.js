const router = require('express').Router()
module.exports = router

router.use('/github', require('./github'))
