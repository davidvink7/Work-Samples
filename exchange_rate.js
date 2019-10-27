const _ = require("lodash");
const mysql = require("mysql2");
const mysql_connect = require("./mysql_connect");
const utils = require("../../routes/v1/utils.js");
const is_test = (process.env.NODE_ENV != "production");

exports.getExchangeRate = async (code, callback) => {
    let eur_code = utils.eu_country_codes(code);
    if (!_.isUndefined(eur_code)) code = eur_code;
    let query = "SELECT rate, symbol FROM exchange_rates WHERE symbol = ? OR country = ?";
    let sql = mysql.format(query,[code,code]);

    try {
        let results = await mysql_connect.do_query(mysql_connect.promise.read,sql);
        if(_.isFunction(callback)) return callback(null,results);
        else return results;
    } catch (err) {
        if(_.isFunction(callback)) return callback(err);
        else throw err;
    }
};
