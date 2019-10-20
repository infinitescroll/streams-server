const fetch = require('node-fetch')
const { Event } = require('../db')

const getNewEvents = async (latestDate, slug, dbObjs = []) => {
  const res = await fetch(`https://api.are.na/v2/channels/${slug}/contents?per=50`)
  const channel = await res.json()

  channel.contents.forEach(item => {
    if (item.created_at > latestDate) {
      dbObjs.push({ data: item, app: 'arena', parent: slug, createdAt: item.created_at })
    }
  })

  return dbObjs
}

const updateEvents = async () => {
  try {
    const slugs = ['audio-lpxcumx6hly', 'streams-p6xplfgv8nw']

    slugs.forEach(async item => {
      const lastEventSaved = await Event.findOne({ parent: item }, {}, { sort: { 'createdAt': -1 } })
      const date = lastEventSaved ? lastEventSaved.createdAt : ''
      const newEvents = await getNewEvents(date, item)

      if (newEvents.length > 0) {
        const docs = await Event.create(newEvents)
        console.log(docs.length, 'arena events added in', item)
      } else {
        console.log('No new arena events in', item)
      }
    })
  } catch (error) {
    console.error('Error updating arena events: ', error)
  }
}

module.exports = updateEvents
