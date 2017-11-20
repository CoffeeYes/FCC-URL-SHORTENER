// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var mongoURL = "mongodb://test:123456@ds115166.mlab.com:15166/url-db";


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get("/new/*",function(request,response) {
  var rq_url = request.url.split("/new/")[1]
  var url_regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(url_regex.test(rq_url)) {
    mongoClient.connect(mongoURL,function(error,database) {
      if(error)throw error;
      else {
        console.log("connected to database successfully");
        
        //increment the counter on the database
        database.collection("url-list").update(
          {"name" : "current_count"},
          {$inc: {"value" : 1}}
        )
        
        //get the current counter value from the database
        var find_count = database.collection("url-list").find({name: "current_count"}).toArray(function(error,items) {
          if (error)throw error;
          else {
            //use the counter to create a new url
            var local_current_count = String(items[0]["value"])
            var new_short_url = "https://keen-ravioli.glitch.me/short/" + local_current_count
            //object containing both urls to push to database
            var send_object = {
              "original_url": rq_url,
              "short_url": new_short_url
            }
            //push object to database and send it as the response
            database.collection("url-list").insertOne(send_object);
            response.send("Your Short Url : " + send_object.short_url)
          }
        })
        
      }
      
      
    })
  }
});

app.get("/short/*",function(request,response) {
  var num = request.url.split("/short/")[1]
  if (typeof parseInt(num) == "number") {
    //the short url to search the database with
    var searchString = "https://keen-ravioli.glitch.me/short/" + num;
    mongoClient.connect(mongoURL,function(error, database) {
      if (error) throw error;
      else {
        //find the short url in the database and redirect to it
        database.collection("url-list").find({"short_url" : searchString}).toArray(function(error,items) {
          if (error) throw error;
          else {
            response.redirect(items[0]["original_url"]);
          }
        })
      }
    })
  }
})

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});
// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
