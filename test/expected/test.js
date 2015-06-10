var Q = require('Q');
var one = new Q({
    el: '#vm',
    data: { msg: 'hello' }
});
one.$set('msg', 'nihao');
var another = Q.get('#vm');
another.$set('msg', 'world');