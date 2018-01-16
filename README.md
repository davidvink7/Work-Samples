### Code Samples

[dynamic_maps.js.coffee](https://github.com/davidvink7/work-samples/blob/master/dynamic_maps.js.coffee)

Dynamic Maps from Google which import geolocations including polylines. While hovering over a location an infoWindow pops open with information.

[async_model_transactions.js](https://github.com/davidvink7/work-samples/blob/master/async_model_transactions.js)

This file shows a transaction applied in MySQL using the async utility module with the 'series' function. The callback returns an array of objects on completion.

[batch_insert_and_update.js](https://github.com/davidvink7/work-samples/blob/master/batch_insert_and_update.js)

Instead of updating every field one by one, a faster way is to update in batches. To do this for 1000s of instances in a second as opposed to several minutes LOAD DATA LOCAL INFILE works most efficient.

[bias_eraser.rb](https://github.com/davidvink7/work-samples/blob/master/location_bias_eraser.rb)

Each buyer has banners in locations with latitude/longitudes dependent on prospects' areas. Sometimes Yahoo API gives back a false response for a city in a different country. The method scans all locations of prospects and creates a boundary box based on standard deviations.

[brands_controller_spec.rb](https://github.com/davidvink7/work-samples/blob/master/brands_controller_spec.rb)

With Test Driven Development first a Rspec file is made before writing a controller in this case. It tests the RESTful routes, i.e. index, create, edit, update and destroy.

[crawler_products.js](https://github.com/davidvink7/work-samples/blob/master/crawler_products.js)

Web crawler using async.waterfall to asynchronously call multiple functions, then iterate through the fetched data after it has been cached.

[elasticsearch_spec_helper.rb](https://github.com/davidvink7/work-samples/blob/master/elasticsearch_spec_helper.rb)

To run the test suite and test instances of models being called, a configuration spec helper for ElasticSearch is set up.
