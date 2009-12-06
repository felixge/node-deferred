var Deferred = require('./deferred').Deferred;

var DeferredGroup = exports.DeferredGroup = function() {
  Deferred.call(this);

  this._deferreds = [];
  this._results = {};
};
process.inherits(DeferredGroup, Deferred);

DeferredGroup.prototype.add = function(name, deferred) {
  var
    self = this;

  this._deferreds.push(deferred);

  deferred
    .addCallback(function(result) {
      self._results[name] = result;
      self._deferreds.splice(self._deferreds.indexOf(deferred));
      if (!self._deferreds.length) {
        self.callback(self._results);
      }
    });

  return this;
};

DeferredGroup.prototype.sugar = function() {
  if (arguments.length) {
    this.add.apply(this, arguments);
  }
  
  var
    self = this;
    sugar = function() {
      return self.sugar.apply(self, arguments);
    };

  for (var method in DeferredGroup.prototype) {
    if (typeof this[method] !== "function") {
      continue;
    }

    (function(method) {
      sugar[method] = function() {
        return self[method].apply(self, arguments);
      };
    })(method);
  }

  return sugar;
};

exports.group = function() {
  var group = new DeferredGroup();
  return group.sugar.apply(group, arguments);
};