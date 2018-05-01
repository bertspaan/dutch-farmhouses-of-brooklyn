var locations = ROUTE_GEOJSON.features
  .filter(function (feature) {
    return feature.properties.type === 'location'
  })
  .map(function (feature) {
    return Object.assign({}, feature.properties, {
      latLng: L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    })
  })

function createLink (url, text) {
  return '<a href="' +url + '">' + text + '</a>'
}

function computeNearest (locations, point) {
  var nearest = locations
    .map(function (location) {
      return Object.assign({}, location, {
        distance: point.distanceTo(location.latLng)
      })
    })
    .sort(function (a, b) {
      return a.distance - b.distance
    })[0]

  return nearest
}

var lastNearestId
function setNearest (nearest) {
  if (lastNearestId === nearest.id) {
    return
  }

  var footer = document.querySelector('footer')
  footer.innerHTML = createLink(nearest.url, nearest.title)

  lastNearestId = nearest.id
}

function localStorageSetPosition (zoom, center) {
  try {
    localStorage.setItem('mapPosition', JSON.stringify({
      zoom: zoom,
      center: center
    }))
  } catch (err) {
    console.error(err)
  }
}

function localStorageGetPosition () {
  try {
    var position = JSON.parse(localStorage.getItem('mapPosition'))
    return {
      zoom: position.zoom,
      center: L.latLng(position.center)
    }
  } catch (err) {
    console.error(err)
  }
}

var routeStyle = {
  color: '#ff7800',
  weight: 8,
  opacity: 0.65
}

var storedPosition = localStorageGetPosition()
var mapCenter = (storedPosition && storedPosition.center) || ROUTE_START
var mapZoom = (storedPosition && storedPosition.zoom) || 16

var map = L.map('map', {
  center: mapCenter,
  zoom: mapZoom,
  maxZoom: 20,
  attributionControl: false
})

var baseMapTileUrl = 'https://api.mapbox.com/styles/v1/nypllabs/cj2gmix25005o2rpapartqm07/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibnlwbGxhYnMiLCJhIjoiSFVmbFM0YyJ9.sl0CRaO71he1XMf_362FZQ'
var baseLayer = L.tileLayer(baseMapTileUrl, {
  attribution: '&copy; Mapbox, &copy; OpenStreetMap',
  maxZoom: 20,
  maxNativeZoom: 19
}).addTo(map)

var locateControl = L.control.locate({
  drawCircle: false
}).addTo(map)

map.on('moveend', function () {
  var center = map.getCenter()
  var nearest = computeNearest(locations, center)
  setNearest(nearest)
  localStorageSetPosition(map.getZoom(), center)
})

// function getTileUrl (mapId) {
//   return 'http://maps.nypl.org/warper/maps/tile/' + mapId + '/{z}/{x}/{y}.png'
// }

// var mapwarperMaps = [
//   {
//     title: 'Plate C - Farm Line Atlas, Vol. 5 (1880)',
//     mapId: 11859
//   },
//   {
//     title: 'Plate 6 - Maps of the City of Brooklyn (1855)',
//     mapId: 7238
//   },
//   {
//     title: 'Plate 15 - Maps of the City of Brooklyn (1855)',
//     mapId: 7247
//   },
//   {
//     title: 'Plate 7 - Maps of the City of Brooklyn (1855)',
//     mapId: 7239
//   },
//   {
//     title: 'Plate E - Farm Line Atlas, Vol. 5 (1880)',
//     mapId: 11861
//   },
//   {
//     title: 'Plate 31 - Brooklyn Atlas 66, Vol. 2 (1887)',
//     mapId: 19213
//   }
// ]

// var mapwarperLayersByTitle = {}
// var mapwarperLayers = mapwarperMaps.map(function (mapwarperMap, index) {
//   var layer = L.tileLayer(getTileUrl(mapwarperMap.mapId), {
//     maxZoom: 20,
//     maxNativeZoom: 19
//   })
//
//   if (index === 0) {
//     layer.addTo(map)
//   }
//
//   mapwarperLayersByTitle[mapwarperMap.title] = layer
//
//   return layer
// })

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.type === 'location') {
    layer.bindPopup(createLink(feature.properties.url, feature.properties.title))
  }
}

var routeLayer = L.geoJSON(ROUTE_GEOJSON, {
  style: routeStyle,
  onEachFeature: onEachFeature
}).addTo(map)

var overlayMaps = {
  'Walking tour route': routeLayer
}

function stopHet () {
  // stop de geolocate!
  // centreer kaart op alle geojson
}

// L.control.layers(mapwarperLayersByTitle, overlayMaps).addTo(map)

// var slider = document.getElementById('slider')
//
// function updateOpacity() {
//   var opacity = slider.value / 100
//   mapwarperLayers.forEach(function (layer) {
//     layer.setOpacity(opacity)
//   })
// }
//
// slider.addEventListener('input', updateOpacity)
// // In IE<=11, input event does not work
// slider.addEventListener('change', updateOpacity)
//
// updateOpacity()

// locateControl.start()

// locateControl._active
// locateControl._isFollowing()
