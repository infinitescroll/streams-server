const mongoose = require('mongoose')
const { Schema } = mongoose
const Event = require('./event.js')

const streamSchema = new Schema({
  name: String,
  feeds: [
    {
      parent: String,
      app: String,
      filters: {
        timeFrame: String,
        types: [String],
        usernames: [String],
        subParents: [String]
      }
    }
  ],
  createdAt: String
})

streamSchema.methods.getFilteredEvents = async function(filters) {
  const queryObj = { streamID: this._id }

  if (filters) {
    const andArray = []

    const timeFrame = filters.timeFrame
    if (timeFrame) {
      let cutoff = new Date()
      if (timeFrame === 'day') {
        cutoff.setDate(cutoff.getDate() - 1)
      }
      andArray.push({ createdAt: { $gt: cutoff } })
    }

    const types = filters.types
    if (types) {
      const typesOrArray = []
      types.forEach(type => typesOrArray.push({ type }))
      andArray.push({ $or: typesOrArray })
    }

    const usernames = filters.usernames
    if (usernames) {
      const usernamesOrArray = []
      usernames.forEach(username => usernamesOrArray.push({ username }))
      andArray.push({ $or: usernamesOrArray })
    }

    const subParents = filters.subParents
    if (subParents) {
      const subParentsOrArray = []
      subParents.forEach(subParent => subParentsOrArray.push({ subParent }))
      subParentsOrArray.push({ subParent: null })
      andArray.push({ $or: subParentsOrArray })
    }

    return await Event.find(queryObj).and(andArray)
  } else {
    return await Event.find(queryObj)
  }
}

module.exports = mongoose.model('Streams', streamSchema)
