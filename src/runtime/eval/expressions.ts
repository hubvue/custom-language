import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral } from "../../frontend/ast";
import Environment from "../environment";
import { evaluate } from "../interpreter";
import { FunctionVal, makeNull, makeNumber, makeObject, NativeFunctionVal, NumberVal, RuntimeVal } from "../values";

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
  const fn = evaluate(node.caller, env)
  const args = node.args.map(arg => evaluate(arg, env))
  if (fn.type === 'native-fn') {
    return (fn as NativeFunctionVal).call(args, env)
  }

  if (fn.type === 'function') {
    const func = fn as FunctionVal
    const scope = new Environment(func.declarationEnv)

    // Create the variables for the parameters list
    for (let i = 0; i < func.parameters.length; i ++) {
      // TODO: 形参实参不一致情况，check边界
      const varname = func.parameters[i]
      scope.declareVar(varname, args[i], false)
    }

    let result: RuntimeVal = makeNull()
    // evalutate the function body line by line
    for (const stmt of func.body) {
      result = evaluate(stmt, scope)
    }

    return result
  }
  
  throw `${JSON.stringify(node.caller)} is not function`
}
