const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.iii2gbo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
        const jobsDatabase = client.db("jobsDatabase").collection("jobs");

        app.get("/jobs", async (req, res) => {
            const result = await jobsDatabase.find().toArray();
            res.send(result);
        });
        app.get("/jobs/:category", async (req, res) => {
            const category = req.params?.category;
            console.log(category);
            const result = await jobsDatabase
                .find({ category: category })
                .toArray();
            res.send(result);
        });
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Server working");
});
app.listen(port, () => {
    console.log("server working");
});
