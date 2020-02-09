const router = require('express').Router()
const { Stream } = require('../../db')
const { fetchUserFromJwt } = require('../../middleware')
module.exports = router

router.post('/', async (req, res) => {
  try {
    const stream = await Stream.create(req.body)
    res.status(201).send(stream)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.get('/:id', async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id)
    res.status(200).send(stream)
  } catch (error) {
    res.status(400).send(error)
  }
})

router.put('/:id', async (req, res) => {
  try {
    await Stream.findByIdAndUpdate(req.params.id, req.body)
    res.status(204).send()
  } catch (error) {
    res.status(400).send(error)
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Stream.deleteOne(req.params._id)
    if (deleted.deletedCount === 1) {
      res.status(202).send()
    } else {
      res.status(404).send()
    }
  } catch (error) {
    res.status(400).send(error)
  }
})
