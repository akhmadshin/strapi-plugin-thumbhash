# Strapi plugin strapi-plugin-thumbhash

A plugin for <a href="https://github.com/strapi/strapi">Strapi CMS</a> that generates <a href="https://evanw.github.io/thumbhash/">thumbhash</a> for your uploaded images

## Installation

To install, run:

```bash
npm install strapi-plugin-thumbhash
```

Open/create file `config/plugins.js`. Enable this plugin by adding:

```js
module.exports = {
    ...
    'strapi-plugin-thumbhash': {
      enabled: true,
      config: {
        regenerateOnUpdate: true
      }
    },
  }
```

## How to generate thumbhash for an image

In the Strapi Dashboard open Content Manager. Edit one collection/single type. Add or edit a Media field type and save the collection/single type.

## How to get thumbhash

Target a Strapi REST API endpoint. For example:

```
localhost:1337/api/products?populate=Image.*
```

The response will be a JSON containing thumbhash along with rest of the image data:

```js
{
  "data": [
    {
      "id": 6,
      "attributes": {
        "name": "Test",
        "createdAt": "2022-10-27T14:52:04.393Z",
        "updatedAt": "2022-10-28T09:58:22.238Z",
        "Image": {
          "data": {
            "id": 80,
            "attributes": {
              "name": "image.png",
              "alternativeText": "image.png",
              "caption": "image.png",
              "width": 960,
              "height": 168,
              "formats": {
                ...
              },
              "hash": "image_ed1fbcdba0",
              "ext": ".png",
              "mime": "image/png",
              "size": 4.63,
              "url": "/uploads/image_ed1fbcdba0.png",
              "previewUrl": null,
              "provider": "local",
              "provider_metadata": null,
              "createdAt": "2022-10-28T09:42:02.471Z",
              "updatedAt": "2022-10-28T09:42:02.471Z",
              "thumbhash": "1QcSHQRnh493V4dIh4eXh1h4kJUI"
            }
          }
        }
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```