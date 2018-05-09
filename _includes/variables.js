var BASE_URL = {{ site.baseurl | jsonify }}

var ROUTE_GEOJSON = {% include route.geojson %}

var ROUTE_START = [
  {{ site.data.route.features[0].geometry.coordinates | first | last }},
  {{ site.data.route.features[0].geometry.coordinates | first | first }}
]

var ROUTE_FINISH = [
  {{ site.data.route.features[0].geometry.coordinates | last | last }},
  {{ site.data.route.features[0].geometry.coordinates | last | first }}
]

var MAX_DISTANCE = {{ site.parameters.max_distance }}

var STYLE = {{ site.style | jsonify }}
