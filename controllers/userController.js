import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from 'nodemailer'
import Otp from "../models/otp.js";

dotenv.config();

/* ================= CREATE USER ================= */
export function postUsers(req, res) {
  const user = req.body;
  const password = req.body.password;

  if (!password) {
    return res.status(400).json({
      message: "Password is required",
    });
  }

  const saltRounds = 10;

  bcrypt.hash(password, saltRounds)
    .then((passwordHash) => {
      user.password = passwordHash;

      const newUser = new User(user);

      return newUser.save();
    })
    .then(() => {
      const otp=Math.floor(1000+Math.random()*9000)
      const newOtp=new Otp({
        email:user.email,
        otp:otp
      })
      newOtp.save().then(()=>{
        sendSampleEmail(user.email.otp)
      })
      res.status(201).json({
        message: "User created successfully"

      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "User creation failed",
      });
    });
}

/* ================= LOGIN USER ================= */
export function loginUser(req, res) {
  const credentials = req.body;

  if (!credentials.email || !credentials.password) {
    return res.status(400).json({
      message: "Email and password required",
    });
  }

  User.findOne({ email: credentials.email })
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      bcrypt.compare(credentials.password, user.password)
        .then((isPasswordValid) => {
          if (!isPasswordValid) {
            return res.status(403).json({
              message: "Incorrect password",
            });
          }

          const payload = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            type: user.type,
          };

          const token = jwt.sign(payload, process.env.JWT_KEY, {
            expiresIn: "48h",
          });

          res.json({
            message: "Login successful",
            user: user,
            token: token,
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({
            message: "Password check failed",
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        message: "Login failed",
      });
    });
}

/* ================= ROLE CHECKS ================= */
export function isAdminValid(req) {
  if (!req.user) return false;
  if (req.user.type !== "admin") return false;
  return true;
}

export function isCustomerValid(req) {
  if (!req.user) return false;
  if (req.user.type !== "customer") return false;
  return true;
}

/* ================= GET USER ================= */
export function getUser(req, res) {
  if (!req.user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    message: "User found",
    user: req.user,
  });
}
export function sendSampleEmail(email,otp){
  const email=req.body.email
  const transport = nodemailer.createTransport({
        service:"gmail",
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        auth:{
          user:process.env.EMAIL,
          pass:process.env.PASSWORD
        }

  })
  const message={
    from:process.env.EMAIL,
    to:email,
    subject:"Sample Email",
    text:"This is a sample email."
  }
  transport.sendMail(message,(err,info)=>{
    if(err){
      console.log(err)
    }else{
      console.log(info)
    }
  })
}
export function deleteUserByEmail(req,res){
  if(!isAdminValid(req)){
    res.status(403).json({
      message:"Forbidden"
    })
    return
  }
  const email=req.params.email
  User.findOneAndDelete({email:email})
  .then(()=>{
    res.json({
      message:"User Deleted"
    })
  }).catch((err)=>{
    res.json({
      message:"User delete failed",
      error:err
    })
  })
}
export function disableUser(req,res){
   if(!isAdminValid(req)){
    res.status(403).json({
      message:"Forbidden"
    })
    return
  }
  const userId=req.params.userid;
  const disabled=req.body.disabled

  User.findOneAndUpdate({_id:userId},{disabled:disabled})
  .then(()=>{
    res.json({
      message:"User disabled/enabled"
    })
  }).catch((err)=>{
    res.json({
      message:"User disable/enable failed",
      error:err
    })
  })
}
export function changeUserType(req,res){
  if(!isAdminValid(req)){
    res.status(403).json({
      message:"Forbidden"
    })
    return
  }
  const userId = req.params.userId
  const type=req.body.type

  User.findOneAndUpdate({_id:userId},{disabled:disabled})
  .then(()=>{
    res.json({
      message:"User type updated"
    })
  }).catch((err)=>{
    res.json({
      message:"User type update failed",
      error:err
    })
  })
}