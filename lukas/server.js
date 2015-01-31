'use strict';

var net = require('net');
var c = require('./constants.js');
var nextOrderId = 0;

Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

var trades = {};
var books = {};

// Command line arguments override defaults
if (process.argv.length == 4) {
	c.host = process.argv[2];
	c.port = parseInt(process.argv[3]) + 25000;
}

var client = new net.Socket();

client.on('data',function(data){
  //clean trades
  for (id in trades) {
    if (Date.now() - trades[id].time > 5000) {
      cancel(id);
    }
  }

	var lines = data.toString().split("\n");
	for (var i = 0; i < lines.length; i++){
  	try{
      var line = JSON.parse(lines[i]);

      if (line.type == 'book') {
        books[line.symbol] = line;  
      }
      else if (line.type == 'ack') {
        trades[line.order_id].status = 'ack';
        console.log('ack');
      }
      else if (line.type == 'reject') {
        console.log('REJECT: ' + line.error);
        trades[line.order_id] = undefined;
      }
      else if (line.type == 'fill') {
        trades[line.order_id].size -= line.size;
      }
      else if (line.type == 'out') {
        trades[line.order_id] = undefined;
      }
      else if (line.type == 'hello'){
        if (!line.market_open) {
          console.log('market closed');
          process.exit(0);
        }
      }
      else if (line.type == 'trade')
        //console.log("%d, %d",lines[i].price,lines[i].size)
      }
  	catch(e){
      console.log('caught ERROR');
    }

    // strategy
    var corge = books['CORGE'], foo = books['FOO'], bar = books['BAR'];
    if (corge && foo && bar) {
          console.log('IN');

      var buy_corge = corge.buy.min()+1;
      var buy_foo = foo.buy.min()+1;
      var buy_bar = bar.buy.min()+1;

      var sell_corge = corge.buy.max()-1;
      var sell_foo = foo.buy.max()-1;
      var sell_bar = bar.buy.max()-1;

      var DELTA = 1;
      var AMOUNT = 100;

      console.log(buy_corge, (0.3*sell_foo + 0.7*sell_bar));

      if (buy_corge < (0.3*sell_foo + 0.7*sell_bar)) {
        buy('CORGE', buy_corge, AMOUNT);
        sell('FOO', sell_foo, Math.floor(0.3*AMOUNT));
        sell('BAR', sell_bar, Math.floor(0.7*AMOUNT));
      }
      if ((0.3*buy_foo + 0.7*buy_bar) < sell_corge) {
        sell('CORGE', buy_corge, AMOUNT);
        buy('FOO', sell_foo, Math.floor(0.3*AMOUNT));
        buy('BAR', sell_bar, Math.floor(0.7*AMOUNT));
      }
    }
	}
})

client.on('closed',function(){
  console.log('closed');
})

client.on('error',function(error){
  console.log('error');
})

client.connect(c.port,c.host,function(){
	console.log('connected');
	
  hello();
})

// Return the correct JSON messages
var execute = function(o) {
  return client.write(JSON.stringify(o) + "\n");
};
var hello = function() {
  return execute({
      type: "hello",
      team: c.team
  });
};
var buy = function(symbol, price, size){
	return add("BUY",symbol,price,size);
};

var sell = function(symbol, price, size){
	return add("SELL",symbol,price,size);
};

var add = function(direction, symbol, price, size){
  trades[nextOrderId] = {
    "symbol": symbol,
    "dir": direction, 
    "price": price, 
    "size": size,
    "status": "open",
    "time": Date.now()
  };
	return execute({ 
			"type": "add",
			"order_id": nextOrderId++,
			"symbol": symbol,
			"dir": direction, 
			"price": price, 
			"size": size
		});
};

var cancel = function(orderID){
	return execute({
		"type": "cancel",
		"order_id": orderID
	});
};
