const express = require('express');
const router = express.Router();
const {google} = require('googleapis');
const queryString = require('query-string');
const User   = require('../models/user');
const fs = require('fs');

const googleConfig = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirect: process.env.CLIENT_ROUTE
};

const defaultScope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/userinfo.email',
];

/*************/
/** HELPERS **/
/*************/

function createConnection() {
  return new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirect
  );
}

function getConnectionUrl(auth) {
  return auth.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: defaultScope
  });
}

function getGooglePlusApi(auth) {
  return google.plus({ version: 'v1', auth });
}

/**********/
/** MAIN **/
/**********/

/**
 * Part 1: Create a Google URL and send to the client to log in the user.
 */
const urlGoogle = () => {
  const auth = createConnection();
  const url = getConnectionUrl(auth);
  return url;
}

router.post('/google', async (req, res, next) => {
	try {
		req.session.lat = await req.body.lat
		console.log(req.body.lat + ' =========== the req.body.lat lat at googleurl');
		req.session.lng = await req.body.lng
		res.redirect('/auth/googleurl')

	} catch (err) {
		next(err)
	}		
})

router.get('/googleurl', async (req,res, next)=>{
	res.redirect(urlGoogle())
})


const getGoogleAccountFromCode = async(code)=> {
  
  // get the auth "tokens" from the request
  const auth = await createConnection();
  const data = await auth.getToken(code);
  const tokens = data.tokens;
  
  // add the tokens to the google api so we have access to the account
  auth.setCredentials(tokens);
  
  // connect to google plus - need this to get the user's email
  const plus = getGooglePlusApi(auth);
  const me = await plus.people.get({ userId: 'me' });
  console.log(me);
  // get the google id and email
  // const userGoogleData = me.data;
  const userGooglegivenName = me.data.name.givenName;
  const userGoogleName = me.data.displayName;
  const userGoogleImg = me.data.image.url;
  const userGoogleEmail = me.data.emails && me.data.emails.length && me.data.emails[0].value;
  // console.log(userGooglegivenName);
  // return so we can login or sign up the user
  console.log(userGooglegivenName + ' ============ givenname');
  console.log(userGoogleName + ' ============ name');
  console.log(userGoogleEmail + ' ============ email');
  return {
  	givenName: userGooglegivenName,
    name: userGoogleName,
    img: userGoogleImg,
    email: userGoogleEmail,
    tokens: tokens // you can save these to the user if you ever want to get their details without making them log in again
  };
}


// console.log('My url===================');
// console.log(urlGoogle())


router.get('/login', async(req, res, next) => {
	try {
		
		// res.query is how express get the params passed into the url
		// in this case we are receiving two params sended to from googles serve.
		// 1 -> code
		// 2 -> scope
		// we will get the code (req.query.code) and call google api to get the users info
		
		const code = req.query.code;
		const userInfo = await getGoogleAccountFromCode(code)
		console.log(userInfo.lat + ' ============= is user info lat');
		// look for the user in the date base using email provided by the google API.

		console.log(req.session.lat + ' ============ is the session lat');
		const userFound = await User.findOne({email:userInfo.email})

		// console.log("userFound");
		// console.log(userFound);

		// if user exist, complete the logging and redirect to /users page.
		if (userFound){

			req.session.userDbId = userFound._id
        	req.session.logged = true
        	req.session.username = userFound.username
        	req.session.message = ''
        	req.session.updated = ''
        	res.redirect('/users')
		}
		else{
			// if user don't exist, register a new user and redirect to /users page.
			console.log("user don't exist");

			console.log(req.body);
			let filePath;
			// if (req.file){
			//   	filePath = './' + req.file.path;
			// }
			// else{
			  	filePath = './public/images/no-profile-picture-icon.jpg';
			// }
			// create and object for the db entry
			const userDbEntry = {};
			if (userInfo.givenName === undefined || userInfo.givenName === '') {
				userDbEntry.username = userInfo.email.split('@').shift()
			} else {

				userDbEntry.username = userInfo.givenName;
			}
			// userDbEntry.password = passwordHash;
			userDbEntry.name = userInfo.name;
			userDbEntry.email = userInfo.email;
			// userDbEntry.lat = req.body.lat
  	// 		userDbEntry.lng = req.body.lng

			// userDbEntry.phone = req.body.phone;
			// userDbEntry.zipcode = req.body.zipcode;
			// userDbEntry.photo = req.body.photo;
	  
		 	const createdUser = await User.create(userDbEntry)
		    createdUser.photo.data = fs.readFileSync(filePath);
		    createdUser.lat = req.session.lat
		    createdUser.lng = req.session.lng
		    createdUser.save()
		 	console.log(createdUser + ' ============ created user');
		    
		    req.session.logged = true;
		    req.session.userDbId = createdUser._id
		    req.session.username = createdUser.username
		    req.session.message = ''
		    req.session.updated = ''

		    if (filePath !== './public/images/no-profile-picture-icon.jpg'){
			    fs.unlink(filePath, (err) => {
			    	if(err) next(err);
				});
			}

		    res.redirect('/users')
			}
		
	}
	catch (err) {
		next(err)
	}				
});



module.exports = router;





