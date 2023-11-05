const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server working");
});
app.listen(port, () => {
    console.log("server working");
});
