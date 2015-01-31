var net = require('net')
var pennyingStrategy = require('./pennying.js')
var c = require('./constants.js')
var nextOrderId = 0
var canTrade = false

var pennying = {
  BAR: [0,Infinity],
  BAZ: [0,Infinity],
  FOO: [0,Infinity],
  QUUX: [0,Infinity],
  CORGE: [0,Infinity]
}

var lines = []

// Command line arguments override defaults
if (process.argv.length == 4){
	c.host = process.argv[2]
	c.port = parseInt(process.argv[3]) + 25000
}

var client = new net.Socket()

client.on('data',function(data){
	lines = data.toString().split("\n")
	for (var i = 0; i < lines.length; i++){
  	try{ lines[i] = JSON.parse(lines[i])}
  	catch(e){}
  	if (lines[i].type == 'book'){
  	  for (var i = 0; i < book.buy.length; i++){
    	  pennying[book.symbol][0] = Math.max(pennying[book.symbol][0],book.buy[i].)
    	  
  	  }    	
  	}
    else if (lines[i].type == 'hello'){
      canTrade = lines[i].market_open
      client.write(JSON.stringify(sell('BAR',1,10))+'\n')     
    }
    else if (lines[i].type == 'trade' && lines[i].symbol == 'BAR')
      console.log("%d, %d",lines[i].price,lines[i].size)
	}
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
