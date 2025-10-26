import { ProjectionNode } from './types'

/**
 * Parses a Supabase-like projection string into a ProjectionNode.
 * Supported:
 *   - "*" (all columns)
 *   - comma-separated columns: "id, name, email"
 *   - nested: "users(name,email), comments(id, content)"
 *   - whitespace tolerant
 */
export function parseProjection(input?: string): ProjectionNode | undefined {
    if (!input || input.trim() === '') return undefined

    let i = 0
    const s = input.trim()

    function skipWs() {
        while (i < s.length && /\s/.test(s[i]!)) i++
    }

    function parseIdentifier(): string {
        skipWs()
        const start = i
        while (i < s.length && /[A-Za-z0-9_*]/.test(s[i]!)) i++
        const id = s.slice(start, i).trim()
        if (!id) throw new Error(`Expected identifier at pos ${i} in "${input}"`)
        return id
    }

    function expect(ch: string) {
        skipWs()
        if (s[i] !== ch) throw new Error(`Expected "${ch}" at pos ${i} in "${input}"`)
        i++
    }

    /** Parse a comma-separated list of entries (columns or nested tables) into a node */
    function parseEntries(): ProjectionNode {
        const columns: string[] = []
        const children: Record<string, ProjectionNode> = {}

        while (true) {
            skipWs()
            // stop if we hit a ) or end
            if (i >= s.length || s[i] === ')') break

            const id = parseIdentifier()
            skipWs()

            if (s[i] === '(') {
                // nested child: tableName( ... )
                const table = id
                expect('(')
                const child = parseEntries()
                expect(')')
                children[table] = child
            } else {
                // column name (including "*")
                columns.push(id)
            }

            skipWs()
            if (s[i] === ',') { i++; continue }
            // otherwise end of list or closing paren handled by caller
        }

        // normalize: if "*" present, it dominates
        const finalCols = columns.includes('*') ? (['*'] as ['*']) : columns
        return { columns: finalCols, children }
    }

    // Top-level parse
    const node = parseEntries()

    // If there's unconsumed, it's a syntax error
    skipWs()
    if (i < s.length) {
        throw new Error(`Unexpected trailing input at pos ${i} in "${input}"`)
    }

    return node
}


