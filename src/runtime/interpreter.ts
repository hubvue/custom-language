import { ValueType, RuntimeVal, NumberVal, NullVal, makeNumber, makeNull } from './values'
import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, NodeType, NumbericLiteral, ObjectLiteral, Program, Stmt, VarDeclaration } from '../frontend/ast'
import Environment from './environment'
import { evalProgram, evalVarDeclaration } from './eval/statements'
import { evalAssignment, evalBinaryExpr, evalCallExpr, evalIdentifier, evalObjectLiteral } from './eval/expressions'

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
  switch (astNode.kind) {
    case 'NumbericLiteral':
      return makeNumber((astNode as NumbericLiteral).value)

    case 'ObjectLiteral':
      return evalObjectLiteral(astNode as ObjectLiteral, env)

    // 删除null，因为null是个标识符
    // case 'NullLiteral':
    //   return makeNull()

    case 'Identifier':
      return evalIdentifier(astNode as Identifier, env)

    
    case 'CallExpr':
      return evalCallExpr(astNode as CallExpr, env)

    case 'BinaryExpr':
      return evalBinaryExpr(astNode as BinaryExpr, env)

    case 'AssignmentExpr':
      return evalAssignment(astNode as AssignmentExpr, env)

    case 'Program':
      return evalProgram(astNode as Program, env)

    case 'VarDeclaration':

      return evalVarDeclaration(astNode as VarDeclaration, env)

    default:
      console.error("This AST Node has not yet been setup fro interpretation", JSON.stringify(astNode, null, 2))
      process.exit(1)
  }
}

