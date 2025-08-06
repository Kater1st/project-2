const express = require('express');
const { ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const { getCollection } = require('../database');
const { isAuthenticated } = require('../middleware/auth'); // NEW

const router = express.Router();

/**
 * GET all books
 */
router.get('/', async (req, res) => {
  // #swagger.tags = ['Books']
  // #swagger.description = 'Retrieve all books'
  try {
    const books = await getCollection('books').find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET a book by ID
 */
router.get('/:id', async (req, res) => {
  // #swagger.tags = ['Books']
  // #swagger.description = 'Retrieve a single book by ID'
  // #swagger.parameters['id'] = { description: 'Book ID' }
  try {
    const book = await getCollection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST create a new book
 */
router.post(
  '/',
  isAuthenticated, // PROTECT
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('publishedYear').isInt({ min: 0 }).withMessage('Published year must be a valid year'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('pages').isInt({ min: 1 }).withMessage('Pages must be a positive integer'),
    body('publisher').notEmpty().withMessage('Publisher is required'),
    body('isbn').notEmpty().withMessage('ISBN is required')
  ],
  async (req, res) => {
    // #swagger.tags = ['Books']
    // #swagger.description = 'Create a new book'
    /* #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            title: 'Atomic Habits',
            author: 'James Clear',
            publishedYear: 2018,
            genre: 'Self-help',
            pages: 320,
            publisher: 'Penguin Random House',
            isbn: '9780735211292'
          }
    } */
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

/**
 * PUT update a book by ID
 */
router.put(
  '/:id',
  isAuthenticated, // PROTECT
  [
    body('title').optional().notEmpty().withMessage('Title must not be empty'),
    body('author').optional().notEmpty().withMessage('Author must not be empty'),
    body('publishedYear').optional().isInt({ min: 0 }).withMessage('Published year must be valid'),
    body('genre').optional().notEmpty().withMessage('Genre must not be empty'),
    body('pages').optional().isInt({ min: 1 }).withMessage('Pages must be positive'),
    body('publisher').optional().notEmpty().withMessage('Publisher must not be empty'),
    body('isbn').optional().notEmpty().withMessage('ISBN must not be empty')
  ],
  async (req, res) => {
    // #swagger.tags = ['Books']
    // #swagger.description = 'Update an existing book'
    /* #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            title: 'Atomic Habits',
            author: 'James Clear',
            publishedYear: 2018,
            genre: 'Self-help',
            pages: 320,
            publisher: 'Penguin Random House',
            isbn: '9780735211292'
          }
    } */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

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
  }
);

/**
 * DELETE a book by ID
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  // #swagger.tags = ['Books']
  // #swagger.description = 'Delete a book by ID'
  // #swagger.parameters['id'] = { description: 'Book ID' }
  try {
    const result = await getCollection('books').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

module.exports = router;
