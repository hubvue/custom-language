import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { tokenize } from './frontend/lexer'
import Parser from './frontend/parser'
import Environment, { createGlobalEnv } from './runtime/environment'
import { evaluate } from './runtime/interpreter'
import { makeBool, makeNull, makeNumber, NumberVal } from './runtime/values'
import prompt from 'prompt'

const repl = () => {
  const parser = new Parser()
  console.log("\n Repl v0.1")
  prompt.start()
  const env = createGlobalEnv()
  
  const replHandler = () => {
    prompt.get(['code'],(err, result) => {
      if (err) {
        console.error(err)
      }
      const code = result['code']
      if (!code ||code === 'exit') {
        process.exit(0)
      }
      const program =  parser.produceAST(code)
      const res = evaluate(program, env)
      console.log(res)
      replHandler()
    })
  }

  replHandler()
}

repl()
