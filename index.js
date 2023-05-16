const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 1010;

app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});
app.get("/ki", async (req, res) => {
  // const result = await collection.find().toArray();
  res.send("hello");
});
// const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@learntng.g96agpr.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb://car-doctor:IqBiDl1k3tH6CIC1@ac-jsn4phu-shard-00-00.g96agpr.mongodb.net:27017,ac-jsn4phu-shard-00-01.g96agpr.mongodb.net:27017,ac-jsn4phu-shard-00-02.g96agpr.mongodb.net:27017/?ssl=true&replicaSet=atlas-85j63k-shard-0&authSource=admin&retryWrites=true&w=majority`;

// const uri =
//   "mongodb+srv://car-doctor:IqBiDl1k3tH6CIC1@learntng.g96agpr.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const collection = client.db("CAR_DOCTOR").collection("services");
    const bookings = client.db("CAR_DOCTOR").collection("bookings");

    app.get("/services", async (req, res) => {
      const result = await collection.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { title: 1, price: 1, description: 1, img: 1 },
      };
      const result = await collection.findOne(query, options);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookings.find(query).toArray();
      res.send(result);
    });
    app.post("/bookings", async (req, res) => {
      const booking = req.body;

      const result = await bookings.insertOne(booking);
      res.send(result);
    });
    // update booking
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const updateBooking = req.body;
      const filter = { _id: new ObjectId(id) };

      const updateDoc = {
        $set: {
          status: updateBooking.status,
        },
      };

      const result = await bookings.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete booking
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookings.deleteOne(query);
      res.send(result);
    });

    await client.db("CAR_DOCTOR").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
