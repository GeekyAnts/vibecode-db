import { parseProjection } from '../dist/index.mjs'

const input = 'id, users(name,email), comments(id, content)'
const ast = parseProjection(input)

console.log('INPUT:', input)
console.log('AST:', JSON.stringify(ast, null, 2))
