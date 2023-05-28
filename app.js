require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const fs = require("fs");
const path = require("path");

/*
const corsOptions = {
  origin: [
    "http://www.diegomarty.com",
    "https://www.diegomarty.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  optionsSuccessStatus: 200,
};

app.use((req, res, next) => {
  const authToken = req.headers["x-auth-token"];

  if (!authToken || authToken !== process.env.AUTH_TOKEN) {
    return res
      .status(403)
      .json({ error: "Forbidden. Invalid or missing x-auth-token header." });
  }

  next();
});
app.use(cors(corsOptions));
*/


app.get("/", (req, res) => {
  res.send(`
      <h1>Welcome to our Sprites API</h1>
      You can make requests to the following routes:
      <ul>
        <li><code>/sprites/:folder*/:page/:count?</code> - Get the paths to a certain number of images (default 10) on a certain page in a specified folder. For example, /sprites/pokemon/versions/generation-v/black-white/animated/1/30 will return the paths to the first 30 images on page 1 in the folder sprites/pokemon/versions/generation-v/black-white/animated.
      </ul>

      <p>For all routes, :folder* represents the path to the folder containing the images, :page represents the page number (starting from 1), and :count represents the number of images to return (default 10 if not provided).</p>
      <p>You can make requests to get various Pokemon sprites.</p>
      <p>Here are some example endpoints you can use:</p>

      <ul>
        <li><code>/sprites/pokemon/other/dream%20world</code> - Get Dream World sprites</li>
        <li><code>/sprites/pokemon/other/official-artwork</code> - Get Official Artwork sprites</li>
        <li><code>/sprites/pokemon/other/home</code> - Get Pokemon Home sprites</li>
        <li><code>/sprites/pokemon/versions/generation-i/red-blue</code> - Get sprites from Pokemon Red and Blue</li>
        <li><code>/sprites/pokemon/versions/generation-i/yellow</code> - Get sprites from Pokemon Yellow</li>
        <li><code>/sprites/pokemon/versions/generation-ii/crystal</code> - Get sprites from Pokemon Crystal</li>
        <li><code>/sprites/pokemon/versions/generation-ii/gold</code> - Get sprites from Pokemon Gold</li>
        <li><code>/sprites/pokemon/versions/generation-ii/silver</code> - Get sprites from Pokemon Silver</li>
        <li><code>/sprites/pokemon/versions/generation-iii/emerald</code> - Get sprites from Pokemon Emerald</li>
        <li><code>/sprites/pokemon/versions/generation-iii/fire-red-leaf-green</code> - Get sprites from Pokemon Fire Red and Leaf Green</li>
        <li><code>/sprites/pokemon/versions/generation-iii/ruby-sapphire</code> - Get sprites from Pokemon Ruby and Sapphire</li>
        <li><code>/sprites/pokemon/versions/generation-iv/diamond-pearl</code> - Get sprites from Pokemon Diamond and Pearl</li>
        <li><code>/sprites/pokemon/versions/generation-iv/heart-gold-soul-silver</code> - Get sprites from Pokemon Heart Gold and Soul Silver</li>
        <li><code>/sprites/pokemon/versions/generation-iv/platinum</code> - Get sprites from Pokemon Platinum</li>
        <li><code>/sprites/pokemon/versions/generation-v/black-white</code> - Get sprites from Pokemon Black and White</li>
        <!-- Continue with the rest of the generations and versions as needed -->
      </ul>
      
      <p>Note: Replace any spaces in the path with %20 to ensure the URL is encoded correctly.</p>
    `);
});

app.use("/sprites", express.static(path.join(__dirname, "/sprites")));

app.get("/sprites/:folder*/:page/:count?", (req, res) => {
  const page = Number(req.params.page);
  const count = req.params.count ? Number(req.params.count) : 10; // Default to 10 if no count is provided
  const folder = req.params.folder.join("/"); // Join the segments of the folder path

  if (!Number.isInteger(page) || page < 1) {
    return res.status(400).json({
      error:
        "Invalid page number. Page number should be an integer greater than 0.",
    });
  }

  if (!Number.isInteger(count) || count < 1) {
    return res.status(400).json({
      error:
        "Invalid count number. Count number should be an integer greater than 0.",
    });
  }

  const spritesDir = path.join(__dirname, "sprites", folder); // path to your sprites directory
  fs.readdir(spritesDir, (err, files) => {
    if (err) {
      return res.status(500).json({
        error: "An error occurred while trying to read the sprites directory.",
      });
    }

    const startIndex = (page - 1) * count;
    const endIndex = startIndex + count;
    const pageFiles = files
      .slice(startIndex, endIndex)
      .map((file) => path.join(spritesDir, file));

    if (pageFiles.length === 0) {
      return res
        .status(404)
        .json({ error: "No sprites found for this page number." });
    }

    res.json(pageFiles);
  });
});

module.exports = app;
