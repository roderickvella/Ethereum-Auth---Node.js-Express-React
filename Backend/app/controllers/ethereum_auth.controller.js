
const db = require("../models");
const config = require("../config/auth.config");

const User = db.user;
const AuthDetail = db.authdetail;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var moment = require('moment');
var {recoverPersonalSignature} = require('@metamask/eth-sig-util');
var {bufferToHex} = require('ethereumjs-util');



const getRandomNonceMessage= (nonce) =>{
    return 'Please prove you control this wallet by signing this random text: ' + nonce;
}

 /** Save and get a unique challenge for signing by user. */
exports.auth_challenge  = async (req, res) => {
    const address = req.body.address.toLowerCase();
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const unix = moment().unix();

    const t = await db.sequelize.transaction();
    try {
        //load by user address (if not found, create new user)
        const [user, user_created] = await User.findOrCreate({
            where: { address: address },
            defaults: {
                address: address
            },
            include:  {model: AuthDetail, as: "AuthDetail"}, 
            transaction: t 
        });
               
        if(user_created){
            //create new authdetail
            const authDetail = await AuthDetail.create({ nonce: nonce, timestamp:unix }); 
            await user.setAuthDetail(authDetail, {transaction: t });
        }
        else{        
            //update existing authdetail
            user.AuthDetail.set({nonce:nonce, timestamp:unix });
            await user.AuthDetail.save({transaction: t });
        }
        
        await t.commit();
        res.status(200).send({ message: getRandomNonceMessage(nonce) }); 
      
      } catch (error) {          
        await t.rollback();
        console.log(error);
        res.status(500).send({ message: error.message });
      }
}

exports.auth_verify  = async (req, res) => {
    const address = req.body.address.toLowerCase();
    const signature = req.body.signature;
    try {
        //load user by public address
        const user = await User.findOne({ where: { address: address},include:  {model: AuthDetail, as: "AuthDetail"} });
        if(!user) return res.status(401).send({ message: "User Not found." });
        
        //get authdetails for user
        const nonce = user.AuthDetail.nonce;
        const timestamp_challenge = user.AuthDetail.timestamp;

        //check time difference       
        var diff_sec = moment().diff(moment.unix(timestamp_challenge),'seconds');            
        if(diff_sec>300)return res.status(401).send({ message: "The challenge must have been generated within the last 5 minutes" });  
        
        const signerAddress = recoverPersonalSignature({
            data: bufferToHex(Buffer.from(getRandomNonceMessage(nonce), 'utf8')),
            signature: signature,
        });

        if (address !== signerAddress.toLowerCase())
            return res.status(401).send({ message: "Invalid Signature" });

        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).send({        
            address: user.address,
            accessToken: token
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
    }
    
}

