var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var FondsCustomer = new db.Schema({
	user: {type: ObjectId, ref: 'User'},
	name: {type: String, required: true},
	deposit: {
		initial: {type: Number, required: true, min: 0},
		max: {type: Number, required: true, min: 0},
		current: {type: Number, required: true, min: 0}
	},
	reserve: {type: Number, required: true, min: 0, default: 0}
});

module.exports = db.model('FondsCustomer', FondsCustomer);