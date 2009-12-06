process.mixin(require('sys'));
var assert = require('assert');

var Deferred = require('../lib/deferred').Deferred;

var a = new Deferred();
a
  .addCallback(function(result) {
    return result+' world';
  })
  .addCallback(function(result) {
    assert.equal('hello world', result);
  });
a.callback('hello');

// This is different from dojo.Deferred, by default do not try..catch errors
var b = new Deferred();
b
  .addCallback(function() {
    throw new Error("Do not catch me");
  })
  .addErrback(function() {
    assert.ok(false, "Unreachable");
  });
assert.throws(function() {
 b.callback();
});

// However, we can explicitely turn on try..catch if we need it
var b = new Deferred();
var didCatch = false;
b
  .trycatch()
  .addCallback(function() {
    throw new Error("catchme");
  })
  .addErrback(function(e) {
    assert.equal("catchme", e.message);
    didCatch = true;
  });
b.callback();

process.addListener('exit', function() {
  assert.ok(didCatch);
});