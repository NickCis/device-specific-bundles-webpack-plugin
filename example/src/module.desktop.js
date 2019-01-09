const text = require('./dependency');
const shared = require('./shared');

function func() {
  return `${shared} - ${text} desktop`;
}

module.exports = func;
