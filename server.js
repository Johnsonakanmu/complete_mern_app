const express = require('express');
const cors = require("cors");
const morgan = require("morgan");
const router = require('./server/router/routes')
const mongoose = require('mongoose')
require("dotenv").config();

const app = express();

/** Middleware */
app.use(express.json());
app.use(cors());
app.use(morgan('tiny'));
app.disable('x-power-by'); // less hackers know about our stack

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.status(201).json("Home GET Request");
});


app.use('/api', router);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to Database!'));


  app.listen(port, () => {
    console.log(`Server connected to http://localhost:${port}`);
  });
