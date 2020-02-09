const fetch = require('node-fetch')
const { Event } = require('../db')

const fillDB = async (repoName, streamID) => {
  const dbObjs = []
  const res = await fetch(
    `https://api.github.com/repos/${repoName}/events?per_page=10&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
  )
  const events = await res.json()

  events.forEach(item => {
    dbObjs.push({
      data: item,
      streamID: streamID,
      app: 'github',
      createdAt: item.created_at
    })
  })

  const docs = await Event.create(dbObjs)
  console.log(docs.length, 'github events added')
}

const getNewEvents = async (
  repoName,
  streamID,
  latestDate,
  dbObjs = [],
  page = 1
) => {
  const res = await fetch(
    `https://api.github.com/repos/${repoName}/events?per_page=10&page=${page}&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}`
  )
  const events = await res.json()

  events.forEach(item => {
    if (item.created_at > latestDate) {
      dbObjs.push({
        data: item,
        streamID: streamID,
        app: 'github',
        createdAt: item.created_at
      })
    }
  })

  if (dbObjs.length > 9 + (page - 1) * 10)
    return await getNewEvents(repoName, streamID, latestDate, dbObjs, page + 1)
  else return dbObjs
}

const updateEvents = async (repoName, streamID, lastEventSaved) => {
  try {
    if (!lastEventSaved) return fillDB(repoName, streamID)

    const newEvents = await getNewEvents(repoName, streamID, lastEventSaved)
    if (newEvents.length > 0) {
      const docs = await Event.create(newEvents)
      console.log(docs.length, 'github events added')
    } else {
      console.log('No new github events')
    }
  } catch (error) {
    console.error('Error updating github events: ', error)
  }
}

module.exports = updateEvents
