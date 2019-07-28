const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
  }
})

userSchema.statics.findOrCreate = function(id, data, callback) {
  const self = this
  self.findById(id, (err, user) => {
    if (err) callback(err, null)
    else if (user) callback(null, user)
    else {
      self.create(data, function(error, createdUser) {
        if (err) callback(error, null)
        else callback(null, createdUser)
      })
    }
  })
}

module.exports = mongoose.model('Users', userSchema)
