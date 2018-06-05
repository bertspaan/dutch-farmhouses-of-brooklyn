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

var PARAMETERS = {{ site.parameters | jsonify }}
var STYLE = {{ site.style | jsonify }}
