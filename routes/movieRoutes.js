const express=require("express");
const router=express.Router();
const mongoose=require("mongoose");
const request=require("request");
const Movie=require("../models/Movie");
const user=require("../models/user")
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once("open",()=>{
    console.log("Database connected");
})

const checkSession=(req,res,next)=>{
    if(!req.session.user_id)
        res.redirect("/");
    next();
}

router.get("/",checkSession,async function(req,res,next){
    try{
        const userData=await user.findById(req.session.user_id);
        console.log(userData);
        const movies=await userData.movies;
        console.log("List of user movies",movies);
        res.render("Movies/home",{movies});
    }
    catch(e){
        next(e)
    }
   
});
router.post("/",checkSession,async function(req,res){
    console.log("User id",req.session.user_id);
    const newMovie= await Movie.create(req.body);
    await newMovie.save();
    console.log("New Movie",newMovie);
    const movieUser=await user.findById(req.session.user_id);
    console.log("Before movie added to user",movieUser);
    await movieUser.movies.push(newMovie);
    await movieUser.save();
    console.log("After movie added to user",movieUser);
    res.redirect("/movies");
})
router.delete("/:id",checkSession,async function(req,res){
    console.log("Movie Id",req.params.id);
    await Movie.findByIdAndRemove(req.params.id);
    user.findOne({_id: req.session.user_id})
    .then(response => {
        let count=-1;
        for(let i=0; i<response.movies.length; i++) {
            if(response.movies[i]._id == req.params.id) {
                console.log("Movie found at ", i);
                count = i;
                break;
            }
        }
        if(count > -1) {
            response.movies.splice(count, 1);
        }
        console.log("After delete",response.movies);
        user.updateOne(
            {_id: req.session.user_id},
            { $set: { movies: response.movies}},
            (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    res.redirect("/movies");
                }
            }
        )
    })
    
})
router.get("/new",checkSession,function(req,res){
    res.render("Movies/new");
})
router.put("/:id",checkSession,async function(req,res){
    console.log(req.body);
    await Movie.findByIdAndUpdate(req.params.id,req.body);
    const obj = {
        _id: req.params.id,
        ...req.body
    }
    user.findOne({_id: req.session.user_id})
    .then(response => {
        let count=-1;
        for(let i=0; i<response.movies.length; i++) {
            if(response.movies[i]._id == req.params.id) {
                console.log("Movie found at ", i);
                count = i;
                break;
            }
        }
        if(count > -1) {
            response.movies[count]=obj;
        }
        console.log("After delete",response.movies);
        user.updateOne(
            {_id: req.session.user_id},
            { $set: { movies: response.movies}},
            (err, result) => {
                if(err) {
                    console.log(err);
                } else {
                    res.redirect("/movies");
                }
            }
        )
    })

})
router.get("/:id/edit", checkSession,async function(req,res){
    const editMovie=await Movie.findById(req.params.id);
    res.render("Movies/edit",{editMovie});
})
router.post("/search",checkSession,async function(req,res,next){
    let searchedMovie=req.body.SearchMovie;
    var url='http://www.omdbapi.com/?s='+searchedMovie+'&apikey=thewdb';
     request(url,function(err,response,body){
        if(response.statusCode==500){
            next(new AppError("Movie Not found"));
        }
        else if(!err&&response.statusCode!=500&&response){
            var movies=JSON.parse(body);
            res.render("Movies/result",{movies});
        }
        
    })
})
module.exports=router;