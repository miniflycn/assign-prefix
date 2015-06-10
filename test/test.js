var prefix = require('../')
  , fs = require('fs');

describe('test', function () {
  it('should translate = to $set for Q instance', function () {
    var str = fs.readFileSync(__dirname + '/source/test.js', 'utf-8');
    prefix(str).should.equal(fs.readFileSync(__dirname + '/expected/test.js', 'utf-8'));
  })
})