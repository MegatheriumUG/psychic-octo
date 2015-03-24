exports.setup = function(app) {
	app.get('/', function(req, res, jump) {
		res.send({template: 'Home'});
	});
	app.get('/Home', function(req, res, jump) {
		res.send({template: 'Home'});
	});
}