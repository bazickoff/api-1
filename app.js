const express = require('express');
const app = express();
const router = express.Router();

const bodyParser = require('body-parser');
const timeout = require('connect-timeout');
const axios = require('axios');
const apicache = require('apicache');
const redis = require('redis');
const fs = require('fs');

const CheckTwitter = require('./libs/Twitter');
const CheckInstagram = require('./libs/Instagram');
const CheckSteam = require('./libs/Steam');
const CheckYoutube = require('./libs/Youtube');
const CheckMixer = require('./libs/Mixer');

app.use(router);
app.use(timeout('5s'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(haltOnTimedout);

function checkAuthKey(req, res, next) {
  var keys = require('./apikeys.json');
  var appkey = req.get('og-apikey');

  if (keys.authorized.includes(appkey)) {
    next()
  } else {
    res.json({"status": "unauthorized"});
  }
}

let cacheWithRedis = apicache.options({ redisClient: redis.createClient() }).middleware;

/* GET root api endpoint */
router.get('/', function(req, res) {
  res.send('this is the root api endpoint');
});

router.get('/check/services', function(req, res) {
  var services = require('./services.json');
  res.json(services);
});

router.get('/check/:service/:word', [checkAuthKey, cacheWithRedis('6 hours')], function(req, res) {
   var service = req.params.service;
   var word = req.params.word;

   switch (service) {
      case "twitter":
         CheckTwitter(service, word, res);
         break;
      case "instagram":
         CheckInstagram(service, word, res);
         break;
      case "steamid":
         CheckSteam(service, word, res);
         break;
      case "steamgroup":
         CheckSteam(service, word, res);
         break;
      case "youtube":
         CheckYoutube(service, word, res);
         break;
      case "mixer":
         CheckMixer(service, word, res);
         break;
   }
});

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

app.listen(8080, 'localhost');

module.exports = app;
