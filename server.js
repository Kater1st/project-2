const dotenv = require('dotenv');
dotenv.config(); 

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const { connectDB } = require('./database');

const booksRoute = require('./routes/books');
const authorsRoute = require('./routes/authors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/books', booksRoute);
app.use('/authors', authorsRoute);

app.get('/', (req, res) => {
  res.send('Welcome to Project 2 API');
});

// Start server after DB connects
const PORT = process.env.PORT || 8080;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });
