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

app.get("/api/films", (req, res) => {
    fs.readFile(path.join(__dirname, "films.json"), "utf-8", (err, data) => {
        if (err) res.json({
            result: []
        })

        res.json({
            result: JSON.parse(data)
        })
    })        
})

         

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))
