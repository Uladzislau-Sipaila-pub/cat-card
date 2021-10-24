const { writeFile } = require('fs').promises;
const { join } = require('path');
const { promisify } = require('util');

const axios = require('axios');
const blend = require('@mapbox/blend');

const blendPromise = promisify(blend);

const {
  greeting = 'Hello',
  who = 'You',
  width = 400,
  height = 500,
  color = 'Pink',
  size = 100,
} = require('minimist')(process.argv.slice(2));

/**
 * Fetches image of a cat
 * @param {string} message - message to be added to the image  
 */
async function fetchImage(message) {
  const response = await axios({
    url: `https://cataas.com/cat/says/${message}?width=${width}&height=${height}&color${color}&s=${size}`,
    responseType: 'arraybuffer'
  });

  console.log('Received response with status:', response.status);

  return response.data;
}

/**
 * Binds all images together into one image
 * @param {Buffer[]} images - images to be bind
 */
function bindImages(images) {
  const configurations = images.map((image, index) => ({
    buffer: image,
    x: width * index,
    y: 0
  }));

  return blendPromise(configurations, {
    width: width * images.length,
    height: height,
    format: 'jpeg',
  });
}

/**
 * Saves the image as a file
 * @param {Buffer} image - image to be saved
 */
async function saveToFile(image) {
  const resultFile = join(process.cwd(), '/cat-card.jpg');
  await writeFile(resultFile, image);
  console.log('The file was saved!');
}

(async () => {
  try {
    const images = await Promise.all([
      fetchImage(greeting),
      fetchImage(who)
    ]);
    const mergedImages = await bindImages(images);
    await saveToFile(mergedImages);
  } catch (error) {
    console.error(error);
  }  
})()
