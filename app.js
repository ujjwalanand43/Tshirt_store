const express = require('express');
require('dotenv').config();
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());

// for swagger documentation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// regular middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  cookies and file middleware
app.use(cookieParser());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

// temp check
app.set("view engine", "ejs");

// Morgan Middleware
app.use(morgan("tiny"));

// Import All route here
const home = require('./routes/home');
const user = require('./routes/user');
const post = require('./routes/post');
const media = require('./routes/postMedia');
// const blog = require('./routes/blog');

// router middleware
app.use('/api/v1', home);
app.use('/api/v1', user);
app.use('/api/v1', post);
app.use('/api/v1', media);
// app.use('/api/v1', blog);

app.get('/signup', (req, res) => {
    res.render('postform')
})

//  export app js

module.exports = app;