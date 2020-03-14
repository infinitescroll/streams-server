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
  createdAt: String,
  teamIDs: [Schema.Types.ObjectId]
})

streamSchema.methods.getFilteredEvents = async function(filters) {
  const queryObj = { streamID: this._id }

  if (filters) {
    const andArray = []

    if (filters.timeFrame) {
      let cutoff = new Date()
      if (filters.timeFrame === 'day') cutoff.setDate(cutoff.getDate() - 1)
      andArray.push({ createdAt: { $gt: cutoff } })
    }

    if (filters.types) {
      const typesOrArray = []
      filters.types.forEach(type => typesOrArray.push({ type }))
      andArray.push({ $or: typesOrArray })
    }

    if (filters.usernames) {
      const usernamesOrArray = []
      filters.usernames.forEach(username => usernamesOrArray.push({ username }))
      andArray.push({ $or: usernamesOrArray })
    }

    if (filters.subParents) {
      const subParentsOrArray = []
      filters.subParents.forEach(subParent =>
        subParentsOrArray.push({ subParent })
      )
      subParentsOrArray.push({ subParent: null })
      andArray.push({ $or: subParentsOrArray })
    }

    return await Event.find(queryObj).and(andArray)
  } else {
    return await Event.find(queryObj)
  }
}

module.exports = mongoose.model('Streams', streamSchema)
