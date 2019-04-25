const express = require('express');
const router = express.Router();
const Pet = require('../models/pet')


router.get('/',(req,res)=>{
	res.send('Pet')
})

router.get('/new', (req,res)=>{
	res.render('pet/new.ejs',{
	})
})

router.get('/:id', (req,res)=>{
	res.render('pet/show.ejs',{
	})
})



router.post('/', async(req,res)=>{
	  try{

		const petCreated = await Pet.create(req.body)
		res.render('pet/show.ejs',{
			pet: petCreated
		})
	  		
	  }
	  catch(err){
	  		res.send(err)
	  }
})
module.exports = router;