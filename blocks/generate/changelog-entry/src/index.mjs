export function formatChangelogEntry(change) {
  if (!change || typeof change !== 'object' || Array.isArray(change)) throw new TypeError('change must be plain object');
  const allowedKeys = new Set(['type','summary','scope','issue','breaking']);
  for (const key of Object.keys(change)) if (!allowedKeys.has(key)) throw new RangeError('unknown key');
  const { type, summary, scope, issue, breaking } = change;

  // Validate type
  const allowedTypes = ['added', 'changed', 'fixed', 'removed', 'security', 'deprecated'];
  if (!allowedTypes.includes(type)) {
    throw new RangeError('Invalid type');
  }

  // Process summary
  const trimmedSummary = summary.trim().replace(/\s+/g, ' ');
  if (trimmedSummary === '') {
    throw new RangeError('Summary must be non-empty');
  }

  // Process scope
  const trimmedScope = scope ? scope.trim().replace(/\s+/g, ' ') : '';

  // Build the base entry
  let entry = `- **${type}`;
  if (trimmedScope) {
    entry += `(${trimmedScope})`;
  }
  entry += `:** ${trimmedSummary}`;

  // Add breaking indicator if needed
  if (breaking === true) {
    entry += ' [BREAKING]';
  }

  // Add issue if present
  if (issue !== undefined && issue !== null) {
    const issueStr = String(issue);
    if (issueStr !== '') {
      entry += ` (#${issueStr})`;
    }
  }

  return entry;
}
