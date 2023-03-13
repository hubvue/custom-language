// 定义AST类型
export type NodeType = 
  // STATEMENTS
  | 'Program'
  | 'VarDeclaration'

  // EXPRESSIONS
  // | 'NullLiteral'
  | 'AssignmentExpr'
  | 'BinaryExpr'
  | 'MemberExpr'
  | 'CallExpr'
  | 'Identifier'
  | 'Property'
  | 'ObjectLiteral'
  | 'NumbericLiteral'


export interface Stmt {
  kind: NodeType
}

export interface Program extends Stmt {
  kind: 'Program',
  body: Stmt[]
}

export interface VarDeclaration extends Stmt {
  kind: 'VarDeclaration'
  constant: boolean,
  identifier: string
  value?: Expr
}

export interface Expr extends Stmt {}

// x = 1
// x = {foo: 1}
// x.foo = 123
// x['foo'] = 123
// 为什么assing是个表达式？
// 因为后续支持对象，对象访问赋值是个.操作表达式
export interface AssignmentExpr extends Expr {
  kind: 'AssignmentExpr',
  assinge: Expr,
  value: Expr
}

export interface BinaryExpr extends Expr {
  kind: 'BinaryExpr',
  left: Expr,
  right: Expr,
  operator: string
}

//  a()
//  a.b()
//  a[b]()
// 因此caller需要是一个表达式
export interface CallExpr extends Expr {
  kind: 'CallExpr',
  args: Expr[],
  caller: Expr,
}

// a.b
// a[b]
export interface MemberExpr extends Expr {
  kind: 'MemberExpr',
  object: Expr,
  property: Expr,
  computed: boolean
}

export interface Identifier extends Expr {
  kind: 'Identifier',
  symbol: string,
}

export interface NumbericLiteral extends Expr {
  kind: 'NumbericLiteral',
  value: number
}

export interface ObjectLiteral extends Expr {
  kind: 'ObjectLiteral',
  properties: Property[]
}

export interface Property extends Expr {
  kind: 'Property',
  key: string,
  value?: Expr // 可选 { key }
}
