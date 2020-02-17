const mongoose = require('mongoose')
const { Schema } = mongoose

const eventSchema = new Schema({
  app: String,
  streamID: String,
  data: Object,
  username: String,
  type: String,
  parent: String,
  createdAt: Date
})

eventSchema.methods.getFilteredEvents = function(filters) {
  return this.model('Events').find(filters, cb)
}

module.exports = mongoose.model('Events', eventSchema)
