// extend the class
Localmap.prototype.Location = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = new Image();
	this.zoom = null;
	this.active = false;
	this.options = {
		enableHighAccuracy: true
	};

	// METHODS

	this.start = function() {
		if ("geolocation" in navigator) {
			// display a button to activate geolocation
			this.permissions = document.createElement('nav');
			this.permissions.setAttribute('class', 'localmap-permissions');
			this.button = document.createElement('button');
			this.button.setAttribute('title', 'Allow geolocation');
			this.button.innerHTML = 'Allow geolocation';
			this.button.setAttribute('class', 'localmap-permissions-location');
			this.permissions.appendChild(this.button);
			this.config.container.appendChild(this.permissions);
			// activate geolocation upon interaction
			this.button.addEventListener('click', this.requestPosition.bind(this));
			this.config.container.addEventListener('mouseup', this.requestPosition.bind(this));
			this.config.container.addEventListener('touchend', this.requestPosition.bind(this));
			// try activating geolocation automatically
			this.requestPosition();
		}
	};

  this.stop = function() {
    // remove the element
    this.config.container.removeChild(this.permissions);
  };

	this.update = function() {
		// only resize if the zoom has changed
		if (this.zoom !== this.config.position.zoom) this.resize();
		// store the current zoom level
		this.zoom = this.config.position.zoom;
	};

	this.resize = function() {
		// resize the marker according to scale
		var scale = 1 / this.config.position.zoom;
		this.element.style.transform = 'scale3d(' + scale + ', ' + scale + ', 1)';
	};

	this.requestPosition = function() {
		if (!this.active) {
			// request location updates
			this.locator = navigator.geolocation.watchPosition(
				this.onReposition.bind(this),
				this.onPositionFailed.bind(this),
				this.options
			);
			// create the indicator
			this.element.setAttribute('src', this.config.markersUrl.replace('{type}', 'location'));
			this.element.setAttribute('alt', '');
			this.element.setAttribute('class', 'localmap-location');
			this.parent.element.appendChild(this.element);
			// hide the button
			this.button.style.display = 'none';
		}
	};

	// EVENTS

	this.onReposition = function(position) {
		var min = this.config.minimum;
		var max = this.config.maximum;
		var lon = position.coords.longitude;
		var lat = position.coords.latitude;
		// if the location is within bounds
		if (lon > min.lon_cover && lon < max.lon_cover && lat < min.lat_cover && lat > max.lat_cover) {
			// display the marker
			this.element.style.display = 'block';
			this.element.style.left = ((lon - min.lon_cover) / (max.lon_cover - min.lon_cover) * 100) + '%';
			this.element.style.top = ((lat - min.lat_cover) / (max.lat_cover - min.lat_cover) * 100) + '%';
		// otherwise
		} else {
			// hide the marker
			this.element.style.display = 'none';
		}
	};

	this.onPositionFailed = function(error) {
		console.log('requestPosition:', error);
	};

	this.start();

};
