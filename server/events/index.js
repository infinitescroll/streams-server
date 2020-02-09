const github = require('./github')
const arena = require('./arena')
const twitter = require('./twitter')
const Scheduler = require('../scheduler')
const { Stream, Event } = require('../db/models')

const initEventsUpdater = async () => {
  new Scheduler(async () => {
    const streams = await Stream.find()
    await Promise.all(
      streams.map(async stream => {
        if (!stream.feeds) return

        const lastEventSaved = await Event.findOne(
          { streamID: stream._id },
          {},
          { sort: { createdAt: -1 } }
        )

        const lastEventSavedDate = lastEventSaved
          ? lastEventSaved.createdAt
          : null

        stream.feeds.map(async feed => {
          github(feed.parent, stream._id, lastEventSavedDate)
        })
      })
    )
  }, 5000)
}

module.exports = initEventsUpdater
