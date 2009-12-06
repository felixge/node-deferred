# Dojo deferreds as a nodejs module

This is a port of dojo.Deferred to node.js. I am also working on DeferredGroup, an elegant wrapper to execute several Deferreds an parallel and aggregate the results.

# Note

So far this Deferred port has been altered in 1 major way. By default, dojo Deferreds execute every callback function in a try..catch block. This implementation does not. I think it is a bad idea to have this the default behavior as it will cause people countless hours of debugging since there will be no automatic feedback on their exceptions.

If you want to use the try..catch mechanism for callbacks, you have to specify it like this:

    var d = new Deferred();
    d
      .trycatch()
      .addCallback(function() {
        throw new Error("catchme");
      })
      .addErrback(function(e) {
        // e.message == "catchme"
      });

    d.callback();

The addErrback is not needed for this example to work, but it shows you how to handle the exception trigger in the initial callback.

## Todo

* Unit tests
* Re-factor code to my liking
* Docs for DeferredGroup