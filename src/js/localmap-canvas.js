// extend the class
Localmap.prototype.Canvas = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = document.createElement('div');
	this.config.canvasElement = this.element;

	// METHODS

	this.start = function() {
		// create a canvas
		this.element.setAttribute('class', 'localmap-canvas');
		this.element.addEventListener('transitionend', this.onUpdated.bind(this));
		// add the canvas to the parent container
		this.config.container.appendChild(this.element);
	};

	this.update = function() {
		console.log('canvas.update');
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		var pos = this.config.position;
		// convert the lon,lat to x,y
		var centerX = (pos.lon - min.lon) / (max.lon - min.lon) * element.offsetWidth;
		var centerY = (pos.lat - min.lat) / (max.lat - min.lat) * element.offsetHeight;
		// limit the zoom
		var zoom = Math.max(Math.min(pos.zoom, max.zoom), min.zoom);
		// convert the center into an offset
		var offsetX = -centerX * zoom + container.offsetWidth / 2;
		var offsetY = -centerY * zoom + container.offsetHeight / 2;
		// apply the limits
		offsetX = Math.max(Math.min(offsetX, 0), container.offsetWidth - element.offsetWidth * zoom * 0.99);
		offsetY = Math.max(Math.min(offsetY, 0), container.offsetHeight - element.offsetHeight * zoom * 0.99);
		// position the background
		element.style.transition = 'transform ease 300ms';
		element.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + zoom + ')';
		// update all sub-components
    for (var key in this.components)
      if (this.components[key].update)
        this.components[key].update(this.config);
	};

	// CLASSES

  this.components = {
		background: new parent.Background(this, onComplete),
		markers: new parent.Markers(this),
		route: new parent.Route(this),
		location: new parent.Location(this)
  };

	// EVENTS

	this.onUpdated = function (evt) {
		// remove the transition
		this.element.style.transition = null;
	};

	this.start();

};
