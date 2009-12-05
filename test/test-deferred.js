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


// Some random API sugar thinking I've been doing, please ignore:

// db.query('SELECT 1')
//   ('result1', function(result1) {
//     return db.query('SELECT 2');
//   })
//   ('result2', function(result2) {
//     return db.query('SELECT 3');
//   })
//   ('result3')(function(results) {
//     p(results); // == {result1: result1, result2: result2, result3: result}
//   })
//   .addErrback(function() {
//    // If anything goes wrong in this chain, catch it here!
//   });
// 
// 
// 
// db
//   .query('SELECT 1')
//   .addCallback(function(result1) {
//     this.results['result1'] = result1;
//     return db.query('SELECT 2');
//   })
//   .addCallback(function(result2) {
//     this.results['result2'] = result2;
//     return db.query('SELECT 3');
//   })
//   .addCallback(function(result3) {
//     this.results['result3'] = result3;
//     return this.results;
//   })
//   .addCallback(function(results) {
//     p(results); // == [result1, result2, result3]
//   })
//   .addErrback(function() {
//    // If anything goes wrong in this chain, catch it here!
//   });
// 
// 
// 
// var d = new Deferred();
// d.addCallback(function() {
//   var d2 = new Deferred();
//   return d2.
//     addCallback(function() {
//     // do something here
//     });
// });
// 
// a.addCallback(function() {
//   // do something when all the tasks are done
// });
// 
// 
// 
// var d = new Deferred(), left = 0, done = false, r = {};
// d.
//   addCallback(function(results) {
//     p(results); // == [result1, result2, result3]
//   })
//   .addErrback(function() {
//    // If anything goes wrong in this chain, catch it here!
//   });
// 
// db
//   .query('SELECT 1')
//   .addCallback(function(result1) {
//     left--;
//     r['result1'] = result1;
//     if (!left) d.callback(r);
//   })
//   .addErrback(function(e) {
//     if (!done) d.errback(e)
//   });
// left++;
// 
// db
//   .query('SELECT 2')
//   .addCallback(function(result2) {
//     left--;
//     r['result2'] = result2;
//     if (!left) d.callback(r);
//   })
//   .addErrback(function(e) {
//     if (!done) d.errback(e)
//   });
// left++;
// 
// db
//   .query('SELECT 3')
//   .addCallback(function(result3) {
//     left--;
//     r['result3'] = result3;
//     if (!left) d.callback(r);
//   })
//   .addErrback(function(e) {
//     if (!done) d.errback(e)
//   });
// left++;