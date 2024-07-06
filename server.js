const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const otpGenerator=require("otp-generator");
const nodemailer=require("nodemailer");
const cors=require("cors");
const app=express();

app.use(bodyParser.json());
app.use(cors());

const connect = mongoose.connect("mongodb+srv://nitinjha2609:notesmanager@cluster0.fetyubc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
if(connect){
    console.log("Mongo connected"); 
}
else{
    console.log("error")
}

const otpSchema=new mongoose.Schema({
    email: String,
    otp: String,
    createdAt: {type: Date, expires: "5m", default: Date.now}
});

const OTP=mongoose.model("otp", otpSchema);

app.post("/generate", async(req, res)=>{
    const {email}=req.body;
    const otp=otpGenerator.generate(6, {digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});

    try{
        res.status(200).send("OTP sent successfully");
        await OTP.create({email, otp});
        
        const transporter=nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "nitinjha2609@gmail.com",
                pass: "jnaqoiivnkgwgoeq"
            }
        });

        await transporter.sendMail({
            from: "nitinjha2609@gmail.com",
            to: email,
            subject: "OTP verification",
            text: `Your OTP for verification is ${otp}`
        });
    }   catch(error){
        console.log(error);
        res.status(500).send("Error handling OTP");
    }
});

app.post("/verify", async(req, res)=>{
    const {email, otp}= req.body;

    try{
        const otpRecord = await OTP.findOne({email, otp}).exec();
        if(otpRecord){
            res.status(200).send("OTP verified successfully");
        }
        else{
            res.send("Invalid OTP")
        }
    }   catch(error){
        console.log("error")
    }
})

app.listen(3000, ()=>{
    console.log("Server running")
})