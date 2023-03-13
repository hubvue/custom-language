import { Program, VarDeclaration } from "../../frontend/ast"
import Environment from "../environment"
import { evaluate } from "../interpreter"
import { makeNull, RuntimeVal } from "../values"

export function evalProgram(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = makeNull()

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env)
  }

  return lastEvaluated
}


export function evalVarDeclaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
  const value = declaration.value ? evaluate(declaration.value, env) : makeNull()
  return env.declareVar(declaration.identifier, value, declaration.constant)

}
