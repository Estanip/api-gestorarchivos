const { createApi } = require('unsplash-js');
const nodeFetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    fetch: nodeFetch
});

module.exports = unsplash;
