


const express = require("express");
const app = express();
const cors = require("cors");
// const jwt = require('jsonwebtoken');
require("dotenv").config();
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PORT || 5001;

// middleware
app.use(cors(
    {
      origin: [
        // 'http://localhost:5173',
        'https://task-management-1b5d2.web.app/',
        'https://task-management-1b5d2.firebaseapp.com/'
      ],
      credentials: true,
    }
  ));
// app.use(cors());
app.use(express.json());

// console.log(`process.env.DB_USER: ${process.env.DB_USER}`);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kysojnx.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const TaskCollection = client
      .db("SCC")
      .collection("SCCTasks");



    //   Employee related API

    app.get("/getTasks", async (req, res) => {

        const tasks = await TaskCollection.find().toArray();
        res.send(tasks);
    });

    app.get('/tasks/:id', async (req, res) => {
        const taskId = req.params.id
        const result = await TaskCollection.findOne({ _id: new ObjectId(taskId) },);
        res.send(result);
    });

    app.post("/addTask", async (req, res) => {
        const task = req.body;
        await TaskCollection.insertOne(task);
        res.send("Task added successfully");
    });

    // update tasks 
    app.put('/tasks/:id', async (req, res) => {

        const taskId = req.params.id;
        const newTaskStatus = req.body.newStatus;
        console.log(taskId, newTaskStatus);

        const result = await TaskCollection.updateOne(
            { _id: new ObjectId(taskId) },
            { $set: { taskStatus: newTaskStatus } }
        );
        if (result.matchedCount > 0) {
            res.status(200).json({ message: 'TaskStatus updated successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    });
    // update 
    app.put('/user/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateTask = req.body;
        console.log(updateTask);
        const Task = {
            $set: {
                userName: updateTask.userName,
                userEmail: updateTask.userEmail,
                task: updateTask.task,
                taskStatus: updateTask.taskStatus,
                deadline: updateTask.deadline,

            }
        }
        const result = await TaskCollection.updateOne(filter, Task, options);
        res.send(result);
    })
    // delete 
    app.delete('/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await TaskCollection.deleteOne(query);
        res.send(result);
    })


        

    // Send a ping to confirm a successful connection
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
  res.send("Tsk Management System is running");
});

app.listen(port, () => {
  console.log(`Task Management System is running ${port}`);
});