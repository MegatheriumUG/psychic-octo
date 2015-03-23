var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var FondsTrade = new db.Schema({
	platform: {
		open: {type: ObjectId, ref: 'FondsPlatform', required: true},
		close: {type: ObjectId, ref: 'FondsPlatform', required: true}
	},
	fonds: {type: ObjectId, ref: 'Fonds', required: true},
	trader: {type: ObjectId, ref: 'User'},
	volume: {type: Number, required: true, min: 0},
	time: {
		open: {type: Date, required: true, default: Date.now},
		close: {type: Date, required: true, default: Date.now}
	},
	position: { // aus open- und close-positions ergeben sich die Einnahmen
		open: {type: Number, required: true, min: 0},
		expected: {type: Number, required: true, min: 0},
		close: {type: Number, required: true, min: 0, default: 0}
	},
	description: {type: String, default: ""},
	earnings: {type: Number, required: true, default: 0}, // der Gewinn ergibt sich aus den Einnahmen abzgl. der Gebühren
	duration: {type: Number, required: true, default: 0, min: 0} // die Dauer, die der gesamte Trade brauchte, in Minuten, exkl. der Zeit, die das Überweisen der Gelder auf die Ursprungsplattform verbraucht
});

module.exports = db.model('FondsTrade', FondsTrade);