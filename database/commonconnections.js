'use strict';

const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');

const url = "mongodb://localhost:27017/monioo-beacon";

let dbo;

MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    dbo = db.db("monioo-beacon");
});