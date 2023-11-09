const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();

const corsConfig = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("*", cors(corsConfig));
app.use(cookieParser());

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

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        res.status(401).send({ message: "unauthorized access" });
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "unauthorized access" });
        } else {
            req.user = decoded;
            next();
        }
    });
};

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
    }
}
run().catch(console.dir);
const jobsDatabase = client.db("jobsDatabase").collection("jobs");
const bitsDatabase = client.db("jobsDatabase").collection("bits");

app.post("/jwt", async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.TOKEN_SECRET, {
        expiresIn: "2h",
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    }).send({ success: true });
});
app.post("/logout", async (req, res) => {
    const user = req.body;
    console.log("logging out", user);
    res.clearCookie("token", {
        maxAge: 0,
        sameSite: "none",
        secure: true,
    }).send({ success: true });
});

app.get("/jobs", async (req, res) => {
    try {
        const result = await jobsDatabase.find().toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
});
app.get("/posted-jobs/:email", verifyToken, async (req, res) => {
    try {
        const email = req.params.email;
        if (email !== req.user.email) {
            return res.status(403).send({ message: "forbidden access" });
        }
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

app.get("/bits", verifyToken, async (req, res) => {
    try {
        const result = await bitsDatabase.find().toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
});
app.get("/bits/:email", verifyToken, async (req, res) => {
    try {
        const userEmail = req.params;
        if (userEmail.email !== req.user.email) {
            return res.status(403).send({ message: "forbidden access" });
        }
        const result = await bitsDatabase
            .find({ userEmail: userEmail.email })
            .sort({ status: 1 })
            .toArray();
        res.send(result);
    } catch (error) {
        console.log(error);
    }
});
app.get("/bits-requests/:email", verifyToken, async (req, res) => {
    try {
        const userEmail = req.params;
        if (userEmail.email !== req.user.email) {
            return res.status(403).send({ message: "forbidden access" });
        }
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
app.get("/bits/:email/:id", verifyToken, async (req, res) => {
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
        const status = req.body.updatedData.status;
        const progress = req.body.updatedData.progress;
        console.log(status, progress);
        const result = await bitsDatabase.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: { status, progress },
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

app.get("/", (req, res) => {
    res.send("Server working");
});
app.listen(port, () => {
    console.log("server working");
});
