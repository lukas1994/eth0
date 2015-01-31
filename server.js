var request = require('request');

request({
	uri: 'http://10.0.85.231:25000',
	method: 'POST',
	json: {"type": "hello", "team": "LGP"},
	callback: function(err, res, body) {
		console.log(error)
		console.log(res)
	}
})
