'use strict';

var request = require('request');

request('http://google.com', function(err, res, body) {
		console.log(res);
});