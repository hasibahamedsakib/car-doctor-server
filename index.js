const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 1010;

app.get("/", (req, res) => {
  res.send("<h1>Server is running</h1>");
});

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyJWT = (req, res, next) => {
  const authorize = req.headers.authorization;
  if (!authorize) {
    return res.status(401).send({ error: true, message: "Unauthorize User" });
  }
  const token = authorize.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      res.status(403).send({ error: true, message: "Unauthorize user..." });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    // await client.connect();
    const collection = client.db("CAR_DOCTOR").collection("services");
    const bookings = client.db("CAR_DOCTOR").collection("bookings");

    // jwt Route
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
        expiresIn: "1h",
      });
      res.status(201).send({ token });
      // console.log({ token });
    });

    // services route
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

    // booking route
    app.get("/bookings", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (!decoded) {
        return res
          .status(403)
          .send({ error: true, message: "do not access others information" });
      }
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

    // await client.db("CAR_DOCTOR").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
  }
}
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
