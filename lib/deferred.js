/*
  Copyright (c) 2004-2009, The Dojo Foundation All Rights Reserved.
  Available via Academic Free License >= 2.1 OR the modified BSD license.
  see: http://dojotoolkit.org/license for details

  This is a modified version with no remaining dependencies to dojo.
*/

var deferred = exports;

var hitch = function(scope, method) {
  if(!method) {
    method = scope;
    scope = null;
  }
  return (!scope)
    ? method
    : function() {
      return method.apply(scope, arguments || []);
    };
};

deferred.Deferred = function(/*Function?*/ canceller){
  this.chain = [];
  this.id = this._nextId();
  this.fired = -1;
  this.paused = 0;
  this.results = [null, null];
  this.canceller = canceller;
  this.silentlyCancelled = false;
};

process.mixin(deferred.Deferred.prototype, {
  _nextId: (function(){
    var n = 1;
    return function(){ return n++; };
  })(),

  cancel: function(){
    // summary: 
    //    Cancels a Deferred that has not yet received a value, or is
    //    waiting on another Deferred as its value.
    // description:
    //    If a canceller is defined, the canceller is called. If the
    //    canceller did not return an error, or there was no canceller,
    //    then the errback chain is started.
    var err;
    if(this.fired == -1){
      if(this.canceller){
        err = this.canceller(this);
      }else{
        this.silentlyCancelled = true;
      }
      if(this.fired == -1){
        if(!(err instanceof Error)){
          var res = err;
          var msg = "Deferred Cancelled";
          if(err && err.toString){
            msg += ": " + err.toString();
          }
          err = new Error(msg);
          err.cancelResult = res;
        }
        this.errback(err);
      }
    }else if( (this.fired == 0) &&
          (this.results[0] instanceof deferred.Deferred)
    ){
      this.results[0].cancel();
    }
  },
      

  _resback: function(res){
    // summary:
    //    The private primitive that means either callback or errback
    this.fired = ((res instanceof Error) ? 1 : 0);
    this.results[this.fired] = res;
    this._fire();
  },

  _check: function(){
    if(this.fired != -1){
      if(!this.silentlyCancelled){
        throw new Error("already called!");
      }
      this.silentlyCancelled = false;
      return;
    }
  },

  callback: function(res){
    //  summary:  
    //    Begin the callback sequence with a non-error value.
    
    /*
    callback or errback should only be called once on a given
    Deferred.
    */
    this._check();
    this._resback(res);
  },

  errback: function(/*Error*/res){
    //  summary: 
    //    Begin the callback sequence with an error result.
    this._check();
    if(!(res instanceof Error)){
      res = new Error(res);
    }
    this._resback(res);
  },

  addBoth: function(/*Function|Object*/cb, /*String?*/cbfn){
    //  summary:
    //    Add the same function as both a callback and an errback as the
    //    next element on the callback sequence.This is useful for code
    //    that you want to guarantee to run, e.g. a finalizer.
    var enclosed = hitch.apply(null, arguments);
    return this.addCallbacks(enclosed, enclosed);
  },

  addCallback: function(/*Function|Object*/cb, /*String?*/cbfn /*...*/){
    //  summary: 
    //    Add a single callback to the end of the callback sequence.
    return this.addCallbacks(hitch.apply(null, arguments));
  },

  addErrback: function(cb, cbfn){
    //  summary: 
    //    Add a single callback to the end of the callback sequence.
    return this.addCallbacks(null, hitch.apply(null, arguments));
  },

  addCallbacks: function(cb, eb){
    // summary: 
    //    Add separate callback and errback to the end of the callback
    //    sequence.
    this.chain.push([cb, eb])
    if(this.fired >= 0){
      this._fire();
    }
    return this;
  },

  _fire: function(){
    // summary: 
    //    Used internally to exhaust the callback sequence when a result
    //    is available.
    var chain = this.chain;
    var fired = this.fired;
    var res = this.results[fired];
    var self = this;
    var cb = null;
    while(
      (chain.length > 0) &&
      (this.paused == 0)
    ){
      // Array
      var f = chain.shift()[fired];
      if(!f){ continue; }
      var func = function(){
        var ret = f(res);
        //If no response, then use previous response.
        if(typeof ret != "undefined"){
          res = ret;
        }
        fired = ((res instanceof Error) ? 1 : 0);
        if(res instanceof deferred.Deferred){
          cb = function(res){
            self._resback(res);
            // inlined from _pause()
            self.paused--;
            if(
              (self.paused == 0) && 
              (self.fired >= 0)
            ){
              self._fire();
            }
          }
          // inlined from _unpause
          this.paused++;
        }
      };

      try{
        func.call(this);
      }catch(err){
        fired = 1;
        res = err;
      }
    }
    this.fired = fired;
    this.results[fired] = res;
    if((cb)&&(this.paused)){
      // this is for "tail recursion" in case the dependent
      // deferred is already fired
      res.addBoth(cb);
    }
  }
});