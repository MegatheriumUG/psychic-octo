var async = require('async'),
	db = require('mongoose'),
	Company = require('./model/Company.js'),
	Server = require('./model/Server.js');

var companies = {
	abys: new Company({name: 'Abys GmbH'}),
	megatherium: new Company({name: 'Megatherium GmbH'})
};

var servers = [
	{ip: '37.120.162.186', owner: companies.abys, resources: {ram: 16777, cpu: 4, hdd: 976}, domains: ['v12014092366620331.yourvserver.net']},
	{ip: '37.120.162.188', owner: companies.abys, resources: {ram: 16777, cpu: 4, hdd: 976}, domains: ['v12014092366620330.yourvserver.net']},
	{ip: '37.120.170.174', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821800.yourvserver.net']},
	{ip: '37.120.171.34', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821973.yourvserver.net']},
	{ip: '37.120.171.46', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821974.yourvserver.net']},
	{ip: '37.120.171.51', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821975.yourvserver.net']},
	{ip: '37.120.176.139', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622869.yourvserver.net']},
	{ip: '37.120.176.142', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622874.yourvserver.net']},
	{ip: '37.120.176.143', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622871.yourvserver.net']},
	{ip: '37.120.176.144', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622873.yourvserver.net']},
	{ip: '37.120.176.147', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622870.yourvserver.net']},
	{ip: '37.120.176.150', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622875.yourvserver.net']},
	{ip: '37.221.199.201', owner: companies.megatherium, resources: {ram: 2097, cpu: 2, hdd: 78}, domains: ['v22013051078812951.yourvserver.net']},
	{ip: '46.38.233.185', owner: companies.megatherium, resources: {ram: 2097, cpu: 2, hdd: 78}, domains: ['v22013051078812736.yourvserver.net']},
	{ip: '46.38.252.137', owner: companies.megatherium, resources: {hdd: 40}, domains: ['v2201112107886801.yourvserver.net']}
];

async.parallel([
	// create companies
	function(next) {
		async.each(Object.keys(companies), function(name, next2) {
			companies[name].save(next2);
		}, next);
	},

	// create servers
	function(next) {
		async.each(servers, function(server, next2) {
			var obj = new Server(server);
			server._id = obj._id;
			obj.save(next2);
		}, next);
	}
], function(err) {
	if (err) throw err;
	console.log('Installation erfolgreich abgeschlossen');
});