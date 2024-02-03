const db = require('./db');
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");

// const { Server } = require("socket.io");

// const io = new Server(server);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

connuri = 'mongodb+srv://smritiraijenkins:smritirai@basedb.ehpdnbf.mongodb.net/?retryWrites=true&w=majority'

mongoose.connect(connuri, {
    ssl: true,
  }).then(() => {
    console.log("Database Connected ✅");
  }).catch((error) => {
    console.error("Database Connection Error ❌", error);
  });
  
app.use(bodyParser.json());
// SETTING UP CORS
// app.use(cors());

//  FUNCTIONS
function jwtauth(req,res,next){
    let token = req.body._t;
    if(token){

        let payload = null;
        try{
            payload = jwt.verify(token, "puppies-are-better-than-kittens");
            req.userId = payload.userId;
            next();
        }catch(e){
            console.log(e);
            res.status(402).json({msg:"Woah! you are not authorized to do this."}).send();
        }
        return payload;
    }
    else{
        res.status(401).json({msg:"Woah! you are not authorized to do this."}).send();
    }
}

app.get('/userAuth', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/userAuth.html'));
});

app.get('/quiz', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/fu.html'));
});

app.get('/table', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/table.html'));
});


app.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/register.html'));
});


app.get('/login', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/carpool', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/carpool.html'));
});

app.get('/homepage', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.post('/createCfc',jwtauth, async (req, res) => {
    const {score} = req.body;
    try {
        // Create a new Cfc
        const newCfc = await db.Cfc.create({
            _score : score
        });

        // Get the user ID from req.userId
        const userId = req.userId;

        // Find the user by ID and push the newCfc's ID into _cfc array
        const user = await db.User.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user._cfc.push(newCfc._id);
        await user.save();

        res.status(200).json({ msg: 'Cfc created and added to user _cfc array' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Internal Server Error' });
    }
});

app.post('/setUserLocation', jwtauth, async(req,res)=>{
    userId = req.userId;
    const {latt,long} = req.body;
    if(!latt || !long){
        return res.status(401).json({msg:"Data not Suff!"});
    }
    else{
        // findOneAndUpdate({filter},{update})
        db.User.findOneAndUpdate({'_id' : userId}, {currentUserLatt : latt,currentUserLong : long}).then(async(r)=>{
            if(r){
                res.status(200).send();
            }
            else{
                res.status(405).send();
            }
        });
    }    
});

app.post('/getUsersLocation', jwtauth, async(req,res)=>{
    userId = req.userId;
    db.User.find({}).then(async(r)=>{
        if(r){
            data = Array();
            r.forEach(rr => {
                if(rr._id != userId)
                    data.push(rr);
            });
            console.log(data);
            res.status(200).json(data).send();
        }
        else{
            res.status(405).json(data).send();
        }
    }).catch(err=>res.status(200).json({err}).send());
});

app.post("/login", (req, res) => {
    const {email,password} = req.body;
    if( !email  || !password ){
        res.status(401).json({msg:"Invalid Input"}).send();
        return;
    }
    db.User.findOne({email:email}).then(async (r)=>{
         // Dublicate Email found!
         console.log(r);
         if(r){
            if(await bcrypt.compare(password, r.password)){
                // Create a JWT token here!

                const payload = {
                    userId: r._id,
                };
                const token = jwt.sign(payload, "puppies-are-better-than-kittens", {
                    expiresIn: "86400s",
                });

                res.status(200).json({msg:"Success! Login", _t : token}).send();
            }
            else{
                res.status(422).json({msg:"Not Authorizeda!"}).send();
            }
        }
        else{
            return res.status(422).json({msg:"No User Found!"}).send();
        }
    }).catch((e)=>{console.log(e);return res.status(422).send();});
    // Find User
});


app.post('/register', async (req,res)=>{
    // Get all information
    const {name,email,phone,password} = req.body;
    if(!name || !email || !phone || !password ){
        res.status(401).json({msg:"Invalid Input"}).send();
        return;
    }
    // Check for dublicate email
    db.User.findOne({email : email})
    .then(async (r) => {
        // Dublicate Email found!
        if(r){
            return res.status(422).json({msg:"Dublicate Email Used! This will be reported."}).send();
        }
        else{
            // Hash the password using bcrypt
            const hashed = await bcrypt.hash(password, 10);
            // Generating Carpool Doc
            const carpool = await db.Carpool({cRegNo : "0", cModel : "0", pFlag : true}).save();
    
            const newUser = new db.User({name,email,phone,password : hashed, _cfc : [], _carpoolId : carpool._id});
            await newUser.save();
            res.status(200).json({msg:"Success!", _id : newUser._id}).send();
        }
    })
    .catch((e)=>{console.log(e); return res.status(422).json({msg:"Internal Server Error! Reported."}).send();});
});

app.post('/getuserdata', jwtauth ,async (req,res)=>{
    userId = req.userId; //
    db.User.findOne({'_id' : userId}).then(r=>{
        if(r){
            // User Mila
            res.status(200).json(r).send();
        }
        else{
            // nahi
            res.status(401).send();
        }
    }).catch(e=>{
        res.status(500).send();
    })
});


app.listen(3000, ()=>{
    console.log('App Started @ http://localhost:3000');
});