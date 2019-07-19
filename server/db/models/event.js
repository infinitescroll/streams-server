const mongoose = require('mongoose')
const { Schema } = mongoose
const fetch = require('node-fetch')

const event = new Schema({
  _id: String,
  created: Date,
  app: String,
  data: Object
})

event.statics.create = function(data, callback) {
  console.log('here')
  // self.create(data, function(error, event) {
  //   if (err) callback(error, null)
  //   else callback(null, event)
  // })
}

event.statics.updateEvents = function() {}

event.statics.fetchGitHubEvents = function() {
  // fetch GitHub events
  return fetch('https://api.github.com/orgs/openworklabs/events?per_page=40')
    .then(res => res.json())
    .then(json =>
      json.map(event => {
        return {
          _id: mongoose.Types.ObjectId(),
          created: event.created_at,
          app: 'github',
          data: event
        }
      })
    )
    .catch(error => error)

  // fetch Trello events
}

module.exports = mongoose.model('Event', event)
