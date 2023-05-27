const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

const corsOptions = {
  origin: [
    "http://www.diegomarty.com",
    "https://www.diegomarty.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use("/sprites", express.static(path.join(__dirname, "/sprites")));

app.get('/', (req, res) => {
    res.send(`
      <h1>Welcome to our Sprites API</h1>
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
  

module.exports = app;
