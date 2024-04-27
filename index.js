const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 6001;

// medilware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jg43ilw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const menuCollections = client.db("foodapps").collection("menu");
    const cartMenuCollections = client.db("foodapps").collection("cartItem");

    // all menu get api
    app.get("/menu", async (req, res) => {
      const result = await menuCollections.find().toArray();
      res.send(result);
    });

    // add cart time post api

    app.post("/addCart", async (req, res) => {
      const cartItem = req.body;
      const result = await cartMenuCollections.insertOne(cartItem);
      res.send(result);
    });

    // get gamil same api in cart items

    app.get("/addCart", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await cartMenuCollections.find(filter).toArray();
      res.send(result);
    });

    // get cart id spacify
    app.get("/addCart/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await cartMenuCollections.findOne(filter);
      res.send(result);
    });

    // add cart delet get id

    app.delete("/addCart/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await cartMenuCollections.deleteOne(filter);
      res.send(result);
    });

    // update carts quentity

    app.put("/addCart/:id", async (req, res) => {
      const id = req.params.id;
      const { quantity } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: parseInt(quantity, 10),
        },
      };
      const result = await cartMenuCollections.updateOne(filter, updateDoc, options);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World! hr ");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
