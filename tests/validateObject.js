'use strict';

var validateObject = require('../'),
  should = require('should');

var spec = Object.freeze({
  one: 'string',
  two: {
    type: 'object',
    required: true
  },
  three: {
    type: 'json',
    required: false
  },
  four: {
    type: 'number',
    required: true
  },
  five: 'array'
});

describe('validateObject', function () {

  it('should verify that a valid object conforms to a given specification.',
    function () {

      var valid = {
        one: 'a string',
        two: {
          a: 'property on this object'
        },
        three: '{"a":"property on this object","b":[1,2,3],"c":10}',
        four: 32,
        five: [1, 2, 3]
      };

      validateObject(spec, valid, function (err, result) {
        should.not.exist(err);
        should.exist(result);
        console.log(result);
      });
    }
  );

  it('should verify that an invalid object does not conform to a given specification',
    function () {

      var invalid = {
        one: 'a string',
        two: {
          a: 'property on this object'
        },
        three: '{"property on this object","b":[1,2,3],"c":10}',
        four: 32,
        five: [1, 2, 3]
      };

      validateObject(spec, invalid, function (err, result) {
        should.exist(err);
        should.not.exist(result);
        console.log(err);
      });
    });

  it('should respect required directive',
    function () {

      var valid = {
        two: {
          a: 'property on this object'
        },
        four: 32,
      };

      validateObject(spec, valid, function (err, result) {
        should.not.exist(err);
        should.exist(result);
      });
    });
});