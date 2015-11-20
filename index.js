var express = require('express');

// constants
var PORT = 8080;

// app
var app = express();
app.get('/', function(req,res){
	res.send('Hello world\nupdated\n');
});

app.get('/test', function(req,res){
	res.send('this is a test folder\n');
});

app.listen(PORT);
console.log('Running on http://localhost:'+PORT);
