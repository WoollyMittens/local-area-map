// extend the class
Localmap.prototype.Legend = function (parent, onLegendClicked) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.onLegendClicked = onLegendClicked;
	this.elements = [];

	// METHODS

	this.start = function() {};

	this.update = function() {
    // write the legend if needed and available
    if (this.config.legend && this.elements.length === 0) this.elements = this.config.guideData.markers.map(this.addDefinition.bind(this));
  };

  this.addDefinition = function(markerData, index) {
    var definitionData = {};
    // if the marker has a description
    if (markerData.description) {
      // format the path to the external assets
      var guideData = this.config.guideData;
      var key = (guideData.assets) ? guideData.assets.prefix : guideData.gps;
      var image = (markerData.photo) ? this.config.assetsUrl + '/small/' + key + '/' + markerData.photo : this.config.markersUrl.replace('{type}', markerData.type);
      var text = markerData.description || markerData.type;
      // create a container for the elements
      var fragment = document.createDocumentFragment();
      // add the title
      definitionData.title = document.createElement('dt');
      definitionData.title.className += (markerData.photo) ? ' localmap-legend-photo' : ' localmap-legend-icon';
      definitionData.title.innerHTML = '<img alt="' + markerData.type + '" src="' + image + '"/>';
      definitionData.title.style.backgroundImage = 'url("' + image + '")';
      fragment.appendChild(definitionData.title);
      // add the description
      definitionData.description = document.createElement('dd');
      definitionData.description.className += (markerData.optional || markerData.detour || markerData.warning) ? ' localmap-legend-alternate' : '';
      definitionData.description.innerHTML = '<p>' + text + '</p>';
      fragment.appendChild(definitionData.description);
      // add the event handlers
      definitionData.title.addEventListener('click', this.onLegendClicked.bind(this, null, null, markerData.lon, markerData.lat));
      definitionData.description.addEventListener('click', this.onLegendClicked.bind(this, null, null, markerData.lon, markerData.lat));
      // add the container to the legend
      this.config.legend.appendChild(fragment);
    }
    // return the objects
    return definitionData;
  };

	// EVENTS

	this.start();

};
