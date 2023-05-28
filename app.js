require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();

/*
const cors = require("cors");
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
        <li><code>/sprites/pokemon/versions/generation-v/black-white</code> - Get sprites from Pokemon Black and White</li>
        <li><code>/sprites/pokemon/versions/generation-viii/icons</code> - Get icons from Pokemon Sword and Shield</li>
        <!-- Continue with the rest of the generations and versions as needed -->
      </ul>
      
      <p>Note: Replace any spaces in the path with %20 to ensure the URL is encoded correctly.</p>
    `);
});

app.use("/sprites", express.static(path.join(__dirname, "/sprites")));

app.get("/sprites/*", (req, res) => {
  console.log(req.params);
  if (!req.query.page) {
    return res.status(400).json({
      error: "Missing required parameter: page"
    });
  }

  const page = Number(req.query.page);
  const count = req.query.count ? Number(req.query.count) : 10; // Default to 10 if no count is provided
  const folder = req.params[0];

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

    // Map files to an array of [name, original] pairs
    const mappedFiles = files.map((file) => [path.parse(file).name, file]);

    // Custom sort
    mappedFiles.sort((a, b) => {
      const numA = parseInt(a[0], 10);
      const numB = parseInt(b[0], 10);

      if (numA !== numB) {
        return numA - numB; // sort by number part if different
      } else {
        return a[0].localeCompare(b[0]); // else sort by whole name
      }
    });

    const startIndex = (page - 1) * count;
    const endIndex = startIndex + count;
    const pageFiles = mappedFiles
      .slice(startIndex, endIndex)
      .map(([name, original]) => ({
        ruta: path.join(spritesDir, original),
      }));

    if (pageFiles.length === 0) {
      return res
        .status(404)
        .json({ error: "No sprites found for this page number." });
    }

    res.json(pageFiles);
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

module.exports = app;
