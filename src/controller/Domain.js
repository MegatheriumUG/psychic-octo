var autodns = require('../config/autodns.js'),
	Domain = require('../model/Domain.js');

exports.setup = function(app) {
	/**
	 * Changes the target of a domain.
	 * @param domainId contains the id of the domain that will be updated
	 * @param target the new target
	 */
	app.post('/DomainMove', function(req, res, jump) {
		Domain.findById(req.param('domainId'))
			.exec(function(err, domain) {
				if (err) return jump(err);
				if (!domain) return res.send({status: 'error', errors: ['Die Domain wurde nicht gefunden.']});

				// Änderung notwendig?
				if (domain.target == req.param('target')) return res.send({status: 'success'});

				// update!
				domain.target = req.param('target');

				async.parallel([
					function(next) {domain.save(next);},

					function(next) {

					}
				], function(err) {
					if (err) return jump(err);
					res.send({status: 'success'});
				});
			});
	});
};