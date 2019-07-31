// extend the class
Localmap.prototype.Background = function (parent, onComplete) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;
	this.image = null;
	this.tilesQueue = null;
	this.onComplete = onComplete;

	// METHODS

	this.start = function() {
		// create the canvas
		this.element = document.createElement('canvas');
		this.element.setAttribute('class', 'localmap-background');
		this.parent.element.appendChild(this.element);
		// load the map as tiles
		if (this.config.tilesUrl) { this.loadTiles(); }
		// or load the map as a bitmap
		else { this.loadBitmap(); }
		// catch window resizes
		window.addEventListener('resize', this.redraw.bind(this));
	};

  this.stop = function() {
    // remove the element
    this.parent.element.removeChild(this.element);
  };

	this.update = function() {};

	this.redraw = function() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// calculate the limits
		min.zoom = Math.max(container.offsetWidth / element.width * 2, container.offsetHeight / element.height * 2);
		max.zoom = 2;
	};

	this.loadBitmap = function() {
		var key = this.config.alias || this.config.key;
		// load the map as a bitmap
		this.image = new Image();
		this.image.addEventListener('load', this.onBitmapLoaded.bind(this));
		this.image.setAttribute('src', this.config.mapUrl.replace('{key}', key));
	};

	this.drawBitmap = function() {
		var container = this.config.container;
		var element = this.element;
		var image = this.image;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// use the bounds of subsets of walks
		var pixelsPerLon = image.naturalWidth / (max.lon - min.lon);
		var pixelsPerLat = image.naturalHeight / (max.lat - min.lat);
		var offsetWidth = (min.lon - min.lon_cover) * pixelsPerLon;
		var offsetHeight = (min.lat - min.lat_cover) * pixelsPerLat;
		var croppedWidth = (max.lon_cover - min.lon_cover) * pixelsPerLon;
		var croppedHeight = (max.lat_cover - min.lat_cover) * pixelsPerLat;
		var displayWidth = croppedWidth / 2;
		var displayHeight = croppedHeight / 2;
		// set the size of the canvas to the bitmap
		element.width = croppedWidth;
		element.height = croppedHeight;
		// double up the bitmap to retina size
		element.style.width = displayWidth + 'px';
		element.style.height = displayHeight + 'px';
		// paste the image into the canvas
		element.getContext('2d').drawImage(image, offsetWidth, offsetHeight);
		// redraw the component
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.loadTiles = function() {
		var container = this.config.container;
		var element = this.element;
		var min = this.config.minimum;
		var max = this.config.maximum;
		// Slippy map tilenames - https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#ECMAScript_.28JavaScript.2FActionScript.2C_etc..29
		var long2tile = function long2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
		var lat2tile = function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
		var tile2long = function tile2long(x,z) { return (x/Math.pow(2,z)*360-180); }
		var tile2lat = function tile2lat(y,z) { var n=Math.PI-2*Math.PI*y/Math.pow(2,z); return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))); }
		// calculate the cols and rows of tiles
		var minX = long2tile(min.lon_cover, this.config.tilesZoom);
		var minY = lat2tile(min.lat_cover, this.config.tilesZoom);
		var maxX = long2tile(max.lon_cover, this.config.tilesZoom);
		var maxY = lat2tile(max.lat_cover, this.config.tilesZoom);
		// calculate the size of the canvas
		var croppedWidth = Math.max(maxX - minX, 1) * 256;
		var croppedHeight = Math.max(maxY - minY, 1) * 256;
		var displayWidth = croppedWidth / 2;
		var displayHeight = croppedHeight / 2;
		// set the size of the canvas to the correct size
		element.width = croppedWidth;
		element.height = croppedHeight;
		// double up the bitmap to retina size
		element.style.width = displayWidth + 'px';
		element.style.height = displayHeight + 'px';
		// create a queue of tiles
		this.tilesQueue = [];
		for (var x = minX; x <= maxX; x += 1) {
			for (var y = minY; y <= maxY; y += 1) {
				this.tilesQueue.push({
					url: this.config.tilesUrl.replace('{x}', x).replace('{y}', y).replace('{z}', this.config.tilesZoom),
					x: x - minX,
					y: y - minY
				});
			}
		}
		this.tilesQueue.reverse();
		// load the first tile
		this.image = new Image();
		this.image.addEventListener('load', this.onTileLoaded.bind(this));
		this.image.addEventListener('error', this.onTileError.bind(this));
		this.image.setAttribute('src', this.tilesQueue[this.tilesQueue.length - 1].url);
		// redraw the component
		this.redraw();
		// resolve the promise
		onComplete();
	};

	this.drawTile = function(image) {
		var props = this.tilesQueue.pop();
		// draw the image onto the canvas
		if (image) this.element.getContext('2d').drawImage(image, props.x * 256, props.y * 256);
		// if there's more tiles in the queue
		if (this.tilesQueue.length > 0) {
			// load the next tile
			this.image.setAttribute('src', this.tilesQueue[this.tilesQueue.length - 1].url);
		}
	};

	// EVENTS

	this.onBitmapLoaded = function(evt) {
		// place the bitmap on the canvas
		this.drawBitmap();
	};

	this.onTileLoaded = function(evt) {
		// place the bitmap on the canvas
		this.drawTile(evt.target);
	};

	this.onTileError = function(evt) {
		this.drawTile(null);
	};

	this.start();

};
