var net = require('net')
var strategy = require('./pennying.js').strategy
var c = require('./constants.js')

/* State */
var nextOrderId = 0
var openOrders = []
var positions = {
  BAR: 0,
  BAZ: 0,
  FOO: 0,
  QUUX: 0,
  CORGE: 0
}
var book = {
  BAR: { sell: null, buy: null },
  BAZ: { sell: null, buy: null },
  FOO: { sell: null, buy: null },
  QUUX: { sell: null, buy: null },
  CORGE: { sell: null, buy: null }
}
var canTrade = false
var cash = 0



var maxMin = {
  // max buy, min sell
  BAR: [0,Infinity],
  BAZ: [0,Infinity],
  FOO: [0,Infinity],
  QUUX: [0,Infinity],
  CORGE: [0,Infinity]
}
var pennyingVal = .25


// Command line arguments override defaults
if (process.argv.length == 4){
	c.host = process.argv[2]
	c.port = parseInt(process.argv[3]) + 25000
}

var client = new net.Socket()

client.on('data',function(data){
	lines = data.toString().split("\n")
	for (var i = 0; i < lines.length; i++){
  	var line
  	try{ line = JSON.parse(lines[i]) }
  	catch(e){}
  	
  	if (line.type == 'hello'){
      canTrade = line.market_open
      cash = line.cash
      for (var i = 0; i < line.symbols.length; i++)
        positions[line.symbols[i].symbol] = line.symbols[i].position
    }
    else if (line.type == 'book'){
  	  book[line.symbol].buy = line.buy
  	  book[line.symbol].sell = line.sell
	  } 
    else if (line.type == 'market_open')
      canTrade = line.open 
    else if (line.type == 'error')
      console.log(line.error)
    else if (line.type == 'trade'){
      strategy.
    }
    else if (line.type == 'ack')
      openOrders.push(line.order_id)
    else if (line.type == 'reject')
      console.log("Rejected order %d: %s",line.order_id,line.error)
    else if (line.type == 'fill'){
      if (line.dir == 'BUY'){
        cash -= line.price
        positions[line.symbol] += line.size
      }
      else {
        cash += line.price
        positions[line.symbol] -= line.size
      }
    }
    else if (line.type == 'out'){
        curren
    }
  }
	
	
	
	
{"type":"trade","symbol":"SYM","price":N,"size":N}
{"type":"fill","order_id":N,"symbol":"SYM","dir":"BUY","price":N,"size":N}
{"type":"out","order_id":N}
})

client.on('closed',function(){
  console.log('closed')
})

client.on('error',function(error){
  console.log('error')
})

client.connect(c.port,c.host,function(){
	console.log('connected')
	
  client.write(JSON.stringify({
  		type: "hello",
      team: c.team
  	})+"\n")
})

// Return the correct JSON messages
var buy = function(symbol, price, size){
	return add("BUY",symbol,price,size)
}

var sell = function(symbol, price, size){
	return add("SELL",symbol,price,size)
}

var add = function(direction, symbol, price, size){
	return client.write(JSON.stringify({ 
			"type": "add",
			"order_id": nextOrderId++,
			"symbol": symbol,
			"dir": direction, 
			"price": price, 
			"size": size
		}) + "\n" )
}

var cancel = function(orderID){
	return client.write(JSON.stringify({
		"type": "cancel",
		"order_id": orderID
		}) + "\n" )
}
