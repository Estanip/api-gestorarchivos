const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const mongoose = require("mongoose");

require("dotenv").config();

swaggerDocument = require('../swagger.json');

const app = express();
const port = process.env.PORT || 3000;

// Settings
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexion DB
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
  })
  .then((db) => console.log("Base de datos conectada"))
  .catch((error) => console.error(error));

// Public
fs.mkdir(path.join(__dirname, '/public/uploads'), { recursive: true }, (err) => {
    if (err) throw err;
});
fs.mkdir(path.join(__dirname, '/public/downloads'), { recursive: true }, (err) => {
    if (err) throw err;
});

// Swagger
app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
  );

// Routes
app.use('/auth', require(path.join(__dirname, '/routes/auth')));
app.use('/files', require(path.join(__dirname, '/routes/files')));
app.use('/images', require(path.join(__dirname, '/routes/images')));

// Server
app.listen(port, () => {
    console.log(`Server running in port ${port}`)
});