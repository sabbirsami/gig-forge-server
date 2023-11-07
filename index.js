const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

const corsConfig = {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(express.json());
app.use(cors(corsConfig));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        const bitsDatabase = client.db("jobsDatabase").collection("bits");

        app.get("/jobs", async (req, res) => {
            try {
                const result = await jobsDatabase.find().toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.get("/posted-jobs/:email", async (req, res) => {
            try {
                const email = req.params.email;
                const result = await jobsDatabase
                    .find({ employer_email: email })
                    .toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.delete("/jobs/:email/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const result = await jobsDatabase.deleteOne({
                    _id: new ObjectId(id),
                });
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.put("/jobs/:email/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const job = req.body;
                const result = await jobsDatabase.updateOne(
                    {
                        _id: new ObjectId(id),
                    },
                    { $set: job }
                );
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.post("/jobs", async (req, res) => {
            try {
                const job = req.body;
                const result = await jobsDatabase.insertOne(job);
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });

        app.get("/bits", async (req, res) => {
            try {
                const result = await bitsDatabase.find().toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.get("/bits/:email", async (req, res) => {
            try {
                const userEmail = req.params;
                const result = await bitsDatabase
                    .find({ userEmail: userEmail.email })
                    .sort({ status: 1 })
                    .toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.get("/bits-requests/:email", async (req, res) => {
            try {
                const userEmail = req.params;
                const result = await bitsDatabase
                    .find({ employer_email: userEmail.email })
                    .toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.patch("/bits-request/:email/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const status = req.body;
                const result = await bitsDatabase.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: status,
                    }
                );

                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.get("/bits/:email/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const result = await bitsDatabase
                    .find({ _id: new ObjectId(id) })
                    .toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.patch("/bits/:email/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const status = req.body;
                const result = await bitsDatabase.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $set: status,
                    }
                );
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.post("/bits", async (req, res) => {
            try {
                const bit = req.body;
                const result = await bitsDatabase.insertOne(bit);
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.get("/jobs/:category", async (req, res) => {
            try {
                const category = req.params?.category;
                console.log(category);
                const result = await jobsDatabase
                    .find({ category: category })
                    .toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
        });
        app.get("/job/:id", async (req, res) => {
            try {
                const id = req.params?.id;
                const result = await jobsDatabase
                    .find({ _id: new ObjectId(id) })
                    .toArray();
                res.send(result);
            } catch (error) {
                console.log(error);
            }
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
