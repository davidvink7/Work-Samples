AtmlRecipeModel.batchInsert = function(values, callback){
   var query = "INSERT INTO `atml_recipe` (`name`, `url`, `brand_id`, `prefix`, `externalid`, `source`, `sourceid`, `created`, `edited`, `servings`) VALUES ?";

   sqldataadapter.executeQueryWithParams(query, [values], function(err) {
      if (err) {
         throw err;
      }
      query = "SELECT LAST_INSERT_ID()";
		
      sqldataadapter.executeQueryWithParams(query, [], function(err,result) {
         if (err) {
            throw err;
         }
         var firstRecipeId = result[0]['LAST_INSERT_ID()'];
         var recipeIds = _.range(firstRecipeId, firstRecipeId + values.length);
         callback(recipeIds);
      });
   });
};

AtmlRecipeModel.batchUpdate = function(fileName, callback){
   var queryForeignKeyChecksOff = 'SET foreign_key_checks = 0';

   var query = '\
                LOAD DATA LOCAL INFILE ' + mysql.escape(fileName) + '\
		REPLACE\
		INTO TABLE `atml_recipe`\
		FIELDS TERMINATED BY ","\
		ENCLOSED BY \'"\'\
		LINES TERMINATED BY \'\\n\'\
		IGNORE 1 ROWS';

   var queryForeignKeyChecksOn = 'SET foreign_key_checks = 1';
	
   sqldataadapter.createTransaction(function(err,transaction){
      if (err) {
         throw err;
      }
      transaction.executeQuery(queryForeignKeyChecksOff);
      transaction.executeQuery(query);
      transaction.executeQuery(queryForeignKeyChecksOn);
      transaction.finish(callback);
   });
};
