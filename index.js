const express = require("express");
const app = express();
const cors = require("cors");
// const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 6001;
const stripe = require("stripe")(process.env.STRIPE_SECRITE_KEY);

// medilware
app.use(cors());
app.use(express.json());

// console.log(process.env.VERYF_ACCESS_TOKEN);

// mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jg43ilw.mongodb.net/foodapps?retryWrites=true&w=majority&appName=Cluster0`)
// .then(console.log(" connection to mongodb successfully"))
// .catch((error) => console.log("error connection to mongodb",error))

// inport router here use mongoose
// const menuRouters = require('./api/routes/menuRoutes')
// const cartRoutes = require('./api/routes/cartsRoute')
// app.use('/menu', menuRouters);
// app.use('/addCart',cartRoutes);

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

    const menuCollections = client.db("foodapps").collection("menus");
    const cartMenuCollections = client.db("foodapps").collection("cartItem");
    const userCollections = client.db("foodapps").collection("user");

    // jwt authication
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.VERYF_ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    // verifyToken  jwt token
    // middleware

    const verifyToken = (req, res, next) => {
      if (!req.headers.authorization) {
        return res.status(401).send({ message: "unauthorixed access" });
      }
      const token = req.headers.authorization.split(" ")[1];

      jwt.verify(token, process.env.VERYF_ACCESS_TOKEN, (err, decoded) => {
        if (err) {
          return res.status(401).send({ message: "token invalid!" });
        }
        req.user = decoded?.email;
        next();
      });
    };

    // verifyAdmine
    const verifyAdmin = async (req, res, next) => {
      const email = req.user;
      // console.log(email,"get email");
      const query = { email: email };
      const user = await userCollections.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    // all menu get api
    app.get("/menu", async (req, res) => {
      const result = await menuCollections.find().toArray();
      res.send(result);
    });

    app.post("/menu", async (req, res) => {
      const menuitems = req.body;
      const result = await menuCollections.insertOne(menuitems);
      res.send(result);
    });

    app.get("/menu/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: id };
      const result = await menuCollections.findOne(filter);
      res.send(result);
    });

    app.delete("/menu/:id", verifyToken, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: id };
      const result = await menuCollections.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    app.patch("/menu/:id", verifyToken,verifyAdmin, async (req, res) => {
      const menuId = req.params.id;
      const { name, recipe, image, category, price } = req.body;
      try {
        const updatedMenu = await menuCollections.updateOne(
          { _id: menuId },
          { $set: { name, recipe, image, category, price } }, 
          { runValidators: true } 
        ); 

        if (updatedMenu.nModified === 0) {
          return res.status(404).json({ message: "Menu not found" });
        }
        res.status(200).json({ message: "Menu item updated successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
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

    app.delete("/addCart/:id", verifyToken, async (req, res) => {
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
      const result = await cartMenuCollections.updateOne(
        filter,
        updateDoc,
        options
      );
    });

    // get all user
    app.get("/users", verifyToken, async (req, res) => {
      const result = await userCollections.find().toArray();
      res.send(result);
    });

    // post all user
    app.post("/user", async (req, res) => {
      const userItem = req.body;
      const result = await userCollections.insertOne(userItem);
      res.send(result);
    });


    app.get("/users/admin/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollections.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });

    // user roll update
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // user deleted

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollections.deleteOne(query);
      res.send(result);
    });




    app.post("/create-payment", async (req, res) => {
      const {price} = req.body;
      const amount = price*100

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
      payment_method_types: ['card']

      });
    
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
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
