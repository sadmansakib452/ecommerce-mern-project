const data = require("../data");
const User = require("../models/userModel")

const seedUser = async(req, res, next) =>{

    try{
    //   deleting all existing users
      await User.deleteMany({});

      // inserting new users
        // const users = await User.insertMany(data.users)

        const users = new User(data.users[1])
         await users.save()

        return res.status(201).json({users})       



   
        //successful response
        return res.status(201).json(users)

    }catch(error){
        next(error)
    }

}

module.exports = {seedUser}