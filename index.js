import express from "express";
import path from "path";
import mongoose from "mongoose";
import { PORT,MONGODB_URL } from "./config.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema =  new mongoose.Schema({
  name:String,
  email:String,
  password:String
});

const User = mongoose.model("User",userSchema)


const app = express();

//these are the middle ware

// to access public folder which is static of our application
app.use(express.static(path.join(path.resolve(),"public")));

// this is to access form data 
app.use(express.urlencoded({extended:true}));

//t access cookies

app.use(cookieParser());

//to set the view engine so that we don't have to write index.ejs instead direclty index
app.set("view engine", "ejs");


const isAuthenticated = async (req, res,next) => {
  const {token} = req.cookies;
    if(token){
      const decoded = jwt.verify(token,"aedfp9a8er9hap0aw9iejr");
      req.user = await User.findById(decoded._id);
      next(); //next call back function wiill b called
    }else{
      res.redirect("/login");
    }
};



app.get("/", isAuthenticated ,(req, res) => {
    console.log('user', req.user)
    res.render("logout",{name:req.user.name});
    
});

app.get("/register" ,(req, res) => {
  res.render("register");
});

app.get("/login" ,(req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.cookie("token",null,{
    httpOnly:true,
    expires:new Date(Date.now())
  });
  res.redirect("/")
});

app.post("/login",async (req, res) => {
  const {email, password} = req.body;
  let user  = await User.findOne({email});
  if(!user){
    return res.redirect("/register");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    return res.render("login",{email,message:"Incorrect password"});
  }
  const token = jwt.sign({_id:user._id},"aedfp9a8er9hap0aw9iejr");
  console.log(token);
  res.cookie("token",token,{
    httpOnly:true,
    expires:new Date(Date.now() + 60*1000)
  });
  res.redirect("/")

});

app.post("/register", async (req, res) => {

  const {name,email,password}  = req.body;
  let user = await User.findOne({email});
  if(user){
    return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password,10);
  user = await User.create({name,email,password:hashedPassword});

  const token = jwt.sign({_id:user._id},"aedfp9a8er9hap0aw9iejr");
  console.log(token);
  res.cookie("token",token,{
    httpOnly:true,
    expires:new Date(Date.now() + 60*1000)
  });
  res.redirect("/")
});


mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });



















// ---------------------------------------------------------------------------------------------------
// // http package is use to create server and handle request and send reponse 
// import http from "http";
// import fs from "fs";
// const home =  fs.readFileSync("./index.html");
// // import * as myobj from "./features.js";
// // console.log(myobj);
// // import name from "./features.js";
// // import {surname,fatherName} from "./features.js";


// // const name = require("./features");
// // console.log(name);
// // console.log(surname,fatherName);

// // here we create the server and handle the request and response
// const server = http.createServer((req,res)=>{
//     if(req.url === "/"){
//         res.end(home);
//     }else if(req.url === "/about"){
//         res.end("<h1>this is  about  page</h1>");
//     }else if(req.url === "/contact"){
//         res.end("<h1>this is contact page</h1>");
//     }else{
//         res.end("<h1>Page not found</h1>");
//     }
// });

// // server will listen to this port 
// server.listen(5000,()=>{
//   console.log("Server is listening on port")
// });