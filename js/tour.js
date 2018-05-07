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

function hideFooter (element) {
  element.style.display = 'none'
}

function showFooter (element) {
  element.style.display = 'inherit'
}

var lastNearestId
function setNearest (nearest) {
  // if (lastNearestId === nearest.id) {
    // return
  // }

  var zoom = map.getZoom()

  if (nearest.distance >= MAX_DISTANCE) {
    showFooter(document.getElementById('footer-too-far'))

    var nearestFooters = document.querySelectorAll('.footer-nearest')
    for (var index = 0; index < nearestFooters.length; index++) {
      hideFooter(nearestFooters[index])
    }
  } else {
    hideFooter(document.getElementById('footer-too-far'))

    var nearestFooters = document.querySelectorAll('.footer-nearest')
    for (var index = 0; index < nearestFooters.length; index++) {
      var id = nearestFooters[index].getAttribute('data-id')
      if (id === nearest.id && zoom >= 15) {
        showFooter(nearestFooters[index])
      } else {
        hideFooter(nearestFooters[index])
      }
    }
  }

  lastNearestId = nearest.id
}

function localStorageSet (data) {
  try {
    localStorage.setItem('data', JSON.stringify(data))
  } catch (err) {
    // console.error(err)
  }
}

function localStorageGet () {
  try {
    return JSON.parse(localStorage.getItem('data'))
  } catch (err) {
    // console.error(err)
  }
}

var routeStyle = {
  color: STYLE['secondary-color'],
  weight: 6,
  opacity: 0.65
}

var storedData = localStorageGet()
var storedPosition = storedData && storedData.position
var storedLocate = storedData && storedData.locate

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
  minZoom: 12,
  maxZoom: 20,
  maxNativeZoom: 19
}).addTo(map)

var locateControl = L.control.locate({
  drawCircle: false
}).addTo(map)

function mapUpdated () {
  var center = map.getCenter()
  var nearest = computeNearest(locations, center)
  setNearest(nearest)

  var storedData = {
    position: {
      zoom: map.getZoom(),
      center: center
    },
    locate: {
      active: locateControl._active,
      following: locateControl._isFollowing()
    }
  }

  localStorageSet(storedData)
}

map.on('moveend', mapUpdated)

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
    var img = '<img src="' + BASE_URL + '/images/locations/' + feature.properties.id + '.png" />'
    layer.bindPopup(img + createLink(feature.properties.url, feature.properties.title))
  }
}

var routeLayer = L.geoJSON(ROUTE_GEOJSON, {
  style: routeStyle,
  onEachFeature: onEachFeature,
  pointToLayer: function (feature, latlng) {
    return new L.Marker(latlng, {
      icon:	new L.NumberedDivIcon({
        number: feature.properties.order
      })
    })
}
}).addTo(map)

var overlayMaps = {
  'Route': routeLayer
}

document.getElementById('footer-show-route-button').addEventListener('click', function () {
  locateControl.stop()
  map.fitBounds(routeLayer.getBounds())
})

function createIcon (imageUrl, width, height) {
  return L.icon({
    iconUrl: BASE_URL + '/images/' + imageUrl,
    iconSize: [width, height],
    iconAnchor: [width / 2, height + 5]
  })
}

L.marker(ROUTE_START, {icon: createIcon('start.png', 50, 33)}).addTo(map)
L.marker(ROUTE_FINISH, {icon: createIcon('finish.png', 50, 30)}).addTo(map)

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

var storedLocate = storedData && storedData.locate

if (storedLocate && storedLocate.active) {
  locateControl.start()
}

mapUpdated()
