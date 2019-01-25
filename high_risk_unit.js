var async = require("async");
var _ = require('lodash');
var moment = require("moment");

var mysql = require("../../models/v1/mysql_connect");
var high_risk = require("../../models/v1/high_risk");

exports.request = (req,res,next) => {
		if (!_.has(req.data, 'transaction.shipTo.unit')) return next();
		let address = _.at(req.data, 'transaction.shipTo.addressNormalShort')[0];
		let unit = _.at(req.data, 'transaction.shipTo.unit')[0];

		high_risk.findUnit(address,unit,(number) => {
			if(unit.length == 0) return next();
			let diff = moment() - moment(_.at(number[0], 'updated_at')[0]);
			let days = Math.floor(moment.duration(diff).asDays()) || 1;

			req.data['nofraud_high_risk_unit'] = {
				address: address,
				number: number,
				last_seen: days
			};
			return next();
		});
	}
}
