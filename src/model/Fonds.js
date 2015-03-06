var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Fonds = new db.Schema({
	name: {type: String, required: true, unique: true},
	description: {type: String},
	platforms: [{type: ObjectId, ref: 'FondsPlatform', default: []}],
	customers: [{type: ObjectId, ref: 'FondsCustomer', default: []}]
});

module.exports = db.model('Fonds', Fonds);