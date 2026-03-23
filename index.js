const port = process.env.PORT || 3000;
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require("cors");
const app = express();





// middleware
app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://smart-deals:8M3IQcZ3zHYox4DL@cluster0.qr2egdp.mongodb.net/?appName=Cluster0";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get("/",(req,res)=>{
    res.send("smart server is now running...")
})



async function run() {
  try {
    // Connect the client to the server	
    await client.connect();
    
    const db = client.db("smart_db");
    const productCollection = db.collection("products");
    const bidsCollection = db.collection("bid");
    const usersCollection = db.collection("users");


    app.post("/users",async(req,res)=>{
        const newUsers = req.body;

        const email = req.body.email;
        const query = { email:email }
        const existingUser = await usersCollection.findOne(query)
        if(existingUser){
          res.send({message:"already exist user"})
        }
        else{
          const result = await usersCollection.insertOne(newUsers);
        res.send(result);
        }
    })



    app.get("/products",async(req,res)=>{

      console.log(req.query);
      const email = req.query.email;
      const query = {}
      if(email){
        query.email = email;
      }

      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })


    app.get("/latest-products",async(req,res)=>{
      const cursor = productCollection.find().sort({created_at: -1}).limit(6);
      const result = await cursor.toArray();
      res.send(result)
    })





    app.post("/products",async(req,res)=>{
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
    })

        app.get("/products/:id",async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await productCollection.findOne(query);
      res.send(result);
    })


    app.patch("/products/:id", async(req,res)=>{
      const id = req.params.id;
      const updatedProducts = req.body;
      const query = { _id: new ObjectId(id)}
      const update = {
        $set: {
          name: updatedProducts.name,
          price:updatedProducts.price
        }
      }

      const result = await productCollection.updateOne(query,update);
      res.send(result);
    })

    app.delete("/products/:id", async(req,res)=>{
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}
      const result = await productCollection.deleteOne(query);
      res.send(result)
    })


    app.get("/bids",async(req,res)=>{
      const email = req.query.email;
      const query = {};
      if(email){
        query.buyer_email=email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post("/bids",async(req,res)=>{
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);



app.listen(port,()=>{
    console.log(`smart server is running on port: ${port}`);
})