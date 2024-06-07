const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongodb = require('./config/dbconnect');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: 'Content-Type'
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

mongodb.initDb((err, mongodb) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
  } else {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port} and connected to the database`);
    });
  }
});