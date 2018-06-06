const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 8000;

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || '27017';
const mongoDBName = process.env.MONGO_DATABASE;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;

const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;
let mongoDB = null;

app.use(bodyParser.json());

function getAllCats() {
  return mongoDB.collection('cats').find({}).toArray();
}

app.get('/cats', function (req, res) {
  getAllCats()
    .then((cats) => {
      res.status(200).json({ cats: cats });
    })
    .catch((err) => {
      res.status(500).json({ error: "Error fetching cats" });
    });
});

function insertNewCat(cat) {
  const catDocument = { url: cat.url };
  return mongoDB.collection('cats').insertOne(catDocument)
    .then((result) => {
      return Promise.resolve(result.insertedId);
    });
}

app.post('/cats', function (req, res) {
  if (req.body && req.body.url) {
    insertNewCat(req.body)
      .then((id) => {
        res.status(201).json({ _id: id });
      })
      .catch((err) => {
        res.status(500).json({ error: "Failed to insert new cat." });
      });
  } else {
    res.status(400).json({
      error: "Request doesn't contain a valid cat."
    });
  }
});

app.use('*', function (req, res, next) {
  res.status(404).json({
    err: "Path " + req.originalUrl + " does not exist"
  });
});

MongoClient.connect(mongoURL, function (err, client) {
  if (!err) {
    mongoDB = client.db(mongoDBName);
    app.listen(port, function() {
      console.log("== Server is running on port", port);
    });
  } else {
    throw err;
  }
});
