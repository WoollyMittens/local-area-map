// extend the class
Localmap.prototype.Route = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.elements = [];

	// METHODS

	this.start = function() {
		// load the route
		var routeXhr = new XMLHttpRequest();
		routeXhr.addEventListener('load', this.onRouteLoaded.bind(this));
		routeXhr.open('GET', this.config.routeUrl, true);
		routeXhr.send();
	};

	this.update = function() {
		console.log('route.update');
	};

	this.drawRoute = function() {
		// position every trackpoint in the route
		var routeData = this.config.routeData;
		var trackpoints = routeData.getElementsByTagName('trkpt');
		var trackpoint;
		for (var key in trackpoints) {
			if (!isNaN(key)) {
				trackpoint = document.createElement('span');
				trackpoint.setAttribute('class', 'localmap-trackpoint');
				trackpoint.style.left = (parseFloat(trackpoints[key].getAttribute('lon')) - this.config.minimum.lon) / (this.config.maximum.lon - this.config.minimum.lon) * 100 + '%';
				trackpoint.style.top = (parseFloat(trackpoints[key].getAttribute('lat')) - this.config.minimum.lat) / (this.config.maximum.lat - this.config.minimum.lat) * 100 + '%';
				this.parent.element.appendChild(trackpoint);
				this.elements.push(trackpoint);
			}
		}
	};

	// EVENTS

	this.onRouteLoaded = function(evt) {
		// decode the xml data
		this.config.routeData = evt.target.responseXML;
		// add the trackpoints from the route
		this.drawRoute();
	};

	this.start();

};
