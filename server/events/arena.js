const fetch = require('node-fetch')
const { Event } = require('../db')

const getNewEvents = async (latestDate, slug, dbObjs = [], page = 1) => {
  const res = await fetch(`https://api.are.na/v2/channels/${slug}/contents?page=1&per=3`)
  const channel = await res.json()

  channel.contents.forEach(item => {
    if (item.created_at > latestDate) {
      dbObjs.push({data: item, app: 'arena', parent: slug, createdAt: item.created_at})
    }
  })

  if (dbObjs.length > 2 + ((page - 1) * 3)) return await getNewEvents(latestDate, dbObjs, page + 1)
  else return dbObjs
}

const fillDB = async (slug) => {
  const dbObjs = []
  const res = await fetch(`https://api.are.na/v2/channels/${slug}/contents?per=10`)
  const events = await res.json()

  events.contents.forEach(item => {
    dbObjs.push({data: item, app: 'arena', parent: slug, createdAt: item.created_at})
  })

  const docs = await Event.create(dbObjs)
}

const updateEvents = async () => {
  try {
    const slugs = ['audio-lpxcumx6hly']
    slugs.forEach(async item => { 
      const lastEventSaved = await Event.findOne({ parent: item }, {}, { sort : { 'createdAt' : -1 } })
      if (!lastEventSaved) return fillDB(item)
      
      const newEvents = await getNewEvents(lastEventSaved.createdAt, item)
      if (newEvents.length > 0) {
          const docs = await Event.create(newEvents)
          console.log(docs.length, 'arena events added')
      } else {
        console.log('no new arena events')
      }
    })
  } catch (error) {
    console.error('Error updating arena events: ', error)
  }
}

module.exports = updateEvents
