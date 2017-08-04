'use strict';

let redisConfig;  
if (process.env.NODE_ENV === 'dev') {  
  redisConfig = {
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      auth: process.env.REDIS_PASS,
      options: {
        no_ready_check: false
      }
    }
  };
} else {
  redisConfig = {};
}

const kue = require('kue');  
const queue = kue.createQueue(redisConfig);  
queue.watchStuckJobs(1000 * 10);


module.exports = {  
  create: (data, done) => {
    createPayment(data, done);
  }
};