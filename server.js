var netcat = require('node-netcat')
var c = require('./constants.js')
var nextOrderId = 0

// Command line arguments override defaults
if (process.argv.length == 4){
	c.host = process.argv[2]
	c.port = parseInt(process.argv[3]) + 25000
}

var client = netcat.client(c.port, c.host)

client.on('open', function (){
	console.log('open')
})

client.on('error',function(error){

})

client.on('close',function(){

})

client.on('data',function(data){
	console.log(data)
})

client.start()

client.send({
		"type": "hello",
		"team": c.team
	})

// Return the correct JSON messages
var buy = function(symbol, price, size){
	return add("BUY",symbol,price,size)
}

var sell = function(symbol, price, size){
	return add("SELL",symbol,price,size)
}

var add = function(direction, symbol, price, size){
	return { 
			"type": "add",
			"order_id": nextOrderId++,
			"symbol": symbol,
			"dir": direction, 
			"price": price, 
			"size": size
		}
}

var cancel = function(orderID){
	return {
		"type": "cancel",
		"order_id": orderID
	}
}
