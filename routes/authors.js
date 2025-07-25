const express = require('express');
const { ObjectId } = require('mongodb');
const { body, validationResult } = require('express-validator');
const { getCollection } = require('../database');

const router = express.Router();

// GET all authors
router.get('/', async (req, res) => {
  try {
    const authors = await getCollection('authors').find().toArray();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET author by ID
router.get('/:id', async (req, res) => {
  try {
    const author = await getCollection('authors').findOne({ _id: new ObjectId(req.params.id) });
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
      const result = await getCollection('authors').insertOne(req.body);
      res.status(201).json({ insertedId: result.insertedId });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create author' });
    }
  }
);

// PUT update author
router.put('/:id', async (req, res) => {
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
});

// DELETE author
router.delete('/:id', async (req, res) => {
  try {
    const result = await getCollection('authors').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Author not found' });
    res.json({ message: 'Author deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete author' });
  }
});

module.exports = router;
