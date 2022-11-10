const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 4000;
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.1hzognu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db("alex");
    const services = database.collection("services");
    const reviews = database.collection("reviews");
    client.connect();

    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });
    app.get("/", async (req, res) => {
      const query = {};
      const cursor = services.find(query).limit(3);
      const service = await cursor.toArray();
      res.status(200).send(service);
    });
    app.get("/all", async (req, res) => {
      const query = {};
      const cursor = services.find(query);
      const service = await cursor.toArray();
      res.status(200).send(service);
    });
    app.get("/services/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const service = await services.findOne(query);
      res.status(200).send(service);
    });
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviews.insertOne(review);
      res.status(200).send(result);
    });
    app.get("/review/:serviceId", async (req, res) => {
      const serviceId = req.params.serviceId;
      const query = { serviceId };
      const cursor = reviews.find(query).sort({ date: -1 });
      const review = await cursor.toArray();
      res.status(200).send(review);
    });
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await services.insertOne(service);
      res.status(200).send(result);
    });
    app.get("/review", async (req, res) => {
      const query = req.query;
      console.log(query);
      const token = req.headers.authorization.split(" ")[1];
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decoded) => {
          if (err) {
            return res.status(401).send({ error: "unauthorized access" });
          }
          console.log(decoded);
          if (query.email === decoded.user) {
            const cursor = reviews.find(query);
            const result = await cursor.toArray();
            return res.status(200).send(result);
          }
          return res.status(403).send({ error: "Invalid access token" });
        }
      );
    });
    app.delete("/review/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const result = await reviews.deleteOne(query);
      res.status(200).send(result);
    });
    app.patch("/review/:id", async (req, res) => {
      const query = { _id: ObjectId(req.params.id) };
      const updateDoc = {
        $set: {
          review: `${req.body.msg}`,
        },
      };
      const result = await reviews.updateOne(query, updateDoc);
      res.status(200).send(result);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
