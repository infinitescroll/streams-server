const github = require('../github')
const Scheduler = require('../scheduler')

const getEvents = async () => {
  new Scheduler(async () => {
    github()
  }, 20000)
}

module.exports = getEvents
