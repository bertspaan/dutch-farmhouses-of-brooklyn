var ROUTE_GEOJSON = {% include route.geojson %}

var ROUTE_START = [
  {{ site.data.route.coordinates | first | last }},
  {{ site.data.route.coordinates | first | first }}
]

var ROUTE_END = [
  {{ site.data.route.coordinates | last | last }},
  {{ site.data.route.coordinates | last | first }}
]
