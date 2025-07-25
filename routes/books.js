const express = require('express');
const { ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const { getCollection } = require('../database');

const router = express.Router();

// GET all books
router.get('/', async (req, res) => {
  try {
    const books = await getCollection('books').find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await getCollection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST new book
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('publishDate').isISO8601().withMessage('Publish date must be valid'),
    body('ISBN').notEmpty().withMessage('ISBN is required'),
    body('pages').isInt({ min: 1 }).withMessage('Pages must be a positive number'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await getCollection('books').insertOne(req.body);
      res.status(201).json({ insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create book' });
    }
  }
);

// PUT update book
router.put('/:id', async (req, res) => {
  try {
    const result = await getCollection('books').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: 'Book not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to update book' });
  }
});

// DELETE book
router.delete('/:id', async (req, res) => {
  try {
    const result = await getCollection('books').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
