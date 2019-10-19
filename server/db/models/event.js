const mongoose = require('mongoose')
const { Schema } = mongoose

const eventSchema = new Schema({
  app: {
    type: String
  },
  data: {
    type: Object
  },
  parent: {
    type: String
  },
  createdAt: {
    type: String
  }
})

module.exports = mongoose.model('Events', eventSchema)