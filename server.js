const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongodb = require('./config/dbconnect');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type'
  };

mongodb.initDb((err, mongodb) => {
    if (err) {
      console.log(err);
    } else {
      app.listen(port);
      console.log(`Listening on ${port} and connected to Database`);
    }
  });

app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);


