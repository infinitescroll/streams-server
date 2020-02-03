const mongoose = require('mongoose')
const { Schema } = mongoose

const streamSchema = new Schema({
  name: String,
  feeds: [
    {
      parent: String,
      app: String,
      filters: {
        timeFrame: String,
        types: [String],
        by: [String],
        subFeeds: [String]
      }
    }
  ],
  createdAt: String
})

module.exports = mongoose.model('Streams', streamSchema)