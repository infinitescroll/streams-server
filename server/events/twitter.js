const fetch = require('node-fetch')
const { Event } = require('../db')
const Twit = require('twit')
const moment = require('moment')

const getNewEvents = async (latestDate, slug, dbObjs = []) => {
  var T = new Twit({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  })

  const tweets = await T.get('statuses/user_timeline', { screen_name: 'openworklabs', count: 40 })

  tweets.data.forEach(item => {
    const isoDate = moment(item.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').toISOString()
    if (isoDate > latestDate) {
      dbObjs.push({
        data: item,
        app: 'twitter',
        parent: slug,
        createdAt: isoDate
      })
    }
  })

  return dbObjs
}

const updateEvents = async () => {
  try {
    const lastEventSaved = await Event.findOne({ app: 'twitter' }, {}, { sort: { 'createdAt': -1 } })
    const date = lastEventSaved ? lastEventSaved.createdAt : ''
    const newEvents = await getNewEvents(date)

    if (newEvents.length > 0) {
      const docs = await Event.create(newEvents)
      console.log(docs.length, 'tweets added')
    } else {
      console.log('no tweets added')
    }
  } catch (error) {
    console.error('Error updating arena events: ', error)
  }
}

module.exports = updateEvents
