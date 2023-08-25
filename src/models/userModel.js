const {Schema, model} = require('mongoose')
const bcrypt = require('bcryptjs');
const { defaultImagePath } = require('../secret');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,

      minlength: [3, "The length of user name can be minimum 3 characters"],

      maxlength: [31, "The length of user name can be maximum 31 characters"],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v) => {
          return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            v
          );
        },
        message: "Please enter valid email",
      },
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      trim: true,

      minlength: [6, "The length of user password can be minimum 6 character"],

      maxlength: [
        31,
        "The length of user passowrd can be maximum 31 characters",
      ],

      // set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10))
    },
    image: {
      type: Buffer,
      contentType: String,
      required: [true, 'User image is required']
    },
    address: {
      type: String,
      required: [true, "User address is required"],
      minlength: [3, 'The length of user address can be minimum 3 chars']
    },
    phone: {
      type: String,
      required: ["true", "User phone is required"],
    },

    isBanned: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
   
  },
  { timestamps: true }
);

// Define a pre-save middleware to hash the password
userSchema.pre('save', function(next){
  if(!this.isModified('password')){
    return next()
  }

  bcrypt.hash(this.password,10,(err, passwordHash)=>{
    if(err)
      return next(err)
    this.password = passwordHash
    next()
  })
})

userSchema.methods.comparePassword = function(password, cb){
  bcrypt.compare(password, this.password,(err, isMatch)=>{
    if(err)
      return cb(err)
    else{
      if(!isMatch)
        return cb(null, isMatch)
      return cb(null, this)
    }
  })
}


const User = model('Users', userSchema)

module.exports = User

