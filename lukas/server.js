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
var portfolio = {};
var done = false;

// Command line arguments override defaults
if (process.argv.length == 4) {
	c.host = process.argv[2];
	c.port = parseInt(process.argv[3]) + 25000;
}
console.log(c.host, c.port);

var client = new net.Socket();

var pause = false;

client.on('data',function(data){
  if (pause) return;
  console.log('now');
  //clean trades
  /*for (var id in trades) {
    try {
      if (Date.now() - trades[id].time > 2000) {
        cancel(id);
      }
    } catch(e) {}
  }*/

	var lines = data.toString().split("\n");
	for (var i = 0; i < lines.length; i++){
  	try {
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
        if (line.dir == 'BUY')
          portfolio[line.symbol] += line.size;
        else
          portfolio[line.symbol] -= line.size;
      }
      else if (line.type == 'out') {
        console.log('OUT');
        delete trades[line.order_id];
      }
      else if (line.type == 'hello'){
        /*if (!line.market_open) {
          console.log('market closed');
          process.exit(0);
        }*/
        for (var i = 0; i < line.symbols; i++) {
          portfolio[line.symbols[i].symbol] = line.symbols[i].position;
        }
      }
      else if (line.type == 'trade') {
        //console.log("%d, %d",lines[i].price,lines[i].size)
      }
      else if (line.type == 'market_open') {

      }
    }
  	catch(e) {
      console.log('caught ERROR');
    }
  }

  var clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  var myBooks = clone(books);

  // strategy
  for (var sym in myBooks) {
    /*console.log(sym);
    for (var i = 0; i < books[sym].buy; i++) {
      books[sym].buy[i] = parseInt(books[sym].buy[i][0]);
      console.log(':::' + books[sym].buy[i][0]);
    }
    for (var i = 0; i < books[sym].sell; i++)
      books[sym].sell[i] = parseInt(books[sym].sell[i][0]);*/
    var x = myBooks[sym].sell.map(function(o) {return o[0];}).min();
    var y = myBooks[sym].buy.map(function(o) {return o[0];}).max();

    myBooks[sym].buy = x;
    myBooks[sym].sell = y;
  }
  //console.dir(books);
  var corge = myBooks['CORGE'], foo = myBooks['FOO'], bar = myBooks['BAR'];


  // sell
  /*if (portfolio['CORGE'] > 500) {
    sell('CORGE', buy_corge, AMOUNT);
  }*/
  if(true) {

    var DELTA = 2;
      var AMOUNT = 50;
      var WIN = 10;
      var THRESH = 10;

    if (corge && foo && bar) {
      /*var myTrades = clone(trades);
      console.log('COUNT: ' + Object.keys(myTrades).length);
      for (var id in myTrades) {
        try {
          var trade = myTrades[id];
          if (trade.dir == 'BUY') {
            if (trade.price + THRESH < myBooks[trade.symbol].buy) {
              cancel(id);
              delete trades[id];
              buy(trade.symbol, myBooks[trade.symbol].buy + DELTA, trade.size);
            }
          }
          else if (trade.dir == 'SELL') {
            if (trade.price - THRESH > myBooks[trade.symbol].sell) {
              cancel(id);
              delete trades[id];
              sell(trade.symbol, myBooks[trade.symbol].sell - DELTA, trade.size);
            }
          }
        } catch(e) {}
      }*/

      /*corge.buy = corge.buy.map(function(o) {return o[0];});
      foo.buy = foo.buy.map(function(o) {return o[0];});
      bar.buy = bar.buy.map(function(o) {return o[0];});

      corge.sell = corge.sell.map(function(o) {return o[0];});
      foo.sell = foo.sell.map(function(o) {return o[0];});
      bar.sell = bar.sell.map(function(o) {return o[0];});*/

      var buy_corge = corge.buy+DELTA;
      var buy_foo = foo.buy+DELTA;
      var buy_bar = bar.buy+DELTA;

      var sell_corge = corge.sell-DELTA;
      var sell_foo = foo.sell-DELTA;
      var sell_bar = bar.sell-DELTA;

      console.log(buy_corge*AMOUNT+100, (0.3*sell_foo + 0.8*sell_bar)*AMOUNT);

      //if (!done) {
        if ((0.3*sell_foo + 0.8*sell_bar)*AMOUNT - (buy_corge*AMOUNT+100) > WIN) {
          convert('SELL', AMOUNT);

          buy('CORGE', buy_corge, AMOUNT);
          sell('FOO', sell_foo, Math.floor(0.3*AMOUNT));
          sell('BAR', sell_bar, Math.floor(0.8*AMOUNT));

          pause = true;
          setTimeout(function() {
            pause = false;
          }, 1000);

        }
        if (sell_corge*AMOUNT - ((0.3*buy_foo + 0.8*buy_bar)*AMOUNT+100) > WIN) {
          convert('BUY', AMOUNT);

          sell('CORGE', sell_corge, AMOUNT);
          buy('FOO', buy_foo, Math.floor(0.3*AMOUNT));
          buy('BAR', buy_bar, Math.floor(0.8*AMOUNT));

          pause = true;
          setTimeout(function() {
            pause = false;
          }, 1000);
        }
      //}
    } 
  }
	
});

client.on('closed',function(){
  console.log('closed');
});

client.on('error',function(error){
  console.log('error: ' + error);
});

client.connect(c.port,c.host,function(){
	console.log('connected');
	
  hello();
});

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

var convert = function(dir, size) {
  console.log('convert');
  return execute({
    "type": "convert",
    "order_id": nextOrderId++,
    "symbol": "CORGE",
    "dir": dir,
    "size": size
  });
};

var cancel = function(orderID){
	return execute({
		"type": "cancel",
		"order_id": orderID
	});
};
