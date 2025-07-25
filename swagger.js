const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Project 2 API',
    description: 'API for managing books and authors',
  },
  host: 'kater1st-cse341-node-swmg.onrender.com', 
  schemes: ['https'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js']; // main entry point

swaggerAutogen(outputFile, endpointsFiles, doc);
