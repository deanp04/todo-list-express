const express = require('express') //making it possible to use express in this file
const app = express() //setting a constant and assigning it to the instance of express
const MongoClient = require('mongodb').MongoClient //makes it possible to use methods associated with MongoClient and talk to our DB
const PORT = 2121 //setting a constant to define the loccation where our server will be listening
require('dotenv').config() //allows us to look for variable inside of the .env file


let db, //declar a variable called db but not assign a value
    dbConnectionStr = process.env.DB_STRING, //declaring a variable and assigning our database connection string to it
    dbName = 'todo' //declaring a variable and assignin the name of the database we will be using

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }) //creating a connection to MongoDB, and passing in our connection string. also passing in ad additional property
    .then(client => { //waitingfor the connection and proceeding if successful, and passing in all the lcient information
        console.log(`Connected to ${dbName} Database`) //log to the conole a template literal "connected to todo database"
        db = client.db(dbName) //assigning a value to previouslydeclared DB variabel that contains a db client factory method
    }) //closing our .then

// middleware
app.set('view engine', 'ejs') //sets EJS as the default render method
app.use(express.static('public')) //set s the location for static assets
app.use(express.urlencoded({ extended: true })) //tells express to decode and encode URLs where the header matches the content. supports arrays and objects
app.use(express.json()) //parses JSON content from incoming requests


app.get('/',async (request, response)=>{ //starts a GET method when the root is passed in sets up req and res parameters
    const todoItems = await db.collection('todos').find().toArray() //sets a variable and awaits ALL items from the todos collection
    const itemsLeft = await db.collection('todos').countDocuments({completed: false}) //sets a variable and awaits a count o funcompleted items to later display in EJS
    response.render('index.ejs', { items: todoItems, left: itemsLeft }) //rendering the EJS file and passing through the dv items and the count remaing inside of an object
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    .catch(error => console.error(error))
})

app.post('/addTodo', (request, response) => { //starts a POST method when the add route is passed in
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false}) //inserts a new item into todos collection, gives it a completed value of false by default
    .then(result => { //if insert is successful, do somethign
        console.log('Todo Added') //console log action
        response.redirect('/') //gets rid of the /addTOdo route, and redirects back to the homepage
    }) //clsoing the .then
    .catch(error => console.error(error)) //catching errors
}) //ending the POST

app.put('/markComplete', (request, response) => { //starts a PUT method when the markComplete route is passed in
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //look in the db fro one item matching the name of thee item passed in from the main.js file that was clicked on
        $set: {
            completed: true //set completed status to true
          } //
    },{ //
        sort: {_id: -1}, //move item to the bottom of the list
        upsert: false //prevents insertion if item does not already exist
    }) //
    .then(result => { //starts a then if update was successful
        console.log('Marked Complete') //loggin successful complettion
        response.json('Marked Complete') //sending a respopnse back to the sender
    }) //closing .then
    .catch(error => console.error(error)) //catching errors

}) //closing PUT

app.put('/markUnComplete', (request, response) => { //
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{ //
        $set: { //
            completed: false //set completed status to false
          } //
    },{ //
        sort: {_id: -1}, //move item to the bottom of the list
        upsert: false //prevents insertion if item does not already exist
    }) //
    .then(result => { //starts a then if update was successful
        console.log('Marked Complete') //loggin successful complettion
        response.json('Marked Complete') //sending a respopnse back to the sender
    }) //closing .then
    .catch(error => console.error(error)) //catching errors

}) //closing PUT

app.delete('/deleteItem', (request, response) => { ////starts a delete method when the delete route is passed
    db.collection('todos').deleteOne({thing: request.body.itemFromJS}) //look inside thetodos collection for the ONE item that has aa matching name from our JS file
    $set: { //
    .then(result => { // starts a then if delete was successful
        console.log('Todo Deleted') //loggin a successful completion
        response.json('Todo Deleted') //sending a response completion
    }) //closing .then
    .catch(error => console.error(error)) //cathcin gerrors

}) //closinng delete

app.listen(process.env.PORT || PORT, ()=>{ //setting up which port listening on -either the port or .env variable we set
    console.log(`Server running on port ${PORT}`) //console.log the running port
}) //end the listen method