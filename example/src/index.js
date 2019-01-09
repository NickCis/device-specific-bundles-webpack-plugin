const func = require('./module.APP_TARGET');
// const func = require('./module.desktop');
const shared = require('./shared');
import(/* webpackChunkName: "dynamic" */'./dynamic.APP_TARGET')
  .then(m => console.log(m));
// const another = require('./another');

console.log(func(), shared);
