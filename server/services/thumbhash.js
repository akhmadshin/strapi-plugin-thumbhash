'use strict';

const path = require('path');
const sizeOf = require('image-size');
const fetch = require('node-fetch');
const sharp = require('sharp');

module.exports = ({ strapi }) => ({
  async generateThumbhash(url) {
    try {
      return (await getThumbhashFromImageUrl(url));
    } catch (e) {
      strapi.log.error(e);
      return null;
    }
  },
});


const imageOptions = {
  dir: "./public",
  size: 64,
  format: ["png"],
  brightness: 1,
  saturation: 1.2,
  removeAlpha: true,
};

const arrayChunk = (arr, size) =>
  arr.length > size
    ? [arr.slice(0, size), ...arrayChunk(arr.slice(size), size)]
    : [arr];

/* getImageSize
   =========================================== */
const getImageSize = (file) => {
  const { width, height, type } = sizeOf(file);

  return {
    width,
    height,
    type,
  };
};

/* loadImage
   =========================================== */
const loadRemoteImage = async (src) => {
  const response = await fetch(src);
  const buffer = await response.buffer();
  return buffer;
};

const loadImage = async (imagePath, options) => {
  if (Buffer.isBuffer(imagePath)) {
    const imageSize = getImageSize(imagePath);

    return {
      file: imagePath,
      img: {
        src: null,
        ...imageSize,
      },
    };
  }

  if (imagePath.startsWith("http")) {
    const buffer = await loadRemoteImage(imagePath);
    const imageSize = getImageSize(buffer);

    return {
      file: buffer,
      img: {
        src: imagePath,
        ...imageSize,
      },
    };
  }

  if (!imagePath.startsWith("/"))
    throw new Error(
      `Failed to parse src \"${imagePath}\", if using relative image it must start with a leading slash "/"`
    );

  const file = path.join(options?.dir || imageOptions.dir, imagePath);
  const imageSize = getImageSize(file);

  return {
    file,
    img: {
      src: imagePath,
      ...imageSize,
    },
  };
};



/* optimizeImage
   =========================================== */

const optimizeImage = async (src, options) => {
  const pipeline = sharp(src)
    .resize(imageOptions.size, imageOptions.size, {
      fit: "inside",
    })
    .toFormat(...(options?.format || imageOptions?.format))
    .modulate({
      brightness: options?.brightness || imageOptions?.brightness,
      saturation: options?.saturation || imageOptions?.saturation,
      ...(options?.hue ? { hue: options?.hue } : {}),
      ...(options?.lightness ? { lightness: options?.lightness } : {}),
    });

  const getOptimizedForThumbhash =
    pipeline
      .clone()
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

  return getOptimizedForThumbhash
    .then((value) => {
      const { channels, width } = value.info;

      const rawBuffer = [].concat(...value.data);
      const pixels = arrayChunk(rawBuffer, channels);
      const rows = arrayChunk(pixels, width);

      return {
        ...value,
        rawBuffer,
        rows,
      };
    })
    .catch((err) => {
      console.error("transform failed", err);
      throw err;
    });
};

/* getImage
   =========================================== */
const getImage = async (src, options) => {
  const { file, img } = await loadImage(src, options);
  const optimized = await optimizeImage(file, options);

  return {
    img,
    ...optimized,
  };
};

const getThumbhashFromImageUrl = async (src, options) => {
  const optimizedForThumbhash = await getImage(src, options);
  return getThumbhash(optimizedForThumbhash);
};

const uint8ToBase64 = (arr) => Buffer.from(arr).toString('base64');

const getThumbhash = async ({ data, info }) => {
  const { width, height } = info;
  const { rgbaToThumbHash } = await import('thumbhash');
  let hash = rgbaToThumbHash(width, height, data);
  hash = uint8ToBase64(hash);
  console.log('hash = ', hash);
  return hash;
};