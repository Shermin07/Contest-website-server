const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config() ;
const app = express();
const admin = require('firebase-admin');
const port = process.env.PORT || 5000 ;

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

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

    const submissionCollections = client.db('a12-contest').collection('submissionCollection');

    const userCollection = client.db('a12-contest').collection('users');

    const registrationCollection = client.db('a12-contest').collection('contestRegistrations');




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

  

// contest details
app.get("/home/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };

    const result = await homeCollections.findOne(query);
    res.send(result)

  } catch (error) {
    console.log(error.message);
  }
})



// Endpoint to get all contests
app.get('/dashboard/allContests', async (req, res) => {
  try {
    const cursor = addContestCollections.find();
    const result = await cursor.toArray();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to get contest details
app.get('/dashboard/contestDetails/:contestId', async (req, res) => {
  const contestId = req.params.contestId;
  try {
    const contestDetails = await addContestCollections.findOne({ _id: new ObjectId(contestId) });
    res.json(contestDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});






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

   

// submission post
app.post('/dashboard/createdContest/:contestId', async (req, res) => {
    const contestId = req.params.contestId;
    const submissionData = req.body;
  
    try {
      // Assuming 'submissionCollections' is the collection where you want to store submissions
      const result = await submissionCollections.insertOne({
        contestId: contestId,
        submissionData: submissionData,
      });
  
      res.json({ success: true, message: 'Submission successful', data: result.ops[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  
  
  // submission get
  app.get('/dashboard/contestSubmittedPage/:contestId', async (req,res) =>{
    const contestId = req.params.contestId  ;
    const query = { _id: new ObjectId(contestId )};
    const result = await submissionCollections.findOne(query) ;
    res.send(result)
   })
  

  // admin
 
app.get('/manageUsers', async (req, res) => {
  try {
   
    const userRecords = await admin.auth().listUsers();
    const users = userRecords.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '', 
    }));

    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





// Admin user role
app.post('/manageUsers/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Assuming 'userCollection' is the MongoDB collection for users
    const user = await userCollection.findOne({ uid: userId });

    if (user) {
      const newRole = user.role === 'admin' ? 'normal' : 'admin'; // Toggle the role

      const result = await userCollection.updateOne(
        { uid: userId },
        { $set: { role: newRole } }
      );

      res.json({ success: true, message: 'User role toggled successfully', data: result });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




// manageContest


app.get('/dashboard/manageContests', async (req, res) => {
  try {
    const cursor = addContestCollections.find();
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ManageContest  delete 
app.delete('/dashboard/manageContests/:contestId', async (req, res) => {
  const contestId = req.params.contestId;

  try {
    const result = await addContestCollections.deleteOne({ _id: new ObjectId(contestId) });

    if (result.deletedCount === 1) {
      res.json({ success: true, message: 'Contest deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Contest not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ManageContest confirm 
app.post('/dashboard/manageContests/confirm/:contestId', async (req, res) => {
  const contestId = req.params.contestId;

 
  try {
   
    const result = await addContestCollections.updateOne(
      { _id: new ObjectId(contestId) },
      { $set: { status: 'confirmed' } }
    );

    res.json({ success: true, message: 'Contest confirmed successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});





//  registration
app.post('/dashboard/contestDetails/:contestId/register', async (req, res) => {
  const contestId = req.params.contestId;
  const { userId } = req.body;

  try {
   
    const existingRegistration = await registrationCollection.findOne({
      contestId: new ObjectId(contestId),
      userId,
    });

    if (existingRegistration) {
      res.status(400).json({ success: false, message: 'User already registered' });
      return;
    }

    //  'contestDetails' is the collection where you store contest details
    const contestDetails = await addContestCollections.findOne({
      _id: new ObjectId(contestId),
      status: 'confirmed',
    });

    if (!contestDetails) {
      res.status(404).json({ success: false, message: 'Contest not found or registration closed' });
      return;
    }

    // Add the user to the contest registration collection
    const registrationResult = await registrationCollection.insertOne({
      contestId: new ObjectId(contestId),
      userId,
    });

    res.json({
      success: true,
      message: 'User registered for the contest successfully',
      data: registrationResult.ops[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


 // Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
   // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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