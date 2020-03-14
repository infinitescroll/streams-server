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
  streamIDs: [Schema.Types.ObjectId],
  username: String,
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

const getStreams = async streamIDs => {
  if (streamIDs.length < 1) return null

  streams = []
  await Promise.all(
    streamIDs.map(async item => {
      try {
        const stream = await Stream.findById(item)
        streams.push(stream)
      } catch (error) {
        console.error('Problem finding stream. ', error)
      }
    })
  )

  return streams
}

const getUserToReturn = async user => {
  return {
    _id: user._id,
    username: user.username,
    streamIDs: user.streamIDs,
    streams: user.streams,
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
    const user = await this.findById(sub)

    user.streams = await getStreams(user.streamIDs)
    return await getUserToReturn(user)
  }

  // static async findByUsernameOrCreate({ username, apps }) {
  //   const user = await this.findOne({ username })
  //   if (user) {
  //     const userToReturn = await getUserToReturn(user)
  //     return { user: userToReturn, created: false }
  //   }

  //   const newUser = await this.create({ username, apps })
  //   const newUserToReturn = await getUserToReturn(newUser)
  //   return { user: newUserToReturn, created: true }
  // }
}

userSchema.loadClass(UserClass)

module.exports = mongoose.model('Users', userSchema)
