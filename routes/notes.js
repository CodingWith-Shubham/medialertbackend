const express = require('express')
const fetchuser = require('../Middleware/fetchuser')
const Note = require('../modules/Notes')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const Notes = require('../modules/Notes');
//route for fetching (crud me read wala )
router.get('/fetchnotes',fetchuser,async (req,res)=>{
    try {
        
  
   const notes =  await Note.find({user: req.user.id})
    res.json(notes)
} catch (error) {
    console.error(error.message)
    res.status(500).send("internal server error")
}

    // console.log(req.body)
    // const user = User(req.body)
    // user.save()
    // res.send(req.body)
})
module.exports = router
//route for creating notes(crud me create wala)
router.post('/addnotes',fetchuser,[
    body('title').isLength({ min: 3 }).withMessage('Enter a valid title'),
    body('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),
],async(req,res)=>{
    try {
        
    
    const {title,description} = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   const note = new Note({
    title,description,user: req.user.id
   })
   const savedNote = await note.save()
    res.json(savedNote)
}catch (error) {
    console.error(error.message)
    res.status(500).send("internal server error")
}

}

)
router.put('/updatenotes/:id',fetchuser,async(req,res)=>{
 const {title,description} = req.body
 //create new note obj 
 const newnote = {}
 if(title){
newnote.title  = title
 }
 if(description){
    newnote.description  = description
     }
     //find the notes to be updated and update it;
     let findnotes =await Notes.findById(req.params.id)
     if(!findnotes){
      return  res.status(404).send("Not Found")
     }
     if(findnotes.user.toString() !== req.user.id){
return res.status(401).send("Not allowed")
     }
     findnotes = await Notes.findByIdAndUpdate(req.params.id,{$set:newnote},{new:true})
     res.json({findnotes})
    //  const updatednotes = await findByIdAndUpdate()
}
)
//route to delete data
router.delete('/deletenotes/:id', fetchuser, async (req, res) => {
    try {
        // Find the note by its ID
        let findnotes = await Notes.findById(req.params.id);
        
        // Check if the note exists
        if (!findnotes) {
            return res.status(404).send("Not Found");
        }
        
        // Check if the logged-in user is the one who created the note
        if (findnotes.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }
        
        // Delete the note
        await Notes.findByIdAndDelete(req.params.id);
        
        // Send a success response
        res.json({ "Success": "Deleted Successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router