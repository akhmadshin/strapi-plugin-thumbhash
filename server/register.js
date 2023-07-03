'use strict';

module.exports = ({ strapi }) => {
  strapi.plugin('upload').contentTypes.file.attributes.thumbhash = {
    type: 'text',
  };
};
