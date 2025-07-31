const express = require('express');
const { ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const { getCollection } = require('../database');

const router = express.Router();

/**
 * GET all books
 */
router.get('/', async (req, res) => {
  // #swagger.tags = ['Books']
  // #swagger.description = 'Retrieve all books from the database'
  try {
    const books = await getCollection('books').find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET book by ID
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
 * POST create book
 */
router.post(
  '/',
  [
    body('title').notEmpty(),
    body('author').notEmpty(),
    body('price').isNumeric(),
    body('genre').notEmpty(),
    body('publishDate').isISO8601(),
    body('ISBN').notEmpty(),
    body('pages').isInt({ min: 1 })
  ],
  async (req, res) => {
    // #swagger.tags = ['Books']
    // #swagger.description = 'Create a new book'
    /* #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            price: 19.99,
            genre: 'Fiction',
            publishDate: '1925-04-10',
            ISBN: '9780743273565',
            pages: 218
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
 * PUT update book
 */
router.put('/:id', async (req, res) => {
  // #swagger.tags = ['Books']
  // #swagger.description = 'Update an existing book by ID'
  // #swagger.parameters['id'] = { description: 'Book ID' }
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          title: 'Updated Title',
          author: 'Updated Author',
          price: 25.99,
          genre: 'Updated Genre',
          publishDate: '2020-01-01',
          ISBN: '1112223334445',
          pages: 300
        }
  } */
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

/**
 * DELETE book
 */
router.delete('/:id', async (req, res) => {
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
