const mongoose = require('mongoose')
const { Schema } = mongoose
const { verifyJWT } = require('../../utils')

const userSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    // required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid']
    // index: true
  },
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

class UserClass {
  static async findOrCreate(email) {
    const user = await this.findOne({ email })
    if (user) return user

    const newUser = await this.create({ email, apps: {} })
    return newUser
  }

  static async findByUsernameOrCreate({ username, apps }) {
    const user = await this.findOne({ username })
    if (user) return user

    const newUser = await this.create({ username, apps })
    return newUser
  }

  static async findByJWT(jwt) {
    const { sub } = await verifyJWT(jwt)
    return this.findById(sub)
  }
}

userSchema.loadClass(UserClass)

module.exports = mongoose.model('Users', userSchema)
