def bias_eraser(banner) 

  items = banner.prospects

  unless items.blank?

  lat = items.pluck(:latitude).map{|e| unless e.nil? then e.to_f end }

  unless lat.compact.blank?
    sum = lat.compact.inject(0){|a, i| a + i }
    mean = sum/lat.compact.length.to_f
    sum_var = lat.compact.inject(0){|a, i| a +(i-mean)**2 }
    var = sum_var/(lat.compact.length - 1).to_f
    st_dev =  Math.sqrt(var)
    b1 = mean + (st_dev * 2)
    b2 = mean - (st_dev * 2)
    ii = lat.map.with_index{|e,i| unless e.nil? then e > b1 || e < b2 || (e - mean).abs > 30 ? i : nil end }.compact
    ii.each{|i| items[i].latitude = nil } unless ii.blank?
    ii.each{|i| items[i].longitude = nil } unless ii.blank?
    items.map{|item| item.save }
  end

  lng = items.pluck(:longitude).map{|e| unless e.nil? then e.to_f end }

  unless lng.compact.blank?
    sum = lng.compact.inject(0){|a, i| a + i }
    mean = sum/lng.compact.length.to_f
    sum_var = lng.compact.inject(0){|a, i| a +(i-mean)**2 }
    var = sum_var/(lng.compact.length - 1).to_f
    st_dev =  Math.sqrt(var)
    b1 = mean + (st_dev * 2)
    b2 = mean - (st_dev * 2)
    ii = lng.map.with_index{|e,i| unless e.nil? then e > b1 || e < b2 || (e - mean).abs > 20 ? i : nil end }.compact
    ii.each{|i| items[i].latitude = nil } unless ii.blank?
    ii.each{|i| items[i].longitude = nil } unless ii.blank?
    items.map{|item| item.save }
  end

end
