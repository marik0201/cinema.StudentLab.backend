const express = require("express");
const bodyParser = require("body-parser")
const cors = require("cors")
const fs = require("fs");
const path = require("path")


const app = express();

const PORT = 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    fs.readFile(path.join(__dirname, "message.json"), "utf-8", (err, data) => {
        if (err) res.json({
            result: []
        })

        res.json({
            result: JSON.parse(data)
        })
    })        
})

app.post("/create", (req, res) => {
    console.log("body", req.body);
    
    fs.writeFile('message.json', JSON.stringify(req.body),  err => {
        if (err) throw err;
        console.log('Saved!');
    });
    
    res.json({
        data: "ok"
    })
})

app.post("/delete", (req, res) => {
    console.log("body", req.body);
    
    fs.writeFile('message.json', JSON.stringify(req.body),  err => {
        if (err) throw err;
        console.log('Saved!');
    });
    
    res.json({
        data: "ok"
    })
         
})

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))
