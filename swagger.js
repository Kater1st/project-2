const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Project 2 Library API',
    description: 'API documentation for Library project',
  },
  host: process.env.HOST || 'project-2-du7r.onrender.com', // Render domain
  schemes: ['https'], // Render uses HTTPS
  securityDefinitions: {
    // This will add the Authorize button
    githubAuth: {
      type: 'oauth2',
      authorizationUrl: `${process.env.HOST || 'https://project-2-du7r.onrender.com'}/auth/github`,
      flow: 'implicit',
      scopes: {
        'read:books': 'Read books and authors data',
        'write:books': 'Add, edit, delete books and authors'
      }
    }
  },
  security: [
    {
      githubAuth: ['read:books', 'write:books']
    }
  ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./server'); // start server after generating docs
});
