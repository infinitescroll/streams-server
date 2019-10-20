const fetch = require('node-fetch')
const { Event } = require('../db')

const getNewEvents = async (latestDate, dbObjs = [], page = 1) => {
  const res = await fetch(`https://api.github.com/orgs/openworklabs/events?per_page=10&page=${page}`)
  const events = await res.json()

  events.forEach(item => {
    if (item.created_at > latestDate) {
      dbObjs.push({ data: item, app: 'github', createdAt: item.created_at })
    }
  })

  if (dbObjs.length > 9 + ((page - 1) * 10)) return await getNewEvents(latestDate, dbObjs, page + 1)
  else return dbObjs
}

const fillDB = async () => {
  const dbObjs = []
  const res = await fetch(`https://api.github.com/orgs/openworklabs/events?per_page=99`)
  const events = await res.json()

  events.forEach(item => {
    dbObjs.push({ data: item, app: 'github', createdAt: item.created_at })
  })

  const docs = await Event.create(dbObjs)
}

const updateEvents = async () => {
  try {
    const lastEventSaved = await Event.findOne({}, {}, { sort: { 'createdAt': -1 } })
    if (!lastEventSaved) return fillDB()

    const newEvents = await getNewEvents(lastEventSaved.createdAt)
    if (newEvents.length > 0) {
      const docs = await Event.create(newEvents)
      console.log(docs.length, 'github events added')
    } else {
      console.log('no new github events')
    }
  } catch (error) {
    console.error('Error updating github events: ', error)
  }
}

module.exports = updateEvents
