import func from './module';
import shared from './shared';
import(/* webpackChunkName: "dynamic" */'./dynamic')
  .then(m => console.log('dynamic', m.default));

console.log(func(), shared);
