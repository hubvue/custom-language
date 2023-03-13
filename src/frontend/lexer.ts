//  let x = 45 + (foo * bar)

export enum TokenType {
  // Null,
  Number,    // 数字
  Identifier, // 标识符
  Equals,     // 等号
  Semicolon,  //分号
  Comma,      // 逗号
  Colon,      // 冒号
  Dot,        // .
  OpenBracket,  // [
  CloseBracket, // ]
  OpenBrace,  // {
  CloseBrace, // }
  OpenParen,  // (
  CloseParen, // )
  BinaryOperator,  // 二元运算符
  Let,         // let
  Const,       // const
  EOF, // 文件结束标识
}

export interface Token {
  value: string,
  type: TokenType,
}

const KEYWORDS: Record<string, TokenType> = {
  'let': TokenType.Let,
  'const': TokenType.Const
  // 'null': TokenType.Null
}

// 判断字符是否是字母
const isAplha = (value = '') => {
  return value.toUpperCase() !== value.toLowerCase()
}

// 判断字符数字
const isInt = (value = '') => {
  const c = value.charCodeAt(0)
  const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)]
  return c >= bounds[0] && c <= bounds[1]
}

// 过滤一下空白字符
const isSkippable = (value = '') => {
  return value == ' ' || value == '\n' || value == '\t' || value == '\r'
}

const token = (value = '', type: TokenType): Token => {
  return { value, type }
}

export const tokenize = (sourceCode: string): Token[] => {
  const tokens = new Array<Token>()

  const src = sourceCode.split("")

  // 遍历每一个字符构建token序列
  while (src.length > 0) {
    if (src[0] == '(') {
      tokens.push(token(src.shift(), TokenType.OpenParen))
    } else if (src[0] == ')') {
      tokens.push(token(src.shift(), TokenType.CloseParen))
    } else if (src[0] == '{') {
      tokens.push(token(src.shift(), TokenType.OpenBrace))
    } else if (src[0] == '}') {
      tokens.push(token(src.shift(), TokenType.CloseBrace))
    } else if (src[0] == '[') {
      tokens.push(token(src.shift(), TokenType.OpenBracket))
    } else if (src[0] == ']') {
      tokens.push(token(src.shift(), TokenType.CloseBracket))
    } else if (['+', '-', '/', '*', '%'].includes(src[0])) {
      tokens.push(token(src.shift(), TokenType.BinaryOperator))
    } else if (src[0] == '=') {
      tokens.push(token(src.shift(), TokenType.Equals))
    } else if (src[0] == ';') {
      tokens.push(token(src.shift(), TokenType.Semicolon))
    } else if (src[0] == ':') {
      tokens.push(token(src.shift(), TokenType.Colon))
    } else if (src[0] == ',') {
      tokens.push(token(src.shift(), TokenType.Comma))
    } else if (src[0] == '.') {
      tokens.push(token(src.shift(), TokenType.Dot))
    } else { 
      // 构建数字
      if (isInt(src[0])) {
        let num = '';
        while (src.length > 0 && isInt(src[0]))  {
          num += src.shift()
        }
        tokens.push(token(num, TokenType.Number))
      } else if (isAplha(src[0])) {  // 构建标识符
        let ident = ''
        while (src.length > 0 && isAplha(src[0])) {
          ident += src.shift()
        }

        // 保留字过滤
        const reserved = KEYWORDS[ident]
        // TokenType 可能为0
        if (typeof reserved === 'number') {
          tokens.push(token(ident, reserved))
        } else {
          tokens.push(token(ident, TokenType.Identifier))
        } 
      } else if (isSkippable(src[0])) {
        src.shift()
      } else {
        console.log('Unreconized character found in source ', src[0])
        process.exit(1)
      }
    }
  }

  tokens.push(token('EOF', TokenType.EOF))

  return tokens
}
