require("dotenv").config();

const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();


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

app.use("/sprites", express.static(path.join(__dirname, "/sprites")));

app.get("/sprites/*", (req, res) => {
  console.log(req.params);
  if (!req.query.page) {
    return res.status(400).json({
      error: "Missing required parameter: page",
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
  console.log("Server is running on port 5000");
});

app.get("/", (req, res) => {
  res.send(`
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>

    <div class="container mt-4">
      <div class="jumbotron text-center">
        <h1 class="display-4">Welcome to our Sprites API</h1>
        <p class="lead">You can make requests to the following routes:</p>
      </div>

      <div class="mb-4">
        <pre class="bg-light p-3 rounded">
          <code>/sprites/*/?page=1&count=10</code>
        </pre>
        <p>This gets the paths to a certain number of images (default 10) on a certain page in a specified folder.</p>
      </div>

      <div id="accordion">
        <div class="card">
          <div class="card-header" id="headingOne">
            <h5 class="mb-0">
              <button class="btn btn-link" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                Obtención de Imágenes por Página y Cantidad - <code>/sprites/*/?page=1&count=10</code>
              </button>
            </h5>
          </div>

          <div id="collapseOne" class="collapse show" aria-labelledby="headingOne" data-parent="#accordion">
            <div class="card-body">
              <div class="row">
                <div class="col-8">
                  <pre class="bg-light p-3 rounded">
                    <code>/sprites/pokemon/versions/generation-v/black-white</code>
                  </pre>
                  <p>This gets sprites from Pokemon Black and White.</p>
                  <a href="${process.env.HOST}/sprites/pokemon/versions/generation-v/black-white/1.png">Click here</a> to try it.
                </div>
                <div class="col-4">
                  <img src="${process.env.HOST}/sprites/pokemon/versions/generation-v/black-white/1.png" class="img-thumbnail" alt="Example image">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header" id="headingTwo">
            <h5 class="mb-0">
              <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
              Obtención de Sprites de Pokémon de la Generación V (Negro y Blanco) - Animated disponibles
              </button>
            </h5>
          </div>

          <div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordion">
            <div class="card-body">
              <pre class="bg-light p-3 rounded">
                <code>/sprites/pokemon/versions/generation-viii/icons</code>
              </pre>
              <p>This gets icons from Pokemon Sword and Shield.</p>
              <!-- Note: Add an example link and image if available -->
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header" id="headingThree">
            <h5 class="mb-0">
              <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                Obtención de Iconos de Pokémon de la Generación VIII (Espada y Escudo)
              </button>
            </h5>
          </div>

          <div id="collapseThree" class="collapse" aria-labelledby="headingThree" data-parent="#accordion">
            <div class="card-body">
            <p>This returns the paths to the first 10 images on page 1 in the specified folder. The paths are relative to "api-example".</p>
            <pre class="bg-light p-3 rounded">
                <code>
                [
                  {
                    "ruta": "${process.env.HOST}/sprites/pokemon/versions/generation-v/black-white/0.png"
                  },
                  {
                    "ruta": "${process.env.HOST}/sprites/pokemon/versions/generation-v/black-white/1.png"
                  }
                ]
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      <p class="mb-4">Note: Replace any spaces in the path with %20 to ensure the URL is encoded correctly.</p>
    </div>
  `);
});

module.exports = app;
