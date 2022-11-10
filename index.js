const express = require("express");
const cors = require("cors");
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
      console.log(req.query, req.body);
      res.status(200).send(result);
    });
    app.get("/review/:serviceId", async (req, res) => {
      const serviceId = req.params.serviceId;
      const query = { serviceId };
      const cursor = reviews.find(query);
      const review = await cursor.toArray();
      res.status(200).send(review);
      console.log(serviceId);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
