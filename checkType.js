(function(root, ns) {

  var type = function(o) {

    // handle null in old IE
    if (o === null) {
      return 'null';
    }

    // handle DOM elements
    if (o && (o.nodeType === 1 || o.nodeType === 9)) {
      return 'element';
    }

    var s = Object.prototype.toString.call(o);
    var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

    // handle NaN and Infinity
    if (type === 'number') {
      if (isNaN(o)) {
        return 'nan';
      }
      if (!isFinite(o)) {
        return 'infinity';
      }
    }
    return type;
  };

  var types = [
    'Null',
    'Undefined',
    'Object',
    'Array',
    'String',
    'Number',
    'Boolean',
    'Function',
    'RegExp',
    'Element',
    'NaN',
    'Infinite'
  ];

  types.forEach(function(t) {
    type['is' + t] = function(o) {
      return type(o) === t.toLowerCase();
    };
  });

  if (typeof module !== 'undefined' && typeof module.exports ===
    'object') {
    module.exports = type;
  }
  else if (typeof define === 'function' && define.amd) {
    define(type);
  }
  else {
    if (typeof root[ns] === 'object') {
      root[ns].type = type;
    }
    else {
      root.type = type;
    }
  }

})(this, 'Thinaire');