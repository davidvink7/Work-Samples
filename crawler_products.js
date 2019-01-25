var https				= require('https');
var fs					= require('fs-extra');
var path				= require('path');
var iconv				= require('iconv-lite');
var _					= require('underscore')._;
var async				= require('async');
var Util				= require('../../../shared/core/util');
var IngredientParser			= require('../indexing/ingredient_parser');

const WEBSITE_HOSTNAME = 'boodschappen.dekamarkt.nl';
const CACHE_DIR = 'lib/crawling/cache/deka_products/';

function getCacheDir(){
   var cacheDir = CACHE_DIR + Util.formatDateISO(new Date()) + '/';
   //Remove old folders
   var oldCacheFolders = fs.readdirSync(CACHE_DIR).filter(function(file) {
      return fs.statSync(path.join(CACHE_DIR, file)).isDirectory();
   });
   oldCacheFolders = oldCacheFolders.sort().slice(0, -1);
   if (oldCacheFolders.length !== 0){
      _.each(oldCacheFolders, function(folder) {
         var fullFolderPath = path.join(CACHE_DIR, folder);
         console.info('Removing ' + fullFolderPath);
         fs.remove(fullFolderPath, function(){
            console.info('Removed old cache folder: ' + fullFolderPath);
         });
      });
   }
   if(!fs.existsSync(cacheDir)){
      fs.mkdirSync(cacheDir);
      console.info('Created new cache folder: ' + cacheDir);
   }
   return cacheDir;
}

function fetchWebUrl(requestPath, callback){
    
   var canonicalName = requestPath.replace(/[\\\/:*?"<>|]/g, '');
   canonicalName = canonicalName || 'root';
   
   if(fs.existsSync(getCacheDir() + canonicalName)){
      //Use cached version, prevent recursion by using setImmediate
      setImmediate(function(){
         callback(null, fs.readFileSync(getCacheDir() + canonicalName, { encoding: 'utf8' }));
      });
      return;
   }

   console.info(requestPath);

   //Fetch URL
   var request = https.request({
         method: 'get',
         hostname: WEBSITE_HOSTNAME,
         path: requestPath,
      }, function(res){
         if(res.statusCode === 301){
         console.log('statusCode 301');
         fetchWebUrl(res.headers.location, callback);
      } else {
         res.pipe(iconv.decodeStream('utf-8')).collect(function(err, result){
         fs.writeFileSync(getCacheDir() + canonicalName, result);
            callback(err, result);
         });
      }
   });
	
   request.on('error', function(e, f, g){
      callback(e);
   });
	
   request.end();
}

function getCategories(callback){
	
   console.log('Fetching categories...');
   var url = '';
   var categoryArray = [];

   fetchWebUrl(url, function(err, response){
   var $html = $(response);
   var webindelingArray = $html.find('#drsMenu').find('li').map(function(){ return $(this).attr('class').match(/\d+/g)[0]; }).toArray() ;
      _.each(webindelingArray, function(webindeling, index){
         var categoryObject = {};
         categoryObject.class = webindeling;
         categoryObject['data-afdeling-id'] = $html.find('#drsMenu').find('li').eq(index).attr('data-afdeling-id');
         categoryObject.category = $html.find('#drsMenu').find('a').eq(index).attr('href');
         categoryArray.push(categoryObject);
      });
      callback(null, categoryArray);    
   });
}

function getSubCategories(categoryArray, callback){
   async.each(categoryArray, function(categoryObject, callback){
      var url = '/misc/specific/menu.aspx?afdelingCatID=' + categoryObject['class'] + '&wadID=' + categoryObject['data-afdeling-id'];
      fetchWebUrl(url, function(err, response){
      var $html = $(response);
      var subCategories = $html.find('#submenu').find('a[data-webhoofdgroep]').map(function(){ return $(this).attr('href').replace('https://boodschappen.dekamarkt.nl//',''); }).toArray();
      categoryObject.subCategories = subCategories;
         callback(err);
      });
   }, function(err){
      callback(err, categoryArray);
   });
}

function getProductsForCategories(categories, callback){
   async.map(categories, function(categoryObject, callback){
      getProductsForSubCategories(categoryObject, function(err, products){
         if(err){
            throw new Error(err);
         }
			
      callback(null, products);
      });
   }, function(err, products){
      callback(err, _.flatten(products));
   });
}

function getProductsForSubCategories(categoryObject, callback){
   async.map(categoryObject.subCategories, function(subCategory, callback){
		
      var products = [];
      var n = 1;
      var foundProductsForCategory = 0;
		
      async.doWhilst(function(callback){
			
         var url = '/' + categoryObject.category + '/' + subCategory + '?filters=%5B%5D&page=' + n.toString();
			
         fetchWebUrl(url, function(err, response){
            var $html = $(response);
            var ids = $html.find('.artikel').map(function(){ return $(this).attr('data-artikel'); }).toArray();
            var titles = $html.find('.toDetail').map(function(){ return $(this).find('span.title').text().split('\n')[1].trim(); }).toArray();
            var weights = $html.find('.toDetail').map(function(){ return $(this).find('span.title').text().split('\n')[2].trim(); }).toArray();
            var imagePaths = $html.find('span.image').map(function(){ return $(this).attr('data-original'); }).toArray();
            var prices = $html.find('.toDetail').map(function(){ return $(this).find('span.price').text().trim(); }).toArray();
				
            var productsForCategory = _.map(ids, function(id, index){
					
               var grams = IngredientParser.parseGramAmount(weights[index]);
               var pieces = null;
               if(!grams){
                  pieces = IngredientParser.parsePiecesAmount(weights[index]);
               }
					
               return {
                  retailerId: 'deka',
                  id: id,
                  name: titles[index],
                  image: 'https://' + WEBSITE_HOSTNAME + imagePaths[index],
                  quantity: weights[index],
                  isAvailable: '1',
                  isRetired: false,
                  taxonomy: [categoryObject.category, subCategory],
                  deepestTaxonomy: subCategory,
                  quantityOptions: [
                     {
                        unit: 'pieces',
                        defaultAmount: 1,
                        minimumAmount: 1,
                        maximumAmount: 999,
                        amountStep: 1,
                        price: prices[index],
                        grams: grams,
                        pieces: pieces
                     }
                  ]
               };
            });
            foundProductsForCategory = productsForCategory.length;
            products = products.concat(productsForCategory);
            n++;
            callback(err, productsForCategory);
         });
      },function(){
         return foundProductsForCategory > 0;
      }, function(err){
         callback(err, products);
      });
   }, callback);
}

function getProducts(existingProductIds, callback){
    
   async.waterfall([
      function (callback){
         getCategories(callback);
      },
      function (categories, callback){
         getSubCategories(categories, callback);
      },
      function (categories, callback){
         getProductsForCategories(categories, callback);
      }
   ], function(err, result){
      if (err){
         throw new Error(err);
      }
      console.log(result.length);
      callback(err, result);
   });

}

exports.getCacheDir = getCacheDir;
exports.getProducts = getProducts;
