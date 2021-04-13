const express=require("express");
const app=express();
const Movie=require('./models/Movie');
const bcrypt=require("bcrypt");
const AppError=require("./AppError");
const session=require("express-session");

const User=require("./models/user");
const movieRouter=require("./routes/movieRoutes");
const methodOverride=require("method-override");
app.use(express.urlencoded({extended:true}));
const isLoggedIn=require("./middleware/login");
app.use(methodOverride("_method"));

const db=require("./config/keys").MongoURI;
const mongoose=require("mongoose");
mongoose.connect(db,{useNewUrlParser:true,useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:true,useCreateIndex:true})
    .then(()=>{console.log("MongoDb database connected")})
    .catch(err=>{console.log(err)})
const path=require('path');

app.set("view engine","ejs");
app.use(session({
    secret:"Vegeta",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.set("views",path.join(__dirname,'views'));
const PORT=4000;
app.get("/",(req,res)=>{
    res.render("Authentication/Login");
})
app.use("/movies",movieRouter);
app.post("/",isLoggedIn,async(req,res)=>{
    res.redirect("/movies");
    // const movies=await Movie.find({});
    // res.render("Movies/home",{movies});
})
app.get("/signout",(req,res)=>{
    req.session.user_id=null;
    req.session.destroy();
    res.redirect("/");
})

app.get("/SignUp",(req,res)=>{
    res.render("Authentication/SignUp");
})
app.post("/SignUp",async(req,res)=>{
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(user){
        res.send("Email Id Already register Try to Login");
    }
    else{
        const hashPassword=await bcrypt.hash(password,12);
        const user=new User({
            email,
            password:hashPassword
        });
        await user.save();
        req.session.user_id=user._id;
        res.redirect("/");
    }
   
});

app.get("/secret",function(req,res){
    throw new AppError("Invalid Route");
})



app.use((err,req,res,next)=>{
    const {status=500,message="Something went wrong"}=err;
    res.send({
        statusCode:status,
        error:message
    })
})
app.listen(PORT,function(){
    console.log(`Server starting on port :${PORT}`);
})
