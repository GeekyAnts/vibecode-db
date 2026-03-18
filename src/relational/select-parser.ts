import type { ParsedSelect, RelationNode } from './types';

/**
 * Parse a Supabase-style select string into a structured AST.
 *
 * Supports:
 * - Simple columns: `id, name, email`
 * - Wildcard: `*`
 * - Nested relations: `posts(id, title, comments(id, body))`
 * - Aliases: `author:users(name)`
 * - Mixed: `id, name, posts(id, title)`
 * - Deep nesting: `a(b(c(d)))`
 *
 * @param select - The raw select string (e.g. "id, name, posts(id, title)")
 * @returns Parsed AST with columns and relations separated
 */
export function parseSelect(select: string): ParsedSelect {
  const trimmed = select.trim();

  if (!trimmed || trimmed === '*') {
    return { columns: [], relations: [] };
  }

  const tokens = tokenize(trimmed);
  return parseTokens(tokens);
}

// ---------------------------------------------------------------------------
// Tokenizer
// ---------------------------------------------------------------------------

type Token =
  | { type: 'identifier'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'comma' };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    // Skip whitespace
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'lparen' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'rparen' });
      i++;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: 'comma' });
      i++;
      continue;
    }

    // Identifier: alphanumeric, underscore, colon (for aliases), dot, asterisk
    if (isIdentChar(ch)) {
      let ident = '';
      while (i < input.length && isIdentChar(input[i])) {
        ident += input[i];
        i++;
      }
      tokens.push({ type: 'identifier', value: ident });
      continue;
    }

    // Skip unexpected characters
    i++;
  }

  return tokens;
}

function isIdentChar(ch: string): boolean {
  return /[a-zA-Z0-9_:.*\-]/.test(ch);
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

function parseTokens(tokens: Token[]): ParsedSelect {
  const columns: string[] = [];
  const relations: RelationNode[] = [];
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }

  function advance(): Token | undefined {
    return tokens[pos++];
  }

  function parseRelationNode(identifier: string): RelationNode {
    // Parse alias: `alias:table` or just `table`
    let table: string;
    let alias: string | undefined;

    const colonIdx = identifier.indexOf(':');
    if (colonIdx > 0) {
      alias = identifier.substring(0, colonIdx);
      table = identifier.substring(colonIdx + 1);
    } else {
      table = identifier;
    }

    // Consume '('
    advance(); // lparen

    const innerColumns: string[] = [];
    const innerRelations: RelationNode[] = [];

    while (peek() && peek()!.type !== 'rparen') {
      // Skip commas
      if (peek()!.type === 'comma') {
        advance();
        continue;
      }

      if (peek()!.type === 'identifier') {
        const ident = (advance() as { type: 'identifier'; value: string }).value;

        // Check if followed by '(' — it's a nested relation
        if (peek()?.type === 'lparen') {
          innerRelations.push(parseRelationNode(ident));
        } else {
          innerColumns.push(ident);
        }
      } else {
        // Unexpected token — skip
        advance();
      }
    }

    // Consume ')'
    if (peek()?.type === 'rparen') {
      advance();
    }

    return {
      table,
      alias,
      columns: innerColumns,
      relations: innerRelations,
    };
  }

  while (peek()) {
    // Skip commas
    if (peek()!.type === 'comma') {
      advance();
      continue;
    }

    if (peek()!.type === 'identifier') {
      const ident = (advance() as { type: 'identifier'; value: string }).value;

      // Check if followed by '(' — it's a relation
      if (peek()?.type === 'lparen') {
        relations.push(parseRelationNode(ident));
      } else {
        columns.push(ident);
      }
    } else {
      // Unexpected token — skip
      advance();
    }
  }

  return { columns, relations };
}
