'use strict';

var type = require('./checkType'),
  util = require('util'),
  assert = require('assert');

// Properties can either be strings specifying type,
// in which case the field is not required,
// or hashes in the format of
// { type: 'string',
//   required: bool }

var CONSTS = Object.freeze({
  OBJECT: 'object',
  ARRAY: 'array',
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  BOOL: 'bool',
  JSON: 'json',

  invalidSchema: 'Invalid schema object',
  invalidTarget: 'Invalid target object',
  invalidProp: function (val, type) {
    return util.format('Invalid property: "%s" must be of type "%s"',
      val, type);
  }
});

function validateSpec(spec) {
  if (!type.isObject(spec)) {
    return false;
  }
  validateSpec.cache = validateSpec.cache || {};
  var jstr = JSON.stringify(spec);
  if (validateSpec.cache[jstr]) {
    return true;
  }
  var typeRe = /^(object|array|string|number|bool(ean)?|json){1}$/i,
    keys = Object.keys(spec),
    i = 0,
    l = keys.length;

  for (; i < l; ++i) {
    var field = spec[keys[i]];
    if (type.isString(field)) {
      if (typeRe.test(field)) {
        continue;
      }
      return false;
    }
    if (!type.isObject(field)) {
      return false;
    }
    if (!type.isString(field.type) || !typeRe.test(field.type) || !type.isBoolean(
      field.required)) {
      return false;
    }
  }
  validateSpec.cache[jstr] = true;
  return true;
}

function validateJson(jstring) {
  try {
    assert(type.isString(jstring));
    var obj = JSON.parse(jstring);
    return obj;
  }
  catch (e) {
    return false;
  }
}

module.exports = function validateObject(spec, obj, callback) {
  if (!type.isObject(obj)) {
    return callback(CONSTS.invalidTarget);
  }
  if (!validateSpec(spec)) {
    return callback(CONSTS.invalidSchema);
  }

  var errString = [];
  Object.keys(spec).forEach(function (key) {
    var val = spec[key],
      targetType;
    if (type.isString(val)) {
      targetType = {
        type: val.toLowerCase(),
        required: false
      };
    }
    else {
      targetType = val;
      targetType.type = targetType.type.toLowerCase();
    }

    // NOTE: could do this with an array of property names
    // and check for JSON first...
    if (!targetType.required && !obj[key]) {
      return;
    }
    switch (targetType.type) {
    case CONSTS.OBJECT:
      if (!type.isObject(obj[key])) {
        errString.push(CONSTS.invalidProp(key, targetType));
      }
      return;
    case CONSTS.ARRAY:
      if (!type.isArray(obj[key])) {
        errString.push(CONSTS.invalidProp(key, targetType));
      }
      return;
    case CONSTS.STRING:
      if (!type.isString(obj[key])) {
        errString.push(CONSTS.invalidProp(key, targetType));
      }
      return;
    case CONSTS.NUMBER:
      if (!type.isNumber(obj[key])) {
        errString.push(CONSTS.invalidProp(key, targetType));
      }
      return;
    case CONSTS.BOOL:
    case CONSTS.BOOLEAN:
      if (!type.isBoolean(obj[key])) {
        errString.push(CONSTS.invalidProp(key, targetType));
      }
      return;
    case CONSTS.JSON:
      // NOTE: we're mutating the object here... may want to revisit
      if (typeof obj[key] === 'object') { // include arrays
        obj[key] = JSON.stringify(obj[key]);
      }
      else {
        if (!validateJson(obj[key])) {
          errString.push(CONSTS.invalidProp(key, targetType));
        }
      }
      return;
    }
  });

  if (errString.length > 0) {
    return callback(errString.join(',\n'), null);
  }
  return callback(null, obj);
};