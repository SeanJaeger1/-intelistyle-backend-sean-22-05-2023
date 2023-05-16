require("dotenv").config()
const express = require("express")
const { MongoClient, ServerApiVersion } = require("mongodb")
const cors = require("cors")

const uri = process.env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

const app = express()
app.use(cors())

app.get("/", (req, res) => {
  res.send("Hello, World!")
})

async function run() {
  try {
    console.log("Attempting to connect to the database...")
    await client.connect()
    console.log("Successfully connected to the database.")
    const collection = client
      .db(process.env.DB_NAME)
      .collection(process.env.COLLECTION_NAME)

    app.get("/search", async (req, res) => {
      const query = req.query.q
      console.log(query)
      if (!query || typeof query !== "string") {
        return res.status(400).send("Invalid query string provided")
      }

      console.log("working")
      try {
        console.log("Attempting to fetch items from MongoDB...")
        const items = await collection
          .find({ product_title: { $regex: query, $options: "i" } })
          .toArray()
        console.log("Items fetched successfully")
        console.log(items)
        res.status(200).send(items)
      } catch (err) {
        console.error("Error while fetching items:", err)
        res.status(500).send("Error occurred while fetching items")
      }
    })

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server started on port ${process.env.PORT || 3000}`)
    })
  } catch (error) {
    console.error("Failed to connect to the database with error:", error)
  }
}

run().catch(console.dir)
