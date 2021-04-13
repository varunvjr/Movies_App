const User=require("../models/user");
const bcrypt=require("bcrypt");
const isLoggedIn = async(req,res,next)=>{
    const {email,password}=req.body;
   const user=await User.findOne({email});
    if(user){
    console.log(user);
    const validate=await bcrypt.compare(password,user.password);
    
        if(validate){
            req.session.user_id=user._id
            console.log(validate);
                return next();
        }
        else{
                console.log("Incorrect Password");
                res.redirect("/");    
            }
        }
        else{
            res.send({
                message:"Invalid Email Id"
            })
    }
}
module.exports=isLoggedIn;