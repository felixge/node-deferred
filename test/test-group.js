// Some tests for my ideas of grouping collections of deferreds
process.mixin(require('sys'));
var Deferred = require('../lib/deferred').Deferred;
var group = require('../lib/group').group;

var a = new Deferred();
setTimeout(function() {a.callback(1);}, 100);
var b = new Deferred();
setTimeout(function() {b.callback(2);}, 80);
var c = new Deferred();
setTimeout(function() {c.callback(3);}, 60);

(group)
  ('a', a)
  ('b', b)
  ('c', c)
  .addCallback(function(results) {
    p(results); // {c: 3, b: 2, a: 1}
  });