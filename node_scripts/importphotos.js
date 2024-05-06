// constants
var gm = require('gm');
var fs = require('fs');
var photos = '../photos/';
var thumbnails = '../thumbnails/';

// generates a resize queue
var generateQueue = function() {
  // get the folder list
  var queue = [],
    images = [],
    srcPath, dstPath,
    folders = fs.readdirSync(photos),
    isInvisible = new RegExp('^[.]'),
    isPhoto = new RegExp('.jpg$', 'i'),
    folder;
  // for every folder
  for (var a = 0, b = folders.length; a < b; a += 1) {
    // if this isn't a bogus file
    if (!isInvisible.test(folders[a])) {
      // construct the folder name
      folder = folders[a].split('.')[0];
      // create a folder for the thumbnails
      if (!fs.existsSync(thumbnails + folder)) {
        console.log('make', thumbnails + folder);
        fs.mkdirSync(thumbnails + folder);
      }
      // get the folder contents
      images = (fs.existsSync(photos + folder)) ? fs.readdirSync(photos + folder) : [];
      // for every image in the folder
      for (var c = 0, d = images.length; c < d; c += 1) {
        // if this isn't a bogus file
        if (isPhoto.test(images[c])) {
          // create the source path
          srcPath = photos + folder + '/' + images[c];
          // if the destination photo doesn't exist yet
          dstPath = (thumbnails + folder + '/' + images[c]).toLowerCase();
          if (!fs.existsSync(dstPath)) {
            // add the thumbnail to the queue
            queue.push({
              'srcPath': srcPath,
              'dstPath': dstPath,
              'width': 600,
              'height': 150,
              'quality': 0.6,
              'strip': true
            });
          }
        }
      }
    }
  }
	// truncate the queue for testing
	//queue.length = 3;
	// return the queue
  return queue;
};

// processes an original from the queue into a thumbnail and a full size
var makeImages = function(queue) {
  // if the queue is not empty
  if (queue.length > 0) {
    // pick the next item from the queue
    var item = queue.pop();
    // resize the image
    gm(item.srcPath)
      .resize(item.width, item.height)
      .autoOrient()
      .quality(parseInt(item.quality * 100))
      .strip()
      .write(item.dstPath, function(err) {
        if (err) { console.log(err); } else {
          // next iteration in the queue
          makeImages(queue);
        }
      });
    // report what was done
    console.log('generated:', item.dstPath);
  }
};

// start processing the queue
makeImages(generateQueue());
