const router = require('express').Router()
const { Event, Stream } = require('../../db')
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

router.get('/:id/events', async (req, res) => {
  const stream = await Stream.findById(req.params.id)
  if (!stream) return res.status(404).send()
  if (!stream.feeds || !stream.feeds[0])
    return res.status(404).send('This stream has no feeds.')

  let events
  const queryObj = {
    streamID: req.params.id
  }
  const andArray = []

  try {
    if (Object.entries(req.query).length === 0) {
      events = await stream.getFilteredEvents(stream.feeds[0].filters)
    } else {
      const queryObj = {}
      Object.entries(req.query).forEach(param => {
        if (param[0] !== 'timeFrame') {
          queryObj[param[0]] = param[1].split(',')
        } else {
          queryObj[param[0]] = param[1]
        }
      })

      events = await stream.getFilteredEvents(queryObj)
    }

    res.status(200).send(events)
  } catch (error) {
    console.log('error', error)
    res.status(400).send(error)
  }
})
