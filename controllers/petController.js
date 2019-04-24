const express = require('express');
const router = express.Router();
const Pet = require('../models/pet')


router.get('/',(req,res)=>{
	res.send('Pet')
})

router.get('/new', (req,res)=>{
	res.render('pet/new.ejs',{
		msg: "rendering new page"
	})
})

module.exports = router;