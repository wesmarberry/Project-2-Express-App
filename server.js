const express        = require('express');
const app            = express();
const bodyParser     = require('body-parser');
const methodOverride = require('method-override');
const session        = require('express-session');
require('./db/db')






app.listen(3000, () => {
  console.log('listening... on port: ', 3000);
});
