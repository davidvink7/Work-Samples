AtmlRecipeModel.findRecipesPaged = function(page, pageSize, callback){
		
   sqldataadapter.createTransaction(function(err, transaction){
      if(err){
         callback(err);
         return;
      }
		
      async.series({
         rows: function(callback){
            var query = 'SELECT * FROM `atml_recipe` LIMIT ' + (pageSize * (page - 1)) + ', ' + pageSize;
            transaction.executeQuery(query, callback);
			},
         rowCount: function(callback){
            query = 'SELECT COUNT(*) AS totalRecords FROM atml_recipe';
            transaction.executeQuery(query, callback);
         }
      }, function(err, results){
            transaction.finish();
            if(err){
               callback(err);
            return;
            } else {
               var resultMap = {
               recipes: results.rows,
               recordCount: results.rowCount[0]['totalRecords'],
               page: page,
               pageCount: Math.ceil(results.rowCount[0]['totalRecords'] / pageSize)
            }
            callback(resultMap);
            return;
         }
      });
		
   });
		
};
