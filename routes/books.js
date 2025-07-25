const express = require('express');
const { ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const { getCollection } = require('../database');

const router = express.Router();

/**
 * @route GET /books
 * @group Books - Operations about books
 * @returns {Array.<Book>} 200 - An array of books
 */
router.get('/', async (req, res) => {
  try {
    const books = await getCollection('books').find().toArray();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route GET /books/{id}
 * @group Books
 * @param {string} id.path.required - Book ID
 * @returns {Book.model} 200 - Book details
 * @returns {Error} 404 - Book not found
 */
router.get('/:id', async (req, res) => {
  try {
    const book = await getCollection('books').findOne({ _id: new ObjectId(req.params.id) });
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @route POST /books
 * @group Books
 * @param {Book.model} book.body.required - New book data
 * @returns {string} 201 - Inserted ID
 * @returns {Error} 400 - Validation error
 */
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

/**
 * @route PUT /books/{id}
 * @group Books
 * @param {string} id.path.required - Book ID
 * @param {Book.model} book.body.required - Updated book data
 * @returns 204 - Updated successfully
 * @returns {Error} 404 - Book not found
 */
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

/**
 * @route DELETE /books/{id}
 * @group Books
 * @param {string} id.path.required - Book ID
 * @returns {string} 200 - Book deleted successfully
 * @returns {Error} 404 - Book not found
 */
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

/**
 * @typedef Book
 * @property {string} title.required
 * @property {string} author.required
 * @property {number} price.required
 * @property {string} genre.required
 * @property {string} publishDate.required - ISO8601 date string
 * @property {string} ISBN.required
 * @property {integer} pages.required
 */
