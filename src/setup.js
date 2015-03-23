var async = require('async'),
	db = require('mongoose'),
	fs = require('fs'),
	Company = require('./model/Company.js'),
	Domain = require('./model/Domain.js'),
	Server = require('./model/Server.js');

var services = [
	{name: 'mongodb-config', scripts: [
		{type: 'install', commands: [
			'sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10',
			'echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list',
			'sudo apt-get update',
			'apt-get install -y mongodb-org-server'
		]},
		{type: 'uninstall', commands: [
			'apt-get remove -y mongodb-org-server'
		]},
		{type: 'setup', commands: [
			
		]},
		{type: 'start', commands: [
			'mongod --config /etc/mongod.conf'
		]},
		{type: 'stop', commands: [
			'kill -9 $(ps opid= -C mongod)'
		]}
	], files: [
		{name: '/etc/mongod.conf', content: fs.readFileSync('./config/service/mongod-conf.conf')}
	], configurations: [
		'mongodb-default', 'mongodb-config'
	]},

	{name: 'mongodb-shard', scripts: [
		{type: 'install', commands: [
			'sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10',
			'echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list',
			'sudo apt-get update',
			'apt-get install -y mongodb-org-server'
		]},
		{type: 'uninstall', commands: [
			'apt-get remove -y mongodb-org-server'
		]},
		{type: 'setup', commands: [
			'mkdir /data',
			'mkdir /data/db'
		]},
		{type: 'start', commands: [
			'mongod --config /etc/mongod.conf'
		]},
		{type: 'stop', commands: [
			'kill -9 $(ps opid= -C mongod)'
		]}
	], files: [
		{name: '/etc/mongod.conf', content: fs.readFileSync('./config/service/mongod-shard.conf')}
	], configurations: [
		'mongodb-default', 'mongodb-shard'
	]}
];

var deployment = [
	{name: 'Mongo-Cluster', services: [
		{name: 'mongodb-config', servers: [
			'37.120.171.34',
			'37.120.171.46',
			'37.120.171.51'
		]},
		{name: 'mongodb-shard', servers: [
			'37.120.171.174',
			'46.38.233.185'
		]}
	], configurations: [
		{MONGODB_SHARD_AMOUNT: 2}
	]}
];

var configurations = {
	'mongodb-default': {
		LOG_FILENAME: '/var/log/mongodb/mongodb.org'
	},
	'mongodb-config': {},
	'mongodb-shard': {
		MONGODB_SHARD_AMOUNT: 1
	}
};

var companies = {
	abys: new Company({name: 'Abys GmbH'}),
	megatherium: new Company({name: 'Megatherium GmbH'})
};

var servers = [
	{ip: '5.45.99.135', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623017.yourvserver.net']},
	{ip: '5.45.101.87', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623020.yourvserver.net']},
	// Node.JS Mainserver
	{ip: '37.120.162.186', owner: companies.abys, resources: {ram: 16777, cpu: 4, hdd: 976}, domains: ['v12014092366620331.yourvserver.net']},
	{ip: '37.120.162.188', owner: companies.abys, resources: {ram: 16777, cpu: 4, hdd: 976}, domains: ['v12014092366620330.yourvserver.net']},
	{ip: '37.120.170.174', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821800.yourvserver.net']},
	{ip: '37.120.171.34', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821973.yourvserver.net']},
	{ip: '37.120.171.46', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821974.yourvserver.net']},
	// MongoDB Shard 2 Replica 2
	{ip: '37.120.171.51', owner: companies.megatherium, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22014121078821975.yourvserver.net']},
	// MongoDB Config 1
	{ip: '37.120.176.139', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622869.yourvserver.net']},
	// MongoDB Config 2
	{ip: '37.120.176.142', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622874.yourvserver.net']},
	// MongoDB Config 3
	{ip: '37.120.176.143', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622871.yourvserver.net']},
	// MongoDB Shard 1
	{ip: '37.120.176.144', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622873.yourvserver.net']},
	// MongoDB Shard 2
	{ip: '37.120.176.147', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622870.yourvserver.net']},
	// MongoDB Shard 1 Replica 1
	{ip: '37.120.176.150', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015012366622875.yourvserver.net']},
	{ip: '37.120.176.200', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366622996.yourvserver.net']},
	{ip: '37.120.176.202', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623000.yourvserver.net']},
	{ip: '37.120.176.204', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366622999.yourvserver.net']},
	{ip: '37.120.176.205', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623006.yourvserver.net']},
	{ip: '37.120.176.208', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623011.yourvserver.net']},
	{ip: '37.221.199.201', owner: companies.megatherium, resources: {ram: 2097, cpu: 2, hdd: 78}, domains: ['v22013051078812951.yourvserver.net']},
	{ip: '46.38.233.185', owner: companies.megatherium, resources: {ram: 2097, cpu: 2, hdd: 78}, domains: ['v22013051078812736.yourvserver.net']},
	{ip: '46.38.233.224', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623019.yourvserver.net']},
	{ip: '46.38.235.241', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623016.yourvserver.net']},
	{ip: '46.38.237.252', owner: companies.abys, resources: {ram: 6291, cpu: 2, hdd: 117}, domains: ['v22015022366623021.yourvserver.net']},
	{ip: '46.38.252.137', owner: companies.megatherium, resources: {hdd: 40}, domains: ['v2201112107886801.yourvserver.net']}
];

var domains = [
	['botanically.de', companies.megatherium],
	['dressado.com', companies.abys],
	['dressado.de', companies.abys],
	['dressciety.at', companies.abys],
	['dressciety.ch', companies.abys],
	['dressciety.com', companies.abys],
	['dressciety.de', companies.abys],
	['dressciety.eu', companies.abys],
	['dressciety.net', companies.abys],
	['dressiety.at', companies.abys],
	['dressiety.ch', companies.abys],
	['dressiety.com', companies.abys],
	['dressiety.de', companies.abys],
	['dressiety.eu', companies.abys],
	['dressiety.net', companies.abys],
	['dressity.at', companies.abys],
	['dressity.ch', companies.abys],
	['dressity.de', companies.abys],
	['dressity.eu', companies.abys],
	['dressity.net', companies.abys],
	['megatherium.solutions', companies.megatherium],
	['megatherium.to', companies.megatherium],
	['node-cloud.at', companies.megatherium],
	['node-cloud.ch', companies.megatherium],
	['node-cloud.de', companies.megatherium],
	['node-cloud.eu', companies.megatherium],
	['node-cloud.net', companies.megatherium],
	['nodecloud.at', companies.megatherium],
	['nodecloud.ch', companies.megatherium],
	['nodecloud.eu', companies.megatherium],
	['nodejs.codes', companies.megatherium],
	['nodejs.market', companies.megatherium],
	['nodejs.software', companies.megatherium],
	['nodejs-cloud.at', companies.megatherium],
	['nodejs-cloud.ch', companies.megatherium],
	['nodejs-cloud.de', companies.megatherium],
	['nodejs-cloud.eu', companies.megatherium],
	['nodejs-cloud.net', companies.megatherium],
	['nodejs-host.at', companies.megatherium],
	['nodejs-host.ch', companies.megatherium],
	['nodejs-host.com', companies.megatherium],
	['nodejs-host.eu', companies.megatherium],
	['nodejs-host.net', companies.megatherium],
	['nodejs-hosting.at', companies.megatherium],
	['nodejs-hosting.ch', companies.megatherium],
	['nodejscloud.at', companies.megatherium],
	['nodejscloud.ch', companies.megatherium],
	['nodejscloud.de', companies.megatherium],
	['nodejscloud.eu', companies.megatherium],
	['nodejscloud.net', companies.megatherium],
	['npmjs.at', companies.megatherium],
	['npmjs.ch', companies.megatherium],
	['npmjs.de', companies.megatherium],
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
	},

	// create domains
	function(next) {
		async.each(domains, function(domain, next2) {
			var obj = new Domain({
				domain: domain[0],
				company: domain[1]
			});
			obj.save(next2);
		}, next);
	}
], function(err) {
	if (err) throw err;
	console.log('Installation erfolgreich abgeschlossen');
});