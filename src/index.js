var bodyParser = require('body-parser'),
	config = require('./config/config.js'),
	db = require('mongoose'),
	express = require('express'),
	fs = require('fs'),
	jade = require('jade'),
	Session = require('./model/Session.js');
var app = express();

// verbinde mit Datenbank
db.connect('mongodb://'+config.db.ip+':'+config.db.port+'/'+config.db.db);
app.use("/css", express.static("./template/css"));
app.use("/img", express.static("./template/img")); 	

app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));

// mache body parsing und rendere templates automatisch
app.use(function(req, res, next) {
	var send = res.send.bind(res);
	res.send = function(content) {
		if (typeof content === 'string') return send(content);
		if (!content.template) return send(content);

		fs.readFile('./template/'+content.template+'.jade', function(err, tpl) {
			if (err) return send('bambambam... error, sry pplz');

			var fn = jade.compile(tpl, {filename: './template/'+content.template+'.jade'});
			var response = fn(content.data);
			send(response);
		});
	};
	next();
});

app.all('*', function(req, res, callback) {
	if (!req.param('sessionId')) return callback();

	Session.findOne({_id: req.param('sessionId')})
		.exec(function(err, session) {
			if (err) return callback(err);

			res.locals.session = session;
			callback();
		});
});

// Import der Controller
[
	'Company',
	'DiscussionPost',
	'DiscussionThread',
	'Project',
	'ProjectTask',
	'ProjectTaskStatus',
	'User'
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