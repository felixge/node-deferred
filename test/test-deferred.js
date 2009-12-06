process.mixin(require('sys'));
var Deferred = require('../lib/deferred').Deferred;

var d = new Deferred();
d
  .addCallback(function(result) {
    return result+' world';
  })
  .addCallback(function(result) {
    p(result);
  });

d.callback('hello');