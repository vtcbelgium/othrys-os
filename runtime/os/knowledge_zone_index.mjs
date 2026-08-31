import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function rows(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(x => x.endsWith('.json')).sort()
    .map(name => JSON.parse(readFileSync(join(dir, name), 'utf8')));
}

export function buildKnowledgeZoneIndex(root) {
  const base = join(root, '.othrys', 'knowledge');
  const inbox = rows(join(base, 'inbox'));
  const reviews = rows(join(base, 'reviews'));
  const byId = new Map(inbox.map(x => [x.id, x]));
  const items = reviews.map(review => {
    const item = byId.get(review.itemId);
    if (!item) return null;
    const zone = review.decision === 'PROMOTE'
      ? (review.classification === 'GARDEN' ? 'GARDEN'
        : ['R_AND_D', 'RESEARCH'].includes(review.classification) ? 'R_AND_D' : null)
      : null;
    return zone ? Object.freeze({ id: item.id, title: item.title, zone,
      source: item.source, reviewId: review.reviewId, evidence: review.evidence,
      authorityGranted: false }) : null;
  }).filter(Boolean);
  return Object.freeze({ schema: 'othrys.os.knowledge-zone-index.v1',
    garden: Object.freeze(items.filter(x => x.zone === 'GARDEN')),
    researchAndDevelopment: Object.freeze(items.filter(x => x.zone === 'R_AND_D')),
    rejected: reviews.filter(x => x.decision === 'REJECT').length,
    authorityGranted: false, mutationsPerformed: 0 });
}
