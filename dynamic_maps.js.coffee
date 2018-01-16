markers = []
positions = []
map = undefined
locationsArray = []
bounds = undefined
infoWindow = new (google.maps.InfoWindow)

initMap = ->
 
  locationsArray = $('#new-map-canvas').data('locations-array')
  lat = locationsArray[0][1][0]
  lng = locationsArray[0][1][1]
  lat = parseFloat(parseFloat(lat).toFixed(3))
  lng = parseFloat(parseFloat(lng).toFixed(3))
  center = new (google.maps.LatLng)(lat,lng)
  bounds = new (google.maps.LatLngBounds)
  
  mapOptions =
    zoom: 4
    center: center
    maxZoom: 12
  map = new (google.maps.Map)(document.getElementById('new-map-canvas'), mapOptions)

  addMarkers()

  if locationsArray.length != 1
    map.fitBounds bounds

addMarkers = ->
  
  i = 0
  
  while i < locationsArray.length
    if locationsArray[i][1][0] != null
      lat = locationsArray[i][1][0]
      lng = locationsArray[i][1][1]
      positions[i] =
        lat: parseFloat(parseFloat(lat).toFixed(3))
        lng: parseFloat(parseFloat(lng).toFixed(3))
      timeout = i * 200
      addTimeOut positions[i],i,timeout
      bounds.extend new (google.maps.LatLng)(positions[i].lat,positions[i].lng)
    i++
  try
    google.maps.event.addDomListener window, 'load', initMap
  catch e
  
  polyLines()

addTimeOut = (position,index,timeout)->
  
  window.setTimeout (->
    
    markers[index] = new (google.maps.Marker)(
      position: position
      map: map
      draggable: false
      clickable : true
      icon: "http://icons.iconarchive.com/icons/icons-land/vista-map-markers/32/Map-Marker-Ball-Pink-icon.png"
      animation: google.maps.Animation.DROP)
    
    addFields(index)
    
    return
  
  ), timeout

  return

addFields = (i)->
  
  marker = markers[i]
  google.maps.event.addListener marker, 'mouseover', do (marker, i) ->
    
    ->
      if locationsArray[i][2] != null
        photo = locationsArray[i][2]
      else
        photo = "https://upload.wikimedia.org/wikipedia/commons/7/71/Sky_August_2010-1a.jpg"
      
      city = locationsArray[i][0]
      day = locationsArray[i][3] + 1
      infoWindow.setContent '<div style="float:left;">' + '<img src=' + photo 
                            + ' style="margin:10px 0 10px 5px;width:80px;height:80px;"></div>' 
                            + '<div style="max-width:300px;float:right;margin-left:15px;"><h4>' 
                            + city + '</h4>' + '<p><span style=\'font-weight:bold;\'>Day: '
                            + day + '</span></p>' + '</div>'
      
      infoWindow.open map, marker

polyLines = ->

  positions = positions.filter((n) ->
    n != undefined
  )

  lineSymbol =
    path: 'M 0,-1 0,1'
    strokeOpacity: 1
    scale: 4
    strokeColor: '#317991'

  polylines = new (google.maps.Polyline)(
    path: positions
    icons: [{
      icon: lineSymbol
      offset: '0'
      repeat: '20px'
    }]
    strokeOpacity: 0
    strokeWeight: 2)
  
  polylines.setMap map
  
  return

$(document).ready ->
  $('li.mapTab').on 'shown.bs.tab', (e) ->
    initMap()
    return
