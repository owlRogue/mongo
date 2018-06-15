var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/eligend");

// GLOBAL VARIABLES
var heading = "h1.pageHeading"
var description = "h2.codeDescription" // var description = $(element).text();
var f64Sites = ["https://www.icd10data.com/ICD10CM/Codes/F01-F99/F60-F69/F64-/F64.0",
                "https://www.icd10data.com/ICD10CM/Codes/F01-F99/F60-F69/F64-/F64.1",
                "https://www.icd10data.com/ICD10CM/Codes/F01-F99/F60-F69/F64-/F64.2",
                "https://www.icd10data.com/ICD10CM/Codes/F01-F99/F60-F69/F64-/F64.8",
                "https://www.icd10data.com/ICD10CM/Codes/F01-F99/F60-F69/F64-/F64.9"
                ]

// Routes

// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  axios.get(f64Site[0]).then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $(heading).each(function(i, element) {
      var result = {};
      result.title = $(this)
        .children()
        .text();

      // Create a new ICD10 using the `result` object built from scraping
      db.ICD10.create(result)
        .then(function(dbICD10) {
          // View the added result in the console
          console.log(dbICD10);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    

    // If we were able to successfully scrape and save an ICD10, send a message to the client
    res.send("Scrape Complete");
  });
});

app.get("/all", function(req, res) {
  // Query: In our database, go to the zoo collection, then "find" everything
  db.ICD10.find({})
    .then(function(dbICD10) {
      // If we were able to successfully find ICD10s, send them back to the client
      res.json(dbICD10);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for getting ordered ICD10s from the db
app.get("/codes", function(req, res) {
  // Grab every document in the ICD10s collection
  db.ICD10.find().sort({ title: 1 })
    .then(function(dbICD10) {
      // If we were able to successfully find ICD10s, send them back to the client
      res.json(dbICD10);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific ICD10 by id, populate it with it's note
app.get("/codes/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.ICD10.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbICD10) {
      // If we were able to successfully find an ICD10 with the given id, send it back to the client
      res.json(dbICD10);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an ICD10's associated Note
app.post("/codes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one ICD10 with an `_id` equal to `req.params.id`. Update the ICD10 to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.ICD10.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbICD10) {
      // If we were able to successfully update an ICD10, send it back to the client
      res.json(dbICD10);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
