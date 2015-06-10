var esprima = require('esprima')
  , escodegen = require('escodegen');

function walk(arr, type, foo) {
  var item;
  for (var i = 0, l = arr.length; i < l; i++) {
    item = arr[i];
    if (item.type === type) {
      foo(item);
    }
    if (item.declarations && item.declarations.length) {
      walk(item.declarations, type, foo);
    }
  }
}

function findLeftTarget(left) {
  var cur = left.object;
  for (; cur.object; cur = cur.object) {}
  return cur.name;
}

function trans(str, options) {
  options = options || {};

  var Qref = options.ref
    , Qinst = {}
    , ast = esprima.parse(str);
  // find require('Q');
  !Qref && walk(ast.body, 'VariableDeclaration', function (decl) {
    walk(decl.declarations, 'VariableDeclarator', function (decl) {
      var init = decl.init;
      
      if (
        init.type === 'CallExpression' && 
          init.callee.type === 'Identifier' && 
          init.callee.name === 'require' &&
          init.arguments[0] &&
          init.arguments[0].value === 'Q' &&
          decl.id.type === 'Identifier'
        ) {
        Qref = decl.id.name;
      }
    });
  });

  Qref = Qref || 'Q';

  // find Q instances
  walk(ast.body, 'VariableDeclaration', function (decl) {
    walk(decl.declarations, 'VariableDeclarator', function (decl) {
      var init = decl.init;
      // = Q.get
      if (
        init.type === 'CallExpression' &&
          init.callee.type === 'MemberExpression' &&
          init.callee.object &&
          init.callee.object.type === 'Identifier' &&
          init.callee.object.name === Qref &&
          init.callee.property.type === 'Identifier' &&
          init.callee.property.name === 'get'
      ) {
        Qinst[decl.id.name] = true;
      }
      // = new Q
      if (
        init.type === 'NewExpression' &&
          init.callee &&
          init.callee.type === 'Identifier' &&
          init.callee.name === Qref
      ) {
        Qinst[decl.id.name] = true;
      }
    });
  });

  // $set value
  walk(ast.body, 'ExpressionStatement', function (decl) {
    var expression = decl.expression
      , left
      , right;
    // it's a Q instance
    if (
      expression.type === 'AssignmentExpression' &&
        expression.operator === '=' &&
        expression.left.type === 'MemberExpression' &&
        Qinst[findLeftTarget(expression.left)]
    ) {  
      left = expression.left;
      right = expression.right;
      
      decl.expression = {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: left.computed ,
          object: left.object,
          property: {
            type: 'Identifier',
            name: '$set'
          }
        },
        arguments: [
          {
            type: 'Literal',
            value: left.property.name,
            raw: "'" + left.property.name + "'"
          },
          right
        ]
      };
    }
  });
  //console.log(JSON.stringify(ast, undefined, 4))

  return escodegen.generate(ast);
}

module.exports = trans;