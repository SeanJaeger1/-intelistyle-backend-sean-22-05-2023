require("dotenv").config()
const express = require("express")
const { MongoClient, ServerApiVersion } = require("mongodb")
const cors = require("cors")
const sanitize = require("mongo-sanitize")

// Throw error if envs aren't set
if (
  !process.env.MONGODB_URI ||
  !process.env.DB_NAME ||
  !process.env.COLLECTION_NAME
) {
  throw new Error("Required environment variables not found.")
}

// Initialise client
const client = new MongoClient(process.env.MONGODB_URI, {
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

    // Fetch the specified collection from the specified database
    const collection = client
      .db(process.env.DB_NAME)
      .collection(process.env.COLLECTION_NAME)

    app.get("/search", async (req, res) => {
      // Sanitize the user's search query
      const query = sanitize(req.query.q)

      // If the query is empty or not a string, return an error
      if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Invalid query string provided." })
      }

      try {
        // Fetch items from MongoDB that match the query
        const items = await collection
          .find({ product_title: { $regex: query, $options: "i" } })
          .toArray()

        res.status(200).json(items)
      } catch (err) {
        console.error("Error while fetching items:", err)
        res.status(500).json({ error: "Error occurred while fetching items." })
      }
    })

    const PORT = process.env.PORT || 3000

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to connect to the database with error:", error)
    process.exit(1)
  }
}

// Run the run function and handle any uncaught errors
run().catch((error) => {
  console.error("Uncaught error:", error)
  process.exit(1)
})
