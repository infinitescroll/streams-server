const mongoose = require('mongoose')
const { Schema } = mongoose
const { verifyJWT } = require('../../utils')
const Stream = require('./stream.js')

const userSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  streamIDs: [{ type: Schema.Types.ObjectId, ref: 'Streams', default: [] }],
  apps: {
    trello: {
      username: {
        type: String
      },
      accessToken: String,
      refreshToken: String,
      profile: Object
    },
    slack: {
      username: String,
      accessToken: String,
      refreshToken: String,
      profile: Object
    },
    dropbox: {
      username: String,
      accessToken: String,
      refreshToken: String,
      profile: Object
    },
    arena: {
      username: String,
      accessToken: String,
      refreshToken: String,
      profile: Object
    },
    github: {
      username: String,
      accessToken: String,
      refreshToken: String,
      profile: Object
    }
  }
})

const getStreams = streamIDs =>
  Promise.all(streamIDs.map(async id => Stream.findById(id)))

const getUserToReturn = async user => {
  return {
    _id: user._id,
    email: user.email,
    streams: await getStreams(user.streamIDs),
    apps: {
      github: {
        profile: user.apps.github.profile
      }
    }
  }
}

class UserClass {
  static async findOrCreate(email) {
    const user = await this.findOne({ email })
    if (user) return user

    const newUser = await this.create({ email, apps: {} })
    return newUser
  }

  static async findByJWT(jwt) {
    const { sub } = await verifyJWT(jwt)
    return getUserToReturn(await this.findById(sub))
  }

  static async addStream(userId, streamId) {
    const user = await this.findById(userId)
    user.streamIDs.push(streamId)
    return user.save()
  }
}

userSchema.loadClass(UserClass)

module.exports = mongoose.model('Users', userSchema)
