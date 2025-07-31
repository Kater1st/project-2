const express = require('express');
const { ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const { getCollection } = require('../database');

const router = express.Router();

/**
 * GET all authors
 */
router.get('/', async (req, res) => {
  // #swagger.tags = ['Authors']
  // #swagger.description = 'Retrieve all authors'
  try {
    const authors = await getCollection('authors').find().toArray();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET an author by ID
 */
router.get('/:id', async (req, res) => {
  // #swagger.tags = ['Authors']
  // #swagger.description = 'Retrieve a single author by ID'
  // #swagger.parameters['id'] = { description: 'Author ID' }
  try {
    const author = await getCollection('authors').findOne({ _id: new ObjectId(req.params.id) });
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST create a new author
 */
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('nationality').notEmpty().withMessage('Nationality is required'),
    body('birthYear').isInt({ min: 0 }).withMessage('Birth year must be valid')
  ],
  async (req, res) => {
    // #swagger.tags = ['Authors']
    // #swagger.description = 'Create a new author'
    /* #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            name: 'Paulo Coelho',
            nationality: 'Brazilian',
            birthYear: 1947
          }
    } */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await getCollection('authors').insertOne(req.body);
      res.status(201).json({ insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create author' });
    }
  }
);

/**
 * PUT update an author by ID
 */
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name must not be empty'),
    body('nationality').optional().notEmpty().withMessage('Nationality must not be empty'),
    body('birthYear').optional().isInt({ min: 0 }).withMessage('Birth year must be valid')
  ],
  async (req, res) => {
    // #swagger.tags = ['Authors']
    // #swagger.description = 'Update an existing author'
    /* #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            name: 'Paulo Coelho',
            nationality: 'Brazilian',
            birthYear: 1947
          }
    } */
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const result = await getCollection('authors').updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Author not found' });
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Failed to update author' });
    }
  }
);

/**
 * DELETE an author by ID
 */
router.delete('/:id', async (req, res) => {
  // #swagger.tags = ['Authors']
  // #swagger.description = 'Delete an author by ID'
  // #swagger.parameters['id'] = { description: 'Author ID' }
  try {
    const result = await getCollection('authors').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Author not found' });
    res.json({ message: 'Author deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete author' });
  }
});

module.exports = router;

/**
 * @typedef Author
 * @property {string} name.required
 * @property {string} nationality.required
 * @property {integer} birthYear.required
 */
