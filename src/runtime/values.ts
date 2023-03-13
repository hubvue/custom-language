import { Stmt } from "../frontend/ast"
import Environment from "./environment"

export type ValueType = 'null' | 'number' | 'boolean' | 'object' | 'native-fn' | 'function'

export interface RuntimeVal {
  type: ValueType
}

export interface NullVal extends RuntimeVal {
  type: 'null',
  value: 'null'
}

export interface NumberVal extends RuntimeVal {
  type: 'number',
  value: number
}

export interface BooleanVal extends RuntimeVal {
  type: 'boolean',
  value: boolean
}

export interface ObjectVal extends RuntimeVal {
  type: 'object',
  properties: Map<string, RuntimeVal>
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;
export interface NativeFunctionVal extends RuntimeVal {
  type: 'native-fn'
  call: FunctionCall
}

export interface FunctionVal extends RuntimeVal {
  type: 'function',
  name: string,
  parameters: string[]
  declarationEnv: Environment,
  body: Stmt[]
}


export function makeNumber(n = 0) {
  return { type: 'number', value: n} as NumberVal
}

export function makeNull() {
  return { type: 'null', value: 'null'} as NullVal
}

export function makeBool(n = false) {
  return { type: 'boolean', value: n} as BooleanVal
}


export function makeObject(properties: Map<string, RuntimeVal>) {
  return { type: 'object', properties } as ObjectVal
}

export function makeNativeFn(call: FunctionCall): RuntimeVal {
  return { type: 'native-fn', call} as NativeFunctionVal
}

