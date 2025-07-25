const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "library";
let authorsCollection;

async function connect() {
  if (!authorsCollection) {
    await client.connect();
    authorsCollection = client.db(dbName).collection('authors');
  }
  return authorsCollection;
}

// GET all authors
router.get('/', async (req, res) => {
  try {
    const collection = await connect();
    const authors = await collection.find().toArray();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET author by ID
router.get('/:id', async (req, res) => {
  try {
    const collection = await connect();
    const author = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new author
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email must be valid'),
    body('birthDate').isISO8601().withMessage('Birth date must be valid'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const collection = await connect();
      const result = await collection.insertOne(req.body);
      res.status(201).json({ insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create author' });
    }
  }
);

// PUT update author
router.put('/:id', async (req, res) => {
  try {
    const collection = await connect();
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Author not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update author' });
  }
});

// DELETE author
router.delete('/:id', async (req, res) => {
  try {
    const collection = await connect();
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Author not found' });
    res.json({ message: 'Author deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete author' });
  }
});

module.exports = router;
