const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" })
const passport = require('passport');
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const morgan = require("morgan");
const { connectDB } = require("./config/db");
const exphbs = require("express-handlebars");
const { createPassportConfig } = require('./config/passport');


// passport config
// require('./config/passport')(passport);
createPassportConfig()

// db connection
connectDB();
const app = express();
// logging
if (process.env.NODE_ENV == 'developement') {
    app.use(morgan('combined'));
}

// body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

// method override
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method
      delete req.body._method
      return method
    }
  }))

// handlebars Helpers
const { formatDate, editIcon, select, stripTags, truncate } = require("./helpers/hbs")

// handleBars 
app.engine('.hbs', exphbs.engine({ helpers: { formatDate, editIcon, select, stripTags, truncate }, extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs')

// sessions
app.use(session({
    secret: "session-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}))

// passport middleware
app.use(passport.initialize())
app.use(passport.session())

// set global Var
app.use(function(req,res,next){
    res.locals.user = req.user || null
    next()
})

//static file folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3400;
app.listen(PORT, () => {
    console.log(`server is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

