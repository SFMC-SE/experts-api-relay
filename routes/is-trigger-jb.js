var express = require('express');
var request = require("request");
var bodyParser = require("body-parser");
var router = express.Router();
var token = '';
var payload = '';
var arrayRootName = [];
var arrayRootData = [];
var arrayDeColumnsName = [];
var arrayDeColumnsData = [];

router.post('/triggerjourney', function(req, res) {
  var isElementCount = req.body.root.elements.length;
  for (var i = 0; i < req.body.root.elements.length; i++) {
    if (req.body.root.elements[i].name.toUpperCase() == 'DECOLUMNS') {
      for (var j = 0; j < req.body.root.elements[i].elements.length; j++) {
        arrayDeColumnsName.push(req.body.root.elements[i].elements[j].name);
        arrayDeColumnsData.push(req.body.root.elements[i].elements[j].data);
      }
    } else {
      arrayRootName.push(req.body.root.elements[i].name);
      arrayRootData.push(req.body.root.elements[i].data);
    }
  }
  buildPayload();
  var options = {
    method: 'POST',
    url: 'https://auth.exacttargetapis.com/v1/requestToken',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      clientId: req.query.clientId,
      clientSecret: req.query.clientSecret
    },
    json: true
  };
  request(options, function(error, response, body) {
    if (!error) {
      res.send({
        'accessToken': response.body.accessToken
      });
      token = response.body.accessToken;
      fireJourney();
    } else {
      res.send({
        'message': response.body.message
      });
    }
  });
});

function buildPayload() {
  payload = '{'
  var arrayRootLength = arrayRootName.length;
  for (var i = 0; i < arrayRootLength; i++) {
    payload += '"' + arrayRootName[i] + '":' + '"' + arrayRootData[i] + '",';
  }
  payload += '"Data":{'
  var arrayDeColumnsLength = arrayDeColumnsName.length;
  for (var j = 0; j < arrayDeColumnsLength; j++) {
    payload += '"' + arrayDeColumnsName[j] + '":' + '"' + arrayDeColumnsData[j] + '"';
    if (j != arrayDeColumnsLength - 1) {
      payload += ','
    }
  }
  payload += '}'
  payload += '}'
}

function fireJourney(req, res) {
  var journeyPayload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    url: 'https://www.exacttargetapis.com/interaction/v1/events',
    body: JSON.parse(payload),
    json: true
  };
  console.log(journeyPayload);
  request(journeyPayload, function(error, response, body) {
    if (!error) {
      console.log('journey event: ' + response.body.eventInstanceId);
    } else {
      console.log('journey error: ' + error);
    }
  });
};

module.exports = router;
