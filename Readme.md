assign-prefix
=============

> 通过构建方案来解决`=`的操作问题。

### How

* 找到`require('Q')`对应的引用，例如
```javascript
// 找到A为引用
var A = require('Q');
```

* 找到实例引用，例如
```javascript
// 因为前面发现A是Q.js的引用
// 所以q是Q.js的实例
var q = new A({ el: '#vm1' })

// 因为前面发现A是Q.js的引用
// 所以qq也是Q.js的实例
var qq = A.get('#vm2')
```

* 将实例的`=`转成`$set`，例如：
```javascript
// -> q.$set('msg', 'hello');
q.msg = 'hello';

// -> qq.obj.$set('flag', true);
qq.obj.flag = true;
```

### 看下面的例子

* 源文件

```javascript
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
```

* 转换后

```javascript
var Q = require('Q');
var one = new Q({
    el: '#vm',
    data: { msg: 'hello' }
});
one.$set('msg', 'nihao');
var another = Q.get('#vm');
another.$set('msg', 'world');
```

### (Warning) 暂时只属于小型演示，还未能达到使用阶段