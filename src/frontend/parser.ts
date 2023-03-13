import { AssignmentExpr, BinaryExpr, CallExpr, Expr, Identifier, MemberExpr, NumbericLiteral, ObjectLiteral, Program, Property, Stmt, VarDeclaration } from "./ast";
import { Token, tokenize, TokenType } from "./lexer";


export default class Parser {
  private tokens: Token[] = [];

  private notEOF() {
    return this.tokens[0].type !== TokenType.EOF
  }

  private at() {
    return this.tokens[0] as Token
  }

  private eat() {
    return this.tokens.shift() as Token
  }

  private expect(type: TokenType, err: string) {
    const token = this.at()
    if (!token || token.type !== type) {
      console.error("Parser Error: \n", err, token, "- Expecting: ", type)
    }
  }

  public produceAST(sourceCode: string): Program {
    // 词法解析生成token序列
    this.tokens = tokenize(sourceCode)

    const program: Program = {
      kind: 'Program',
      body: []
    }

    // parse
    while (this.notEOF()) {
      program.body.push(this.parseStmt())
    }

    return program
  }

  private parseStmt(): Stmt {
    // 先跳过复杂程序，只解析表达式
    // return this.parseExpr()
    switch(this.at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.parseVarDeclaration()
      default:
        return this.parseExpr()
    }
  }

  // 两种语法
  // LET IDENT;
  // (LET | CONST) = EXPR;
  parseVarDeclaration() {
    const isConstant = this.eat().type === TokenType.Const
    this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords.")
    const identifier = this.eat().value

    if (this.at().type === TokenType.Semicolon) {
      this.eat() // expect semicolon
      if (isConstant) {
        throw 'Must assigne value to constant expression, No value provided.'
      }
      return {
        kind: 'VarDeclaration',
        constant: false,
        identifier,
        value: undefined
      } as VarDeclaration
    }

    this.expect(TokenType.Equals, 'Expected equals token following identifier in var declaration')
    this.eat()
    const value = this.parseExpr()

    this.expect(TokenType.Semicolon, 'Variable declaration statment must end with semicolon.')
    this.eat()

    return {
      kind: 'VarDeclaration',
      constant: isConstant,
      identifier,
      value
    } as VarDeclaration
  }

  // 越向下优先级越高，赋值表达式 = 两侧都是表达式，因此要先计算表达式的值，因此加法表达式比赋值表达式优先级高
  private parseExpr(): Expr {
    return this.parseAssignmentExpr()
  }

  private parseAssignmentExpr(): Expr {

    const left = this.parseObjectLiteral()

    if (this.at().type === TokenType.Equals) {
      this.eat()
      // 例如 a = b = c，存在连等的情况，第一个等号的优先级要比第二个等号的优先级高
      const value = this.parseAssignmentExpr()

      this.expect(TokenType.Semicolon, 'Variable declaration statment must end with semicolon.')
      this.eat()

      return { kind: 'AssignmentExpr', assinge: left, value} as AssignmentExpr
    }
    return left
  }
  private parseObjectLiteral(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parseAdditiveExpr()
    }

    this.eat()  //advance post open barce

    const properties = new Array<Property>()

    while(this.notEOF && this.at().type !== TokenType.CloseBrace) {
      this.expect(TokenType.Identifier, 'Object literal key is not identifier.')
      const key = this.eat().value
      // { key, }
      if (this.at().type === TokenType.Comma) {
        this.eat()  // advance post comma
        properties.push({ kind: 'Property', key, value: undefined} as Property)
        continue
      } else if (this.at().type === TokenType.CloseBrace) { // { key }
        properties.push({ kind: 'Property', key, value: undefined} as Property)
        continue
      }
      // { key: value}
      this.expect(TokenType.Colon, 'Missing colon following identifier in object literal')
      this.eat()  //  advance post colon

      const value = this.parseObjectLiteral()

      properties.push({ kind: 'Property', key, value } as Property)

      if (this.at().type !== TokenType.CloseBrace) {
        this.expect(TokenType.Comma, 'Expected common or close barce following Porperty.')
        this.eat() //advance post comma
      } 
    }

    this.expect(TokenType.CloseBrace, 'Object literal missing closing barce.')
    this.eat() // advance post close barce
    return { kind: 'ObjectLiteral', properties} as ObjectLiteral
  }

  private parseAdditiveExpr(): Expr {
    let left = this.parseMultiplicitaveExpr()

    while (this.at().value === '+' || this.at().value == '-') {
      const operator = this.eat().value
      const right = this.parseMultiplicitaveExpr()
      left = {
        kind: 'BinaryExpr',
        left,
        right,
        operator
      } as BinaryExpr
    }

    return left
  }

  private parseMultiplicitaveExpr(): Expr {

    let left = this.parseCallMemberExpr()
    while(this.at().value === '/' || this.at().value === '*' || this.at().value === '%') {
      const operator = this.eat().value
      const right = this.parseCallMemberExpr()
      left = {
        kind: 'BinaryExpr',
        left,
        right,
        operator
      } as BinaryExpr
    }
    return left
  }

  // 成员访问以及方法调用 表达式 的优先级要低于 基础类型，且高于四则运算
  // foo.x()
  private parseCallMemberExpr(): Expr {
    // 获取成员访问表达式
    const memberExpr = this.parseMemberExpr()

    // 如果当前token为(，则为函数调用表达式
    if (this.at().type === TokenType.OpenParen) {
      return this.parseCallExpr(memberExpr)
    }

    return memberExpr
  }

  private parseCallExpr(caller: Expr): Expr {
     let callExpr: Expr = {
      kind: 'CallExpr',
      caller,
      args: this.parseArgs()
     } as CallExpr

    //  函数返回函数的情况，例如 foo.a()()
    if (this.at().type === TokenType.OpenParen) {
      callExpr = this.parseCallExpr(callExpr)
    }

    return callExpr
  }

  private parseArgs(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis")
    this.eat()  // advance post open paren
    // ()这种情况参数为空
    const args = this.at().type === TokenType.CloseParen ? [] : this.parseArgumentsList()

    this.expect(TokenType.CloseParen, "Missing closing parenthesis inside arguments list")
    this.eat()

    return args
  }

  private parseArgumentsList(): Expr[] {
    // 为什么是 parseAssignmentExpr
    // 参数传递的是值，只要是值都可以传，因此只要是产生值的也都可以传，表达式产生值，因此只要是表达式都可以作为参数
    const args = [this.parseAssignmentExpr()]

    // 为什么args数组要先解析一次，然后再while
    // 先解析一次后，如果还有其他参数，那么只需要判断当前token是否 comma即可，而不是do while
    while (this.at().type === TokenType.Comma) {
      this.eat() // advance post comma
      args.push(this.parseAssignmentExpr())
    }

    return args
  }

  private parseMemberExpr(): Expr {
    let object = this.parsePrimaryExpr()

    while ( this.at().type === TokenType.Dot || this.at().type === TokenType.OpenBracket) {
      const operator = this.eat()
      let property: Expr
      let computed: boolean
      if (operator.type === TokenType.Dot) {
        computed = false
        property = this.parsePrimaryExpr()

        // 非运行时解析，因此只有点访问的时候才会判断property的类型
        if (property.kind !== 'Identifier') {
          throw `Cannonot use dot operator without right hand side being a identifier`
        }

      } else {
        computed = true
        property = this.parseAssignmentExpr()
        this.expect(TokenType.CloseBracket, 'Missing closing bracket in computed value.')
        this.eat() // advance post close bracket
      }

      object = {
        kind: 'MemberExpr',
        object,
        property,
        computed
      } as MemberExpr
    }
    return object
  }

  private parsePrimaryExpr(): Expr {
    const tk = this.at().type

    switch (tk) {
      case TokenType.Identifier:
        return { kind: 'Identifier', symbol: this.eat().value } as Identifier

      case TokenType.Number:
        return {
          kind: "NumbericLiteral",
          value: parseFloat(this.eat().value)
        } as NumbericLiteral

      // case TokenType.Null:
      //   //  advance post null keyword
      //   this.eat()
      //   return {
      //     kind: 'NullLiteral',
      //     value: 'null'
      //   } as NullLiteral

      case TokenType.OpenParen: {
        this.eat()  // eat opening paren
        const expr = this.parseExpr()
        this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesised expression. Expected closing parenthesis.")
        this.eat() // eat closing paren
        return expr
      }

      default:
        console.error("Unexpected token found during parsing!", this.at())
        process.exit(1)
        return {} as Stmt
    }
  }
}
