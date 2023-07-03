'use strict';

module.exports = ({ strapi }) => {

  const generateThumbhash = async (event, eventType) => {
    const { data, where } = event.params;

    if ((data.mime && data.mime.startsWith('image/'))) {
      data.thumbhash = await strapi.plugin('strapi-thumbhash').service('thumbhash').generateThumbhash(data.url);
    }

    if (eventType === 'beforeUpdate' && strapi.plugin('strapi-thumbhash').config('regenerateOnUpdate') === true) {
      const fullData = await strapi.db.query('plugin::upload.file').findOne({
        select: ['url', 'thumbhash', 'name', 'mime'],
        where
      })

      if ((fullData.mime && fullData.mime.startsWith('image/')) && !fullData.thumbhash) {
        data.thumbhash = await strapi.plugin('strapi-thumbhash').service('thumbhash').generateThumbhash(fullData.url);
      }
    }
  };

  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    beforeCreate: (event) => generateThumbhash(event, 'beforeCreate'),
    beforeUpdate: (event) => generateThumbhash(event, 'beforeUpdate'),
  });
};
