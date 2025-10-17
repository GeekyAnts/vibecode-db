// =====================================================================================
// Choose ONE import block:
//
// A) If you added a subpath export in package.json like:
//    "exports": { "./internal/sql-utils": "./dist/internal/sql-utils.mjs", ... }
// import {
//   buildWhere, buildOrder, buildLimitRange, buildModifiers,
//   buildInsert, buildUpdate, buildDelete, buildSelect
// } from 'vibecode-db/internal/sql-utils'
//
// B) Direct import from local build output (recommended while developing):
import {
    buildWhere, buildOrder, buildLimitRange, buildModifiers,
    buildInsert, buildUpdate, buildDelete, buildSelect
} from '../dist/index.mjs'
// =====================================================================================

// ---------- tiny pretty printer ----------
const c = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    gray: '\x1b[90m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    bold: '\x1b[1m',
}
const sym = { pass: '✓', fail: '✗', sec: '■' }

function line() { console.log(c.gray + '-'.repeat(80) + c.reset) }
function section(title) {
    console.log('\n' + c.cyan + sym.sec + ' ' + title + c.reset)
    line()
}
function code(label, val) {
    console.log(c.dim + label + ':' + c.reset)
    console.log(String(val).trim() ? '  ' + String(val).replace(/\n/g, '\n  ') : '  (empty)')
}
function ok(msg) { console.log(c.green + sym.pass + ' ' + msg + c.reset) }
function fail(msg, err) {
    console.log(c.red + sym.fail + ' ' + msg + c.reset)
    if (err) console.log(c.gray + String(err.stack || err) + c.reset)
}
function expect(cond, msg) {
    if (!cond) throw new Error(msg)
}

// ---------- sample relations (many-to-one: posts.user_id -> users.id) ----------
/** @type {{ [table: string]: Record<string, { kind: 'many-to-one', localKey: string, remoteTable: string, remoteKey: string }> }} */
const relations = {
    posts: {
        users: { kind: 'many-to-one', localKey: 'user_id', remoteTable: 'users', remoteKey: 'id' },
    },
}

// ---------- sample Projection ASTs ----------
/** flat: SELECT id, title, created_at FROM posts */
const projectionFlat = {
    columns: ['id', 'title', 'created_at'],
    children: {},
}

/** nested: SELECT posts + users(name,email) via LEFT JOIN */
const projectionNested = {
    columns: ['id', 'title', 'created_at'],
    children: {
        users: { columns: ['name', 'email'], children: {} },
    },
}

// ---------- sample QueryState objects ----------
const stateBase = { filters: [], projectionAst: projectionFlat }

const stateFiltered = {
    filters: [
        { type: 'eq', column: 'published', value: true },
        { type: 'gt', column: 'created_at', value: new Date('2024-01-01') },
        { type: 'in', column: 'user_id', value: ['u1', 'u2'] },
        { type: 'like', column: 'title', value: '%guide%' },
    ],
    order: { column: 'created_at', ascending: false },
    limit: 10,
    projectionAst: projectionFlat,
}

const stateRanged = {
    filters: [],
    order: { column: 'created_at', ascending: true },
    range: { from: 20, to: 39 },
    projectionAst: projectionFlat,
}

const stateNested = {
    filters: [{ type: 'eq', column: 'published', value: true }],
    order: { column: 'created_at', ascending: false },
    projectionAst: projectionNested,
}

// ---------- tests ----------
async function test_buildWhere() {
    section('buildWhere (with base alias "t0")')
    const { whereSql, whereParams } = buildWhere(stateFiltered, 't0')
    code('SQL', whereSql)
    code('Params', JSON.stringify(whereParams, null, 2))
    expect(whereSql.includes('t0."published" = ?'), 'eq filter not compiled with alias')
    expect(whereSql.includes('t0."created_at" > ?'), 'gt filter not compiled')
    expect(whereSql.includes('t0."user_id" IN (?,'), 'in filter not compiled')
    expect(whereSql.includes('t0."title" LIKE ?'), 'like filter not compiled')
    ok('buildWhere passed basic checks')
}

async function test_buildOrder() {
    section('buildOrder')
    const sql = buildOrder(stateFiltered, 't0') // -> ORDER BY t0."created_at" DESC
    code('SQL', sql)
    expect(/ORDER BY/.test(sql), 'ORDER BY missing')
    expect(/created_at/.test(sql), 'order column missing')
    ok('buildOrder passed basic checks')
}

async function test_buildLimitRange() {
    section('buildLimitRange')
    const a = buildLimitRange(stateFiltered) // LIMIT 10
    const b = buildLimitRange(stateRanged)   // LIMIT 20 OFFSET 20 (for 20..39)
    code('LIMIT (limit)', a)
    code('LIMIT (range)', b)
    expect(a.includes('LIMIT 10'), 'limit not compiled')
    expect(b.includes('LIMIT'), 'range LIMIT missing')
    expect(b.includes('OFFSET'), 'range OFFSET missing')
    ok('buildLimitRange passed basic checks')
}

async function test_buildModifiers() {
    section('buildModifiers (order + limit/range)')
    const m1 = buildModifiers(stateFiltered, 't0')
    const m2 = buildModifiers(stateRanged, 't0')
    code('filtered', m1)
    code('ranged', m2)
    expect(m1.includes('ORDER BY'), 'order missing in modifiers')
    expect(m1.includes('LIMIT 10'), 'limit missing in modifiers')
    expect(m2.includes('ORDER BY'), 'order missing in modifiers (range)')
    expect(m2.includes('LIMIT'), 'limit missing in modifiers (range)')
    ok('buildModifiers passed basic checks')
}

async function test_buildInsert() {
    section('buildInsert (single + multiple)')

    const now = new Date()

    // Single
    const one = buildInsert(
        'posts',
        [{ id: 'p1', title: 'Hello', user_id: 'u1', created_at: now, updated_at: now }],
        'upsert'
    )
    code('SQL (single)', one.sql)
    code('Params (single)', JSON.stringify(one.params, null, 2))
    expect(/INSERT(?:\s+OR\s+\w+)?\s+INTO\s+"posts"/i.test(one.sql), 'INSERT INTO not found (single)')
    expect(one.params.length === one.columns.length, 'params length mismatch (single)')

    // Multiple
    const many = buildInsert(
        'posts',
        [
            { id: 'p2', title: 'Second', user_id: 'u2', created_at: now, updated_at: now },
            { id: 'p3', title: 'Third', user_id: 'u1', created_at: now, updated_at: now },
        ],
        'upsert'
    )
    code('SQL (multi)', many.sql)
    code('Params (multi)', JSON.stringify(many.params, null, 2))

    // Must be VALUES (...), (...)
    expect(/VALUES\s*\([^)]*\)\s*,\s*\([^)]*\)/i.test(many.sql), 'multi-row VALUES not composed')

    // Sanity: params count = rows * columns
    const expectedParams = 2 * many.columns.length
    expect(many.params.length === expectedParams, `params length ${many.params.length} != ${expectedParams}`)

    ok('buildInsert passed basic checks')
}


async function test_buildUpdate() {
    section('buildUpdate (with where)')
    const { whereSql, whereParams } = buildWhere({ filters: [{ type: 'eq', column: 'id', value: 'p1' }] })
    console.log("HOLAA", whereSql, whereParams)
    const { sql, params } = buildUpdate('posts', { title: 'Updated', updated_at: new Date() }, whereSql, whereParams)
    code('SQL', sql)
    code('Params', JSON.stringify(params, null, 2))
    expect(/UPDATE "posts"/.test(sql), 'UPDATE missing')
    expect(/WHERE/.test(sql), 'WHERE missing')
    ok('buildUpdate passed basic checks')
}

async function test_buildDelete() {
    section('buildDelete (with where)')
    const { whereSql, whereParams } = buildWhere({ filters: [{ type: 'in', column: 'id', value: ['p2', 'p3'] }] })
    const { sql, params } = buildDelete('posts', whereSql, whereParams)
    code('SQL', sql)
    code('Params', JSON.stringify(params, null, 2))
    expect(/DELETE FROM "posts"/.test(sql), 'DELETE missing')
    expect(/IN/.test(sql), 'IN missing in WHERE')
    ok('buildDelete passed basic checks')
}

async function test_buildSelect_flat() {
    section('buildSelect (flat projection)')
    const out = buildSelect({ table: 'posts', state: stateFiltered }) // no relations
    code('SQL', out.sql)
    code('Params', JSON.stringify(out.params, null, 2))
    code('aliasToPath', JSON.stringify(out.aliasToPath, null, 2))
    expect(out.sql.startsWith('SELECT'), 'SELECT missing')
    expect(out.sql.includes('FROM "posts"'), 'FROM posts missing')
    ok('buildSelect (flat) passed basic checks')
}

async function test_buildSelect_nested() {
    section('buildSelect (nested projection + relations)')
    const out = buildSelect({ table: 'posts', state: stateNested, relations })
    code('SQL', out.sql)
    code('Params', JSON.stringify(out.params, null, 2))
    code('aliasToPath', JSON.stringify(out.aliasToPath, null, 2))
    expect(/LEFT JOIN "users"/.test(out.sql), 'LEFT JOIN users missing')
    expect(out.aliasToPath['users__name'], 'alias for users.name missing in aliasToPath')
    ok('buildSelect (nested) passed basic checks')
}

// ---------- runner ----------
async function main() {
    const tests = [
        // test_buildWhere,
        // test_buildOrder,
        // test_buildLimitRange,
        // test_buildModifiers,
        test_buildInsert,
        // test_buildUpdate,
        // test_buildDelete,
        // test_buildSelect_flat,
        // test_buildSelect_nested,
    ]

    console.log(c.bold + '\nVibecode SQL Utils — Smoke Tests\n' + c.reset)
    let passed = 0
    for (const t of tests) {
        try { await t(); passed++ } catch (err) { fail(`Test "${t.name}" failed`, err) }
    }
    line()
    const total = tests.length
    const color = passed === total ? c.green : c.red
    console.log(color + `\nSummary: ${passed}/${total} passed` + c.reset + '\n')
    if (passed !== total) process.exit(1)
}
main().catch(e => { fail('Unhandled error', e); process.exit(1) })
