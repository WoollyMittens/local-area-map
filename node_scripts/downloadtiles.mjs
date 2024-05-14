import fs from 'fs';
import fsp from 'fs/promises';
import fetch from 'node-fetch';
import { long2tile, lat2tile, tile2long, tile2lat } from "../lib/slippy.mjs";
const tilePath = '../tiles/{z}/{x}/';
const tileLocal = '../tiles/{z}/{x}/{y}.png';
const tileRemote = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileMissing = '../inc/img/missing.png';
const guidePath = '../data/guide.json';
const mapZoom = 15;

// check if a file exists
async function checkExists(path) {
  let exists;
  // attempt to retrieve state on the given file
  try { const stats = await fsp.stat(path); exists = stats; } 
  catch (error) { exists = null; }
  // return the result
  return exists;
}

// import a list of files in a directory
async function filterDirectory(path, include, exclude) {
	// default filters
	include = include || /.*/;
	exclude = exclude || /$^/;
	// read the folder listing
	const files = await fsp.readdir(path);
	// return only the filtered results
	return files.filter(file => (include.test(file) && !exclude.test(file)));
}

// downloads a file to a local path
function downloadFile(source, destination) {
  return new Promise((resolve, reject) => {
    fetch(source).then(response => {
      if (response.status !== 200) { resolve(null); }
      else {
        const stream = fs.createWriteStream(destination);
        stream.on('error', (error) => { reject(null); });
        stream.on('close', () => { resolve(destination); });
        response.body.pipe(stream);
      }
    }).catch(error => { resolve(null); });
  });
}

function generateQueue(guideData) {
  // get the file list
  const queue = [];
  // convert the bounds to tiles
  let minY = lat2tile(guideData.bounds.north, mapZoom) - 1;
  let maxX = long2tile(guideData.bounds.east, mapZoom) + 1;
  let maxY = lat2tile(guideData.bounds.south, mapZoom) + 1;
  let minX = long2tile(guideData.bounds.west, mapZoom) - 1;
  // create a list of tiles within the map bounds
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      queue.push({
        path: tilePath.replace('{x}', x).replace('{y}', y).replace('{z}', mapZoom),
        local: tileLocal.replace('{x}', x).replace('{y}', y).replace('{z}', mapZoom),
        remote: tileRemote.replace('{x}', x).replace('{y}', y).replace('{z}', mapZoom),
        x: x - minX,
        y: y - minY
      });
    }
  }
	// return the queue
  return queue.reverse();
}

async function importTiles() {
  // load the guide cache
  let guideFile = await fsp.readFile(guidePath);
  let guideData = JSON.parse(guideFile);
  // generate a tiles wish list
  const tileQueue = generateQueue(guideData);
  // for every item in the queue
  for (let tile of tileQueue) {
    // if the tile doesn't exist locally yet
    let exists = await checkExists(tile.local);
    if (!exists) {
      // create the path
      await fsp.mkdir(tile.path, {recursive: true});
      // download the tile
      let result = await downloadFile(tile.remote, tile.local);
      console.log('downloaded:', tile.remote, result);
      // or substitute the placeholder
      if (!result) await fsp.copyFile(tileMissing, tile.local);
    } else {
      console.log('cached:', tile.local);
    }
  }
}

importTiles();
