var App = function(){
  var namespace = function(ns){
    var o, d;
    d = ns.split(".");
    o = window[d[0]] = window[d[0]] || {};
    d.slice(1).each(function(v2){
      o = o[v2] = o[v2] || {};
    });
    return o;
  };
  
  return {
    ns: namespace
  };
}();