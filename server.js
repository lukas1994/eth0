var request = require('request');

request({
	uri: 'http://54.171.127.72:25000',
	method: 'POST',
	json: {"type": "hello", "team": "LGP"},
	callback: function(err, res, body) {
		console.log(res)
	}
})