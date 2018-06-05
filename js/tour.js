var locations = ROUTE_GEOJSON.features
  .filter(function (feature) {
    return feature.properties.type === 'location'
  })
  .map(function (feature) {
    return Object.assign({}, feature.properties, {
      latLng: L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0])
    })
  })

function createPopupLink (url, text) {
  return '<a class="button" href="' + url + '">' + text + '</a>'
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
  var zoom = map.getZoom()

  if (nearest.distance >= PARAMETERS.max_distance) {
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
  color: STYLE['secondary_color'],
  weight: 6,
  opacity: 0.7,
  dashArray: '10, 10',
  lineCap: 'square'
}

var storedData = localStorageGet()
var storedPosition = storedData && storedData.position
var storedLocate = storedData && storedData.locate

var mapCenter = (storedPosition && storedPosition.center) || ROUTE_START
var mapZoom = (storedPosition && storedPosition.zoom) || 16

var map = L.map('map', {
  center: mapCenter,
  zoom: mapZoom,
  maxZoom: 19,
  attributionControl: false
})

var baseMapTileUrl = PARAMETERS.map.tileUrl
var baseLayer = L.tileLayer(baseMapTileUrl, {
  attribution: PARAMETERS.map.attribution,
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

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.type === 'location') {
    var img = '<img src="' + BASE_URL + '/images/locations/' + feature.properties.id + '.png" />'
    layer.bindPopup(img + createPopupLink(feature.properties.url, feature.properties.title))
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

document.getElementById('footer-show-route-button').addEventListener('click', function () {
  locateControl.stop()
  map.fitBounds(routeLayer.getBounds())
})

function createIcon (imageUrl, width, height) {
  return L.icon({
    iconUrl: BASE_URL + '/images/' + imageUrl,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2]
  })
}

L.marker(ROUTE_START, {icon: createIcon('start.png', 50, 50)}).addTo(map)
L.marker(ROUTE_FINISH, {icon: createIcon('finish.png', 50, 50)}).addTo(map)

var storedLocate = storedData && storedData.locate

if (storedLocate && storedLocate.active) {
  locateControl.start()
}

mapUpdated()
