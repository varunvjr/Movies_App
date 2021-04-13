var mongoose = require('mongoose');
const userSchema=mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email cannot be blank"]
    },
    password:{
        type:String,
        required:[true,"Password cannot be blank"]
    },
     movies:{
         type:Array,
         ref:"Movie",
         default:[]
     }
})  

module.exports=mongoose.model("User",userSchema);