var async = require('async'),
	config = require('../config/config.js'),
	db = require('mongoose'),
	fs = require('fs'),
	Company = require('../model/Company.js'),
	File = require('../model/File.js');

exports.setup = function(app) {
	app.get('/CompanyList', function(req, res, jump) {
		res.locals.session.hasPermission('company.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um alle Unternehmen auflisten zu können.']});

			Company.find({})
				.sort('name')
				.exec(function(err, companies) {
					if (err) return jump(err);

					var response = {data: {companies: companies}, template: 'CompanyList'};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	/**
	 * Hinzufügen von Unternehmen
	 */
	app.get('/CompanyAdd', function(req, res, jump) {
		res.locals.session.hasPermission('company.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Unternehmen anlegen zu können.']});

			res.send({template: 'CompanyAdd'});
		});
	});
	app.post('/CompanyAdd', function(req, res, jump) {
		res.locals.session.hasPermission('company.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Unternehmen anlegen zu können.']});
			
			var company = new Company({
				name: req.param('name'),
				description: req.param('description')
			});

			if (!company.name) return res.send({status: 'error', errors: ['Sie müssen einen Namen für das Unternehmen angeben.']});
			var image = null;
			if (req.param('image')) {
				image = new File();
				company.image = image._id;
			}

			async.parallel([
				function(next) {
					if (!req.param('image')) return next();

					image.save(next);
				},

				function(next) {
					if (!req.param('image')) return next();

					fs.writeFile(config.PICTURE_DIRECTORY+file._id, req.param('image'), next);
				},

				function(next) {company.save(next);}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'CompanyAdd', data: {company: company}});
			});
		});
	});

	app.get('/CompanyDelete', function(req, res, jump) {
		res.locals.session.hasPermission('company.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Unternehmen löschen zu können.']});

			Company.remove({_id: req.query.companyId})
				.exec(function(err) {
					if (err) return jump(err);

					res.writeHead(302, {'Location': '/CompanyList?sessionId='+res.locals.session._id+'&status=success.delete'});
					res.end();
				});
		});
	});

	app.get('/CompanyEdit', function(req, res, jump) {
		res.locals.session.hasPermission('company.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Unternehmen bearbeiten zu können.']});

			Company.findById(req.query.companyId)
				.exec(function(err, company) {
					if (err) return jump(err);
					if (!company) return res.send({status: 'error', template: 'Error', errors: ['Das Unternehmen konnte nicht gefunden werden.']});

					res.send({template: 'CompanyEdit', data: {company: company}});
				});
		});
	});

	app.post('/CompanyEdit', function(req, res, jump) {
		res.locals.session.hasPermission('company.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Unternehmen bearbeiten zu können.']});

			Company.findById(req.body.companyId)
				.exec(function(err, company) {
					if (err) return jump(err);
					if (!company) return res.send({status: 'error', template: 'Error', errors: ['Das Unternehmen konnte nicht gefunden werden.']});

					company.name = req.body.name;
					company.description = req.body.description;
					company.save(function(err) {
						if (err) return jump(err);
						res.send({status: 'success', template: 'CompanyEdit', data: {company: company}});
					});
				});
		});
	});
};