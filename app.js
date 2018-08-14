'use strict';

const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const logger 	   = require('morgan');
const router 	   = express.Router();
const router2 = express.Router();
const port 	   = process.env.PORT || 8000;
const cors = require('cors');

app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors());

require('./angular_routes')(router);
app.use('/api/angular', router);

require('./android_routes')(router);
app.use('/api/android', router);

app.listen(port);



console.log(`App Runs on ${port}`);