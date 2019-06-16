// extend the class
Localmap.prototype.Modal = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;

	// METHODS

	this.start = function() {
		// create the modal
		this.element = document.createElement('section');
		this.element.setAttribute('class', 'localmap-modal localmap-modal-hidden');
		// add the photo
		this.photo = document.createElement('figure');
		this.photo.setAttribute('class', 'localmap-modal-photo');
		this.element.appendChild(this.photo);
		// add the content area
		this.description = document.createElement('article');
		this.description.setAttribute('class', 'localmap-modal-content');
		this.element.appendChild(this.description);
		// add a close button
		this.closer = document.createElement('button');
		this.closer.setAttribute('class', 'localmap-modal-closer');
		this.closer.innerHTML = 'Close';
		this.closer.addEventListener('click', this.onDismiss.bind(this));
		this.element.appendChild(this.closer);
		// insert the modal
		this.config.container.appendChild(this.element);
	};

	this.update = function() {};

	this.show = function(markerData) {

// TODO: if there is no photo use the icon but as an aside

		// display the photo if available
		if (markerData.photo) {
			this.photo.style.display = null;
			this.photo.style.backgroundImage = 'url(' + this.config.assetsUrl + 'medium/' + this.config.guideData.gps + '/' + markerData.photo + ')';
		} else {
			this.photo.style.display = 'none';
		}
		// display the content if available
		if (markerData.description) {
			this.description.innerHTML = (markerData.photo) ? '' : '<img class="localmap-modal-icon" src="' + this.config.markersUrl.replace('{type}', markerData.type) + '" alt=""/>';
			this.description.innerHTML += '<p>' + markerData.description + '</p>';
		} else {
			return false;
		}
		// show the modal
		this.element.className = this.element.className.replace(/-hidden/g, '-visible');
	};

	// EVENTS

	this.onDismiss = function(evt) {
		evt.preventDefault();
		// hide the modal
		this.element.className = this.element.className.replace(/-visible/g, '-hidden');
	};

	this.start();

};
