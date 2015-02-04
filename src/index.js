var db = require('mongoose'),
	express = require('express'),
	fs = require('fs'),
	jade = require('jade');
var app = express();

// verbinde mit Datenbank
db.connect('mongodb://37.120.171.34:27017/psychic-octo');

//app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

// mache body parsing und rendere templates automatisch
app.use(function(req, res, next) {
	var send = res.send.bind(res);
	res.send = function(content) {
		if (typeof content === 'string') return content;

		fs.readFile('./template/'+content.template+'.jade', function(err, tpl) {
			if (err) return send('bambambam... error, sry pplz');

			var fn = jade.compile(tpl, {filename: './template/'+content.template+'.jade'});
			var response = fn(content.data);
			send(response);
		});
	};
	next();
});

// Import der Controller
[
	'Company'
].map(function(controllerName) {
	require('./controller/'+controllerName+'.js').setup(app);
});

// fange Fehler ab
require('./router/ErrorRouter.js').setup(app);

var server = app.listen(2000, function() {
	var host = server.address().host;
	var port = server.address().port;

	console.log('started server on http://'+host+':'+port);
});