var async = require("async");
var moment = require("moment");
var _ = require("lodash");

var mysql = require("./db_mysql");
var unit_db = require('./db_mysql').unit;
var normalize = require('./normalize.js');

const is_test = (process.env.NODE_ENV != "production");
let unit_processing = false;

exports.onTick = () => {
   if(unit_processing){
      console.log("High Risk Unit BackFiller Job already running.");
      return;
   }
   console.log("High Risk Unit BackFiller Operation Started at "+moment().format("YYYY-MM-DD HH:mm:ss.SSS"));
   unit_processing = true;
   let offset = 0;
   async.doWhilst(
      (nextBatch) => {
         let t1 = new Date();
         let count = 0;
         async.waterfall([
            (next) => {
               unit_db.start((err,db) => next(err,db));
            },
            (db,next) => {
               unit_db.get(db,offset,(err,data) => {
                  if(err){ unit_db.rollback(db); }
                  next(err,db,data);
               });
            },
	    (db,data,next) => {
               unit_db.get_normalizations((err,normSet) => {
                  let wordbank = JSON.parse(normSet[0].wordbank);
                  wordbank = _.at(wordbank,'sets')[0];
                  next(err,db,data,wordbank);
               });
            },
            (db,data,wordbank,next) => {
            // console.log(wordbank);
            // console.log(data);
            count = data.length;
            async.eachSeries(data,(row,eNext) => {
               let shipping_address = row.shipping_address;
               let shipping_zip = row.shipping_zip;
               let url = row.url;
               let score = row.score;
               let status = row.status;

               shipping_address = shipping_address.replace(/[^\w\s!#]/gi, ' ').replace(/ +(?= )/g,'').toLowerCase();
               if (shipping_address)
                  let shipping_address_norm = shipping_address.replace(/([0-9]+)(?=[th|nd|st|rd])/ig, '$1 1');

               wordbank.forEach((word) => {
                  abbreviations = _.map(word.abbreviations, function(abbr){ return '\\s' + abbr; });
                  let regex = new RegExp(abbreviations.join("|"), "ig");

                  if(shipping_address_norm)
                     shipping_address_norm = shipping_address_norm.replace(regex,' ' + word.original_term);
               });

               if(shipping_address_norm){
                  shipping_address_norm = shipping_address_norm.replace(/[^\w\s!#]/gi, ' ').replace(/ +(?= )/g,'');
                  shipping_address_norm = normalize.address({"address": shipping_address_norm,"zip": shipping_zip});
                  let unit = normalize.findUnit(shipping_address);
               }

               if (_.isEmpty(unit)) return eNext();
               if (!_.isEmpty(score) && score < 0) return eNext();

               unit_db.insert(db,shipping_address_norm,unit,(err) => eNext(err));
            },(err) => {
               if(err){
                  unit_db.rollback(db,(err2) => next(err));
               }
               unit_db.commit(db,(err) => next(err));
              });
            }],(err) => {
               if(err) { console.error(err); }
               offset += 1000;
               console.log("High Risk BackFiller count:",offset,"-",(new Date()-t1)/1000,"sec");
               return nextBatch(err);
            });
	},
	(count) => {
		if(count == 1000) return true;
		return false;
	},
	(err) => {
            console.log("High Risk BackFiller JOB COMPLETE");
            if(err) console.error(err);
            unit_processing = false;
	}
   );
};
