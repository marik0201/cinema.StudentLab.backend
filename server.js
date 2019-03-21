const express = require("express");
const bodyParser = require("body-parser")
const cors = require("cors")
const fs = require("fs");
const path = require("path");
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const Schema = mongoose.Schema;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
mongoose.connect('mongodb://localhost/Cinema', function (err) {
 
   if (err) throw err;
 
   console.log('Successfully connected');
 
});

const filmScheme = new Schema({
    name: String,
    url: String
});

const Film = mongoose.model("Film", filmScheme);


app.get("/api/films", (req, res) => {  
    Film.find({}, function(err, docs){ 
        if(err) return console.log(err);
         
        res.json({
            result: docs
        })
    });

        
})

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))
