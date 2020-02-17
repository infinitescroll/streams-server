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
  if (!stream) return

  let events
  const queryObj = {
    streamID: req.params.id
  }
  const andArray = []

  try {
    if (Object.entries(req.query).length === 0) {
      if (stream.feeds && stream.feeds[0] && stream.feeds[0].filters) {
        const timeFrame = stream.feeds[0].filters.timeFrame
        if (timeFrame) {
          let cutoff = new Date()
          if (stream.feeds[0].filters.timeFrame === 'day') {
            cutoff.setDate(cutoff.getDate() - 1)
          }
          andArray.push({ createdAt: { $gt: cutoff } })
        }

        const types = stream.feeds[0].filters.types
        if (types) {
          const typesOrArray = []
          types.forEach(type => typesOrArray.push({ type }))
          andArray.push({ $or: typesOrArray })
        }

        const usernames = stream.feeds[0].filters.usernames
        if (usernames) {
          const usernamesOrArray = []
          usernames.forEach(username =>
            usernamesOrArray.push({
              username: username
            })
          )
          andArray.push({ $or: usernamesOrArray })
        }

        const subParents = stream.feeds[0].filters.subParents
        if (subParents) {
          const subParentsOrArray = []
          subParents.forEach(subParent => subParentsOrArray.push({ subParent }))
          subParentsOrArray.push({ subParent: null })
          andArray.push({ $or: subParentsOrArray })
        }
      }

      if (andArray.length > 0) {
        events = await Event.find(queryObj).and(andArray)
      } else {
        events = await Event.find(queryObj)
      }
    }

    res.status(200).send(events)
  } catch (error) {
    console.log('error', error)
    res.status(400).send(error)
  }
})
