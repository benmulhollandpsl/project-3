const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const validator = require("email-validator");
const app = express();
const PORT = process.env.PORT || 3001;
const logger = require("morgan");
let sess;
const db = require("./models");
//dbString
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/todo_db";
mongoose.connect(MONGODB_URI);
mongoose.Promise = Promise;

const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
const connection = mongoose.createConnection(MONGODB_URI, dbOptions);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger("dev"));

const sessionStore = new MongoStore({
  mongooseConnection: connection,
  collection: "sessions"
});

app.use(session({
  secret: "some secret",
  resave: false, // false making it so the session is saved to MongoStore whenever the req.session is modified
  saveUninitialized: false, // false making it so the session is saved to db whenever the req.session is modified
  store: sessionStore,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // Equals 1 day in milliseconds
  }
}));

app.get("/", (req, res) => {
  // Start session here
  sess = req.session;

  if(sess.email){
    res.send(true); // tells the react router to route to /home route
  } else {
    res.send(false); // tells the react router to route to / route with err message
  }
});

app.post("/create/:email/:password", (req, res) => {
  sess = req.session;

  // \/  Do a db search for req.params.email and req.params.password if its created yet; if email is in db res.send(false) else create account
  sess.email = req.params.email;
  sess.password = req.params.password;

  // \/ this validates email (returns true if its an email else returns false if not valid email)
  // if(validator.validate(req.params.email)) {

  // } else {}

  res.end();
});

app.post("/login/:email/:password", (req, res) => {
  // We can setup this route to make a call to the database to see if the username and password exists, then if it exists login and start the session;
  sess = req.session;

  // db.User.find({ email: req.params.email }, { password: req.params.password })
  //   .then(response => {
  //     // Idk what response is going to be. we can figure this out whenever we setup the database
  //     console.log(response);
  //     // We need to make a Conditional if account found set email & password to sess Object then res.send(true); else account not found res.send(false); \/ this does nothing yet
  //     // if(sess.email && sess.password) {
  //     //   res.send(true);
  //     // } else {
  //     //   res.send(false);
  //     // }
  //   })
  //   .catch(err => console.log(err));
  res.end();
});

app.post("/logout", (req, res) => {
  // Post route destroys the session connection
  sess = req.session;
  sess.destroy((err) => {
    if (err) {
      return res.send(false);
    }
    res.clearCookie();
    return res.send(true);
  });
});

app.listen(PORT, () => {
  console.log("Listening at:  localhost:" + PORT);
});

// //this should be where we set a timer to refresh the database 
// router.post('/updateData', (req, res) => {
//   const { id, update } = req.body;
//   Data.findByIdAndUpdate(id, update, (err) => {
//     if (err) return res.json({ success: false, error: err });
//     return res.json({ success: true });
//   });
// });

// // this is our create methid
// // this method adds new data in our database
// router.post('/putData', (req, res) => {
//   let data = new Data();

//   const { id, message } = req.body;

//   if ((!id && id !== 0) || !message) {
//     return res.json({
//       success: false,
//       error: 'INVALID INPUTS',
//     });
//   }
// })