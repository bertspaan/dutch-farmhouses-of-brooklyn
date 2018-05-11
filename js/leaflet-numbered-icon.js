---
---

// From: https://gist.github.com/comp615/2288108

L.NumberedDivIcon = L.Icon.extend({
	options: {
    iconUrl: '{{ site.baseurl }}/images/marker.svg',
    number: '',
    shadowUrl: null,
    iconSize: new L.Point(30, 30),
		iconAnchor: new L.Point(15, 15),
		popupAnchor: new L.Point(0, -18),
		className: 'leaflet-div-icon'
	},

	createIcon: function () {
		var div = document.createElement('div')
		var img = this._createImg(this.options['iconUrl'])
		var numdiv = document.createElement('div')
		numdiv.setAttribute ('class', 'number')
		numdiv.innerHTML = this.options['number'] || ''
		div.appendChild(img)
		div.appendChild(numdiv)
		this._setIconStyles(div, 'icon')
		return div;
	},

	//you could change this to add a shadow like in the normal marker if you really wanted
	createShadow: function () {
		return null
	}
})
