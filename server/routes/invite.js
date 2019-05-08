const router = require('express').Router()
const { textile } = require('../textile')

module.exports = router

router.post('/', async (req, res, next) => {
  await textile.files.add(
    'mmm, bytes...',
    '',
    '12D3KooWSYT6SUL9fx15pwjHSVUsuymnbixmRtPGySmFYtWE51Sc'
  )
  res.send('hello')
})

router.get('/', async (req, res, next) => {
  console.log('IN INVITE!')
  res.send('hello')
})
