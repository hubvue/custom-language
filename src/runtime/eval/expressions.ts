import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral } from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { makeNull, makeNumber, makeObject, NativeFunctionVal, NumberVal, RuntimeVal } from "../values";

export function evalNumbericBinaryExpr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
  let result = 0;

  if (operator === '+') {
    result = lhs.value + rhs.value
  } else if (operator === '-') {
    result = lhs.value - rhs.value
  } else if (operator === '*') {
    result = lhs.value * rhs.value
  } else if (operator === '/') {
    // TODO: Division by zero checks
    result = lhs.value / rhs.value
  } else {
    result = lhs.value % rhs.value
  }
  return makeNumber(result)
}

export function evalBinaryExpr(binop: BinaryExpr, env: Environment): RuntimeVal {
  const lhs = evaluate(binop.left, env)
  const rhs = evaluate(binop.right, env)

  if (lhs.type === 'number' && rhs.type === 'number') {
    return evalNumbericBinaryExpr(lhs as NumberVal, rhs as NumberVal, binop.operator)
  }

  // One or both are Null
  return makeNull()
}

export function evalIdentifier(ident: Identifier, env: Environment): RuntimeVal {
  const val = env.lookupVar(ident.symbol)
  return val
}

export function evalAssignment(node: AssignmentExpr, env: Environment): RuntimeVal {
  if (node.assinge.kind !== 'Identifier') {
    throw `Invoid assinge type not Identifier ${JSON.stringify(node.assinge)}`
  }
  const varname = (node.assinge as Identifier).symbol
  return env.assignVal(varname, evaluate(node.value, env))
}


export function evalObjectLiteral(node: ObjectLiteral, env: Environment): RuntimeVal {
  const propertyMap = new Map<string, RuntimeVal>()
  for (let property of node.properties) {
    let key = property.key
    let value = property.value === undefined ? env.lookupVar(key) : evaluate(property.value, env)
    propertyMap.set(key, value)
  }
  return makeObject(propertyMap)
}


export function evalCallExpr(node: CallExpr, env: Environment): RuntimeVal {
  const caller = evaluate(node.caller, env)
  if (caller.type !== 'native-fn') {
    throw `${JSON.stringify(node.caller)} is not function`
  }

  const args = node.args.map(arg => evaluate(arg, env))

  return (caller as NativeFunctionVal).call(args, env)
}
