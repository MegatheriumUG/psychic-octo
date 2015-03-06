var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var FondsFee = new db.Schema({
	fonds: {type: ObjectId, ref: 'Fonds', required: true},
	trade: {type: ObjectId, ref: 'FondsTrade'},
	user: {type: ObjectId, ref: 'User'},
	date: {type: Date, default: Date.now, required: true},
	title: {type: String, required: true},
	description: {type: String},
	amount: {type: Number, required: true, min: 0}
});

module.exports = db.model('FondsFee', FondsFee);