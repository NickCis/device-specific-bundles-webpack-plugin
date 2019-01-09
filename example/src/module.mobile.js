const text = require('./dependency');
const shared = require('./shared');

function func() {
  return `${shared} - ${text} mobile`;
}

module.exports = func;
