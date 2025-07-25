const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

const booksRoute = require('./routes/books');
const authorsRoute = require('./routes/authors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/books', booksRoute);
app.use('/authors', authorsRoute);

app.get('/', (req, res) => {
  res.send('Welcome to Project 2 API');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
