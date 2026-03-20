import type { Filter } from '../../types';

/** Translate a QueryDescriptor filter array into a PocketBase filter string */
export function translateFilters(filters: Filter[]): string {
  const parts: string[] = [];

  for (const filter of filters) {
    const translated = translateFilter(filter);
    if (translated) parts.push(translated);
  }

  return parts.join(' && ');
}

function translateFilter(filter: Filter): string {
  if (filter.operator === 'or') {
    // Parse PostgREST OR syntax: "col.op.val,col.op.val"
    return translateOrFilter(filter.value);
  }

  const col = filter.column;
  const val = formatValue(filter.value);
  const negate = filter.negate;

  let expr: string;

  switch (filter.operator) {
    case 'eq':
      expr = `${col} = ${val}`;
      break;
    case 'neq':
      expr = `${col} != ${val}`;
      break;
    case 'gt':
      expr = `${col} > ${val}`;
      break;
    case 'gte':
      expr = `${col} >= ${val}`;
      break;
    case 'lt':
      expr = `${col} < ${val}`;
      break;
    case 'lte':
      expr = `${col} <= ${val}`;
      break;
    case 'like':
      expr = `${col} ~ ${val}`;
      break;
    case 'ilike':
      expr = `${col} ~ ${val}`;
      break;
    case 'is':
      if (filter.value === null) {
        expr = `${col} = null`;
      } else {
        expr = `${col} = ${val}`;
      }
      break;
    case 'in':
      if (Array.isArray(filter.value)) {
        const orParts = filter.value.map((v: any) => `${col} = ${formatValue(v)}`);
        expr = `(${orParts.join(' || ')})`;
      } else {
        expr = `${col} = ${val}`;
      }
      break;
    case 'contains':
      expr = `${col} ~ ${val}`;
      break;
    case 'textSearch':
      const query = typeof filter.value === 'string' ? filter.value : filter.value.query;
      expr = `${col} ~ ${formatValue(query)}`;
      break;
    case 'filter': {
      const innerFilter: Filter = {
        column: col,
        operator: filter.value.operator,
        value: filter.value.value,
      };
      return translateFilter(innerFilter);
    }
    default:
      expr = `${col} = ${val}`;
  }

  if (negate) {
    return `!(${expr})`;
  }

  return expr;
}

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  return `"${String(value)}"`;
}

/** Map PostgREST operators to PocketBase operators */
const OP_MAP: Record<string, string> = {
  eq: '=', neq: '!=', gt: '>', gte: '>=', lt: '<', lte: '<=',
  like: '~', ilike: '~', is: '=',
};

/**
 * Parse PostgREST OR syntax into PocketBase filter.
 * Input:  "status.eq.done,status.eq.in_progress"
 * Output: "(status = \"done\" || status = \"in_progress\")"
 */
function translateOrFilter(value: string): string {
  const parts = value.split(',').map((part) => {
    const segments = part.trim().split('.');
    if (segments.length < 3) return part;
    const col = segments[0];
    const op = segments[1];
    const val = segments.slice(2).join('.');
    const pbOp = OP_MAP[op] || '=';
    return `${col} ${pbOp} ${formatValue(val)}`;
  });
  return `(${parts.join(' || ')})`;
}
