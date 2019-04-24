const express = require('express');
const router = express.Router();
const Pet = require('../models/pet')


router.get('/',(req,res)=>{
	res.send('Pet')
})

module.exports = router;