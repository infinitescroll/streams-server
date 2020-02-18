const mongoose = require('mongoose')
const { Schema } = mongoose

const eventSchema = new Schema({
  app: String,
  streamID: String,
  data: Object,
  username: String,
  type: String,
  parent: String,
  subParent: { type: String, default: null },
  createdAt: Date
})

module.exports = mongoose.model('Events', eventSchema)
