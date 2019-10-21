module.exports = {
  secret: {
    key: 'please enter your key',
  },
  mongodb: {
    url: 'please enter your mongo url',

    // add custom mongodb options
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 5000,
      keepAlive: true,
      autoReconnect: true,
      reconnectTries: 10,
    },
  },
};
