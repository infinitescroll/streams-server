const github = require('./github')
const arena = require('./arena')
const Scheduler = require('../scheduler')

const getEvents = async () => {
  new Scheduler(async () => {
    github()
    arena()
  }, 20000)
}

module.exports = getEvents
