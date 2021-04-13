const mongoose=require("mongoose");

 const moviesSchema=new mongoose.Schema({
    title:String,
    poster:String,
    ReleaseYear:Number,
    Rating:String
   
 });
 const Movie=mongoose.model("Movie",moviesSchema);
 module.exports=Movie;