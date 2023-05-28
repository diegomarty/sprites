require("dotenv").config();

const PORT = process.env.PORT || 5000;

const fs = require("fs");
const path = require("path");
const express = require("express");
const favicon = require('serve-favicon');
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

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));

// Function to check authentication
const checkAuth = (req, res, next) => {
  const authToken = req.headers["x-auth-token"];

  if (!authToken || authToken !== process.env.AUTH_TOKEN) {
    return res
      .status(403)
      .json({ error: "Forbidden. Invalid or missing headers." });
  }

  next();
};

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

app.use("/sprite-image", express.static(path.join(__dirname, "/sprites")));

app.get("/sprites/*", checkAuth, (req, res) => {
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

  const spritesDir = path.join("sprites", folder); // path to your sprites directory
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

app.get("/sprites-image/*", checkAuth, (req, res) => {
  const folderPath = req.params[0];
  const { id, getpath } = req.query;

  // Definir las posibles rutas de los archivos
  const pngFilePath = path.join("/sprites", folderPath, `${id}.png`);
  const gifFilePath = path.join("/sprites", folderPath, `${id}.gif`);

  fs.access(pngFilePath, fs.constants.F_OK, (err) => {
    if (err) { // si el .png no existe, buscamos el .gif
      fs.access(gifFilePath, fs.constants.F_OK, (err) => {
        if (err) { // si el .gif no existe, enviamos un error
          console.error(`File does not exist`);
          return res.status(404).send('File does not exist');
        } else { // si el .gif existe, procedemos a verificar el parámetro getpath
          if (getpath === 'true') {
            return res.json({ path: gifFilePath });
          } else {
            res.sendFile(gifFilePath);
          }
        }
      });
    } else { // si el .png existe, procedemos a verificar el parámetro getpath
      if (getpath === 'true') {
        return res.json({ path: pngFilePath });
      } else {
        res.sendFile(pngFilePath);
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PokeSprites - API</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css">
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"></script>
    </head>
    <body>

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
                  <div class="col-12 col-md-8">
                    <pre class="bg-light p-3 rounded">
                      <code>/sprite-image/pokemon/versions/generation-v/black-white</code>
                    </pre>
                    <p>This gets one sprite from Pokemon Black and White.</p>
                    <a href="${process.env.HOST}/sprite-image/pokemon/versions/generation-v/black-white/6.png">Click here</a> to try it.
                  </div>
                  <div class="col-12 col-md-4 text-center">
                    <img src="/6.png" class="img-thumbnail" alt="Example image">
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

          <div class="card">
            <div class="card-header" id="headingFour">
              <h5 class="mb-0">
                <button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                  Obtención de Sprite de Pokémon por ID y Opción de Ruta - <code>/sprites/*/?id=pokemon_id&getpath=true</code>
                </button>
              </h5>
            </div>

            <div id="collapseFour" class="collapse" aria-labelledby="headingFour" data-parent="#accordion">
              <div class="card-body">
                <pre class="bg-light p-3 rounded">
                  <code>/sprites/pokemon/?id=25&getpath=true</code>
                </pre>
                <p>This gets the path to the sprite of the Pokemon with the specified ID (if it exists).</p>
                <a href="${process.env.HOST}/sprites-image/pokemon/?id=25&getpath=true">Click here</a> to try it.
                <p>On successful request, it would return something like:</p>
                <pre class="bg-light p-3 rounded">
                  <code>
                  {
                    "path": "${process.env.HOST}/sprites/pokemon/25.png"
                  }
                  </code>
                </pre>
              </div>
            </div>
          </div>

        </div>

        <p class="mb-4">Note: Replace any spaces in the path with %20 to ensure the URL is encoded correctly.</p>
      </div>
    </body>
  </html>
  `);
});

module.exports = app;
