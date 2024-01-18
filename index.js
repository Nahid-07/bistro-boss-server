const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.BISTRO_DB}:${process.env.BISTRO_DB_PASS}@cluster0.ugpmzsn.mongodb.net/?retryWrites=true&w=majority`;
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("boss server is running");
});

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

    const menuCollection = client.db("Bistro-boss").collection("menu");
    const reviewCollection = client.db("Bistro-boss").collection("review");
    const cartCollection = client.db("Bistro-boss").collection("cart");
    const userCollection = client.db("Bistro-boss").collection("user");

    // menu item get api
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });

    // review item get api
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
    // insert cart item to the db
    app.post("/cart", async (req, res) => {
      const cartItems = req.body;
      const result = await cartCollection.insertOne(cartItems);
      res.send(result);
    });
    // get cart item
    app.get("/cart", async (req, res) => {
     const email = req.query.email;
     if(!email){
      res.send([])
     }
     const query = {userEmail : email}
      const cartData = await cartCollection.find(query).toArray();
      console.log(cartData);
      res.send(cartData);
    });
    
    // delete order from the user cart
    app.delete('/cart/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    });

    // save user to the database
    app.post('/user', async(req,res)=>{
       const userData = req.body;
       const result = await userCollection.insertOne(userData);
       res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`bistro running ${port}`);
});
