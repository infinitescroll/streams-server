const mongoose = require('mongoose')
const { Schema } = mongoose
const { verifyJWT } = require('../../utils')

const userSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  },
  apps: {
    trello: {
      username: {
        type: String
      },
      accessToken: {
        type: String
      },
      refreshToken: {
        type: String
      },
      profile: {
        type: Object
      }
    },
    slack: {
      username: {
        type: String
      },
      accessToken: {
        type: String
      },
      refreshToken: {
        type: String
      },
      profile: {
        type: Object
      }
    },
    dropbox: {
      username: {
        type: String
      },
      accessToken: {
        type: String
      },
      refreshToken: {
        type: String
      },
      profile: {
        type: Object
      }
    },
    arena: {
      username: {
        type: String
      },
      accessToken: {
        type: String
      },
      refreshToken: {
        type: String
      },
      profile: {
        type: Object
      }
    },
    github: {
      username: {
        type: String
      },
      accessToken: {
        type: String
      },
      refreshToken: {
        type: String
      },
      profile: {
        type: Object
      }
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

  static async findByJWT(jwt) {
    const { sub } = await verifyJWT(jwt)
    return this.findById(sub)
  }
}

userSchema.loadClass(UserClass)

module.exports = mongoose.model('Users', userSchema)
