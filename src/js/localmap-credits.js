// extend the class
Localmap.prototype.Credits = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = null;

	// METHODS

	this.start = function() {
		this.element = document.createElement('figcaption');
		this.element.setAttribute('class', 'localmap-credits');
		this.element.innerHTML = this.config.creditsTemplate;
		this.config.container.appendChild(this.element);
	};

	this.update = function() {
		console.log('credits.update');
	};

	// EVENTS

	this.start();

};
