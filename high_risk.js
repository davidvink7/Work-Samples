var async = require("async");
var mysql = require("./mysql_connect");

exports.findUnit = (address,number,next) => {
	async.waterfall([
		(next) => {
			mysql.connect_read(next);
		},
		(connection,next) => {
			var query = "SELECT * FROM high_risk_units WHERE address = ? AND number = ? ORDER BY id DESC LIMIT 1";
  		connection.query(query,[address,number],(err,rows) => {
  			connection.destroy();
				if(err) return next(err);
				next(rows);
  		});
	}],next);
};
