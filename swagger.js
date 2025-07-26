const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Project 2 Library API',
    description: 'API documentation for Library project',
  },
  host: process.env.HOST || 'project-2-du7r.onrender.com', // use your Render domain
  schemes: ['https'], // use https since Render enforces HTTPS
};


const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js']; // main entry point

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require('./server'); // Start the server after swagger docs generation
});