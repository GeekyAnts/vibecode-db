import type { Filter, QueryModifiers } from '../../types';

export function applyFilters(data: Record<string, any>[], filters: Filter[]): Record<string, any>[] {
  return data.filter((row) => {
    return filters.every((f) => matchFilter(row, f));
  });
}

function matchFilter(row: Record<string, any>, filter: Filter): boolean {
  // Handle 'or' filters
  if (filter.operator === 'or') {
    const orFilters = parseOrString(filter.value as string);
    const result = orFilters.some((f) => matchFilter(row, f));
    return filter.negate ? !result : result;
  }

  const value = row[filter.column];
  let result: boolean;

  switch (filter.operator) {
    case 'eq':
      result = value === filter.value;
      break;
    case 'neq':
      result = value !== filter.value;
      break;
    case 'gt':
      result = value > filter.value;
      break;
    case 'gte':
      result = value >= filter.value;
      break;
    case 'lt':
      result = value < filter.value;
      break;
    case 'lte':
      result = value <= filter.value;
      break;
    case 'like':
      result = likeMatch(String(value), filter.value as string, false);
      break;
    case 'ilike':
      result = likeMatch(String(value), filter.value as string, true);
      break;
    case 'is':
      result = value === filter.value;
      break;
    case 'in':
      result = (filter.value as any[]).includes(value);
      break;
    case 'contains':
      if (Array.isArray(value)) {
        result = (filter.value as any[]).every((v: any) => value.includes(v));
      } else if (typeof value === 'object' && value !== null) {
        result = Object.entries(filter.value as Record<string, any>).every(
          ([k, v]) => value[k] === v,
        );
      } else {
        result = false;
      }
      break;
    case 'containedBy':
      if (Array.isArray(value)) {
        result = value.every((v: any) => (filter.value as any[]).includes(v));
      } else {
        result = false;
      }
      break;
    case 'overlaps':
      if (Array.isArray(value)) {
        result = value.some((v: any) => (filter.value as any[]).includes(v));
      } else {
        result = false;
      }
      break;
    case 'textSearch':
      result = textSearchMatch(String(value), filter.value);
      break;
    case 'filter': {
      const { operator: op, value: val } = filter.value;
      return matchFilter(row, { column: filter.column, operator: op, value: val });
    }
    default:
      result = true;
  }

  return filter.negate ? !result : result;
}

function likeMatch(value: string, pattern: string, caseInsensitive: boolean): boolean {
  let regexStr = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/%/g, '.*')
    .replace(/_/g, '.');
  regexStr = `^${regexStr}$`;
  const flags = caseInsensitive ? 'i' : '';
  return new RegExp(regexStr, flags).test(value);
}

function textSearchMatch(value: string, filterValue: any): boolean {
  const query = typeof filterValue === 'string' ? filterValue : filterValue.query;
  const words = query.split(/\s+/).filter(Boolean);
  const lowerValue = value.toLowerCase();
  return words.every((w: string) => lowerValue.includes(w.toLowerCase()));
}

/** Parse Supabase-style PostgREST or() filter strings like "age.gt.18,name.eq.John" */
export function parseOrString(orStr: string): Filter[] {
  const filters: Filter[] = [];
  const parts = splitOrParts(orStr);

  for (const part of parts) {
    const dotIdx = part.indexOf('.');
    if (dotIdx === -1) continue;
    const column = part.substring(0, dotIdx);
    const rest = part.substring(dotIdx + 1);
    const secondDot = rest.indexOf('.');
    if (secondDot === -1) continue;
    const operator = rest.substring(0, secondDot);
    let value: any = rest.substring(secondDot + 1);

    // Parse value types
    if (value === 'null') value = null;
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (/^\d+$/.test(value)) value = Number(value);
    // Handle (val1,val2) for 'in' operator
    else if (value.startsWith('(') && value.endsWith(')')) {
      value = value.slice(1, -1).split(',').map((v: string) => {
        const trimmed = v.trim();
        if (/^\d+$/.test(trimmed)) return Number(trimmed);
        return trimmed;
      });
    }

    filters.push({ column, operator: operator as Filter['operator'], value });
  }

  return filters;
}

/** Split or() parts respecting nested parentheses */
function splitOrParts(str: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';

  for (const ch of str) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

export function applyModifiers(data: Record<string, any>[], modifiers: QueryModifiers): Record<string, any>[] {
  let result = [...data];

  // Apply ordering
  if (modifiers.order && modifiers.order.length > 0) {
    result.sort((a, b) => {
      for (const order of modifiers.order!) {
        const aVal = a[order.column];
        const bVal = b[order.column];

        if (aVal === bVal) continue;

        // Handle nulls
        if (aVal == null && bVal == null) continue;
        if (aVal == null) return order.nullsFirst ? -1 : 1;
        if (bVal == null) return order.nullsFirst ? 1 : -1;

        const cmp = aVal < bVal ? -1 : 1;
        return order.ascending ? cmp : -cmp;
      }
      return 0;
    });
  }

  // Apply range (takes precedence over limit)
  if (modifiers.range) {
    result = result.slice(modifiers.range.from, modifiers.range.to + 1);
  } else if (modifiers.limit != null) {
    result = result.slice(0, modifiers.limit);
  }

  return result;
}

export function selectColumns(data: Record<string, any>[], columns?: string): Record<string, any>[] {
  if (!columns || columns === '*') return data;

  const cols = columns.split(',').map((c) => c.trim());
  return data.map((row) => {
    const result: Record<string, any> = {};
    for (const col of cols) {
      if (col in row) {
        result[col] = row[col];
      }
    }
    return result;
  });
}
