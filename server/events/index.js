const github = require('./github')
const arena = require('./arena')
const twitter = require('./twitter')
const Scheduler = require('../scheduler')

const getEvents = async () => {
  new Scheduler(async () => {
    github()
    arena()
    twitter()
  }, 20000)
}

module.exports = getEvents
