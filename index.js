const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config() ;
const app = express();
const port = process.env.PORT || 5000 ;

//middlewear
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttkt4y5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect()
    const homeCollections = client.db('a12-contest').collection('homeCollections');
    const participatedCollections = client.db('a12-contest').collection('participated');

    const addContestCollections = client.db('a12-contest').collection('addContestCollection');



// banner
app.get('/home', async(req,res) =>{
    const cursor = homeCollections.find();
    const result = await cursor.toArray();
    res.send(result);
   })


//participated:

app.get('/dashboard/participated', async(req,res) =>{
    const cursor = participatedCollections.find();
    const result = await cursor.toArray();
    res.send(result);
   })

// add contest post and get
app.post('/dashboard/addContest', async (req,res) =>{
    const addContest = req.body ;
    const result = await  addContestCollections.insertOne(addContest) ;
   
    res.send(result) ;

  })

  app.get('/dashboard/addContest', async(req,res) =>{
    const cursor = addContestCollections.find();
    const result = await cursor.toArray();
    res.send(result);
   })

   // My Created Contest get::
   app.get('/dashboard/createdContest', async(req,res) =>{
    const cursor = addContestCollections.find();
    const result = await cursor.toArray();
    res.send(result);
   })




    // Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);



//first setup
app.get('/', async (req,res) =>{
    res.send('server is running succesfully')
})

app.listen(port, () =>{
    console.log(`server is running on port ${port}`)
})