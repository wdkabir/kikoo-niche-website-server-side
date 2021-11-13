const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const cors = require('cors')
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())

app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fumur.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("kikoo");
      const productsCollection = database.collection("products");
      const orderCollection = database.collection('order');
      const usersCollection = database.collection('user');
      const reviewCollection = database.collection('reviews');
      // post api
      app.post('/products', async (req, res) =>{
          const product = req.body;
          const result = await productsCollection.insertOne(product);
          res.json(result)
      });

      // get products
      app.get('/products', async (req, res) =>{
          const product = productsCollection.find({});
          const result = await product.toArray();
          res.send(result);
      });
      // review post api
      app.post('/reviews', async (req, res) =>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.json(result)
    });
    // get products
    app.get('/reviews', async (req, res) =>{
        const review = reviewCollection.find({});
        const result = await review.toArray();
        res.send(result);
    });
      // manage all product
      app.get('/manageallproducts', async (req, res) =>{
          const product = productsCollection.find({});
          const result = await product.toArray();
          res.send(result);
      });

      // placorder
      app.post('/placeorder', async (req, res)=>{
          const order = req.body;
          const result = await orderCollection.insertOne(order);
          res.json(result)
      });
      // Orderplace api
      app.get('/allorder/:id', async (req, res)=>{
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const allorders = await productsCollection.findOne(query);
          res.send(allorders);
      });
      //get my orders
      app.get("/myorders/:email", async (req, res)=>{
          const result = await orderCollection.find({
              email: req.params.email,
          }).toArray();
          res.send(result);
      });
      //get manage orders
      app.get("/manageorders", async (req, res)=>{
          const manageorder = orderCollection.find({});
          const getManageOrder = await manageorder.toArray();
          res.json(getManageOrder);
      });
      // delete all order 
      app.delete("/allorderdelete/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.json(result);
    });
      // delete product 
      app.delete("/deleteproduct/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await productsCollection.deleteOne(query);
        res.json(result);
    });
      // delete order 
      app.delete("/orderdelete/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await orderCollection.deleteOne(query);
        res.json(result);
    });
    // get all user
    app.get('/users', async (req, res) => {
        const cursor = usersCollection.find({});
        const allUser = await cursor.toArray();
        res.json(allUser);
    });
    //make admin role
    app.put('/users/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const roleUpdate = {
            $set: {
                role: 'admin'
            }
        };
        const result = await usersCollection.updateOne(filter, roleUpdate, options);
        res.json(result)
    });
    // //make admin role api
    app.get("/users/:email", async (req, res) => {
        const userEmail = req.params.email;
        const userQuery = { email: userEmail };
        const userRole = await usersCollection.findOne(userQuery);
        let isAdmin = false;
        if (userRole?.role === "admin") {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    });
    // upsert api 
    app.put('/users', async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const update = { $set: user };
        const result = await usersCollection.updateOne(filter, update, options);
        res.json(result)
    })
    // update order 
    app.put('/placeorder/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const statusUpdate = {
            $set: {
                status: 'approved'
            }
        };
        const result = await orderCollection.updateOne(filter, statusUpdate, options);
        res.json(result)
    })
      
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('Running kikoo server');
})

app.listen(port, () => {
    console.log('Running kikoo server on port', port);
})
//username: kikoo
//pass: YAnX3W9wGh7bmIvF