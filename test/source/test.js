var Q = require('Q');
var one = new Q({
    el: '#vm',
    data: {
        msg: 'hello'
    }
});
one.msg = 'nihao';
var another = Q.get('#vm');
another.msg = 'world';

