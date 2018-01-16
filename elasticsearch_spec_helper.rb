require 'rake'
require 'omniauth'
require 'elasticsearch/extensions/test/cluster/tasks'
require 'capybara/rspec'
require 'rails_helper'
require 'features/features_helper'

Dir[Rails.root.join("spec/support/**/*.rb")].sort.each { |f| require f }

  config.before :each, elasticsearch: true do
    Elasticsearch::Extensions::Test::Cluster.start(nodes: 3) unless Elasticsearch::Extensions::Test::Cluster.running?
  end

  config.after :suite do
    Elasticsearch::Extensions::Test::Cluster.stop if Elasticsearch::Extensions::Test::Cluster.running?
  end

  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

end
