// Load environment variables
require("dotenv").config();

// Core dependencies
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

/**
 * --------------------
 * App Configuration
 * --------------------
 */

// View engine
app.set("view engine", "pug");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

console.log("index.js loaded");

/**
 * --------------------
 * GET /
 * Homepage – fetch and display Cricket Players
 * --------------------
 */
app.get("/", async (req, res) => {
  console.log("GET / route hit");

  try {
    const response = await axios.get(
      `https://api.hubapi.com/crm/v3/objects/${process.env.CUSTOM_OBJECT_TYPE}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`
        },
        // IMPORTANT: explicitly request custom properties
        params: {
          properties: "name,role,country"
        }
      }
    );

    console.log("Returned properties:");
    console.dir(
      response.data.results.map(record => record.properties),
      { depth: null }
    );

    res.render("homepage", {
      title: "Cricket Players",
      players: response.data.results
    });
  } catch (error) {
    console.error(
      "Error fetching Cricket Players:",
      error.response?.data || error.message
    );
    res.status(500).send("Error retrieving Cricket Players");
  }
});

/**
 * --------------------
 * GET /update-cobj
 * Render form
 * --------------------
 */
app.get("/update-cobj", (req, res) => {
  console.log("GET /update-cobj route hit");

  res.render("updates", {
    title: "Update Custom Object Form | Integrating With HubSpot I Practicum"
  });
});

/**
 * --------------------
 * POST /update-cobj
 * Create Cricket Player and redirect home
 * --------------------
 */
app.post("/update-cobj", async (req, res) => {
  console.log("POST /update-cobj route hit");

  const { name, role, country } = req.body;

  console.log("Form data received:", { name, role, country });

  try {
    await axios.post(
      `https://api.hubapi.com/crm/v3/objects/${process.env.CUSTOM_OBJECT_TYPE}`,
      {
        properties: {
          name,
          role,
          country
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Cricket Player created successfully");
    res.redirect("/");
  } catch (error) {
    console.error(
      "Error creating Cricket Player:",
      error.response?.data || error.message
    );
    res.status(500).send("Error creating Cricket Player");
  }
});

/**
 * --------------------
 * Start server
 * --------------------
 */
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

