const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const runPythonScript = require("./src/utils/scraper");
const researchRoutes = require("./src/routes/researchRoutes");

dotenv.config();
// const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use(cors());

const claimRoutes = require("./src/routes/researchRoutes");
const leaderboardRoutes = require("./src/routes/researchRoutes");
const influencerRoutes = require("./src/routes/influencerRoutes");

app.use("/api/influencerDetails", influencerRoutes);

app.use("/api/research", researchRoutes);

app.use("/api/leaderboard", leaderboardRoutes);

app.get("/api/scrape/:username", async (req, res) => {  
  try {  
      const username = req.params.username;  
      console.log(`Scraping Twitter for: ${username}`);
      
      const data = await runPythonScript(username, 5);  
      
      console.log("Python Response:", JSON.stringify(data, null, 2)); // Log response
      
      res.json(data);  
  } catch (error) {  
      console.error("Error during scraping:", error.message);  
      res.status(500).json({ error: "Failed to fetch data", details: error.message });  
  }  
});

app.get("/", (req, res) => {
  res.send("Health Claim Verifier API is running...");
});

const PORT = process.env.port ||5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
