import { adventureTransaction as transaction, idbValue as valueOf, LEGACY_PLANNER_KEY } from './adventures.js';
import { newPlanner, validatePlanner, normalizeProgress, defaultGoals } from './planner-model.js';

const selectionKey = adventureId => `activePlanner:${adventureId || 'reference'}`;

// One-time data correction for the original Typhlosion goals. Never replace
// user-edited movesets or any other member, links, or training progress.
function migrateOriginalTyphlosionGoals(plan) {
  if (plan.schemaVersion !== 2) return false;
  const member = plan.goals?.team?.find(p => p.id === 'typhlosion');
  const original = ['Flamethrower','Focus Blast','Dig','Fourth move — undecided'];
  if (!member || member.moves?.map(([name]) => name).join('|') !== original.join('|')) return false;
  const target = defaultGoals().team.find(p => p.id === 'typhlosion');
  member.moves = structuredClone(target.moves);
  member.moveIds = [...target.moveIds];
  member.note = target.note;
  // Only slots 2–4 change meaning. Retain slot 1 and all other progress.
  for (const index of [1,2,3]) delete plan.state.moves['typhlosion:'+index];
  plan.revision = (plan.revision || 0) + 1;
  plan.updatedAt = new Date().toISOString();
  return true;
}


 
// Keep untouched, stock move-goal descriptions aligned with the published
// party reference. Existing custom move orders and move annotations are not
// replaced. Machamp is deliberately excluded.
function syncStockPartyGoals(plan) {
  if (plan.schemaVersion !== 2) return false;
  const ids = new Set(['kingdra', 'dragonite', 'ampharos', 'gengar']);
  const defaults = defaultGoals().team;
  let changed = false;
  for (const member of plan.goals?.team || []) {
    if (!ids.has(member.id)) continue;
    const target = defaults.find(p => p.id === member.id);
    if (!target || member.moves?.length !== target.moves.length ||
        member.moves.some((move, i) => move[0] !== target.moves[i][0])) continue;
    // Same move order: retain existing move completions and Pokémon links.
    // Only refresh descriptions which still use a known default description.
    const descriptions = new Map([
      ['kingdra', ['Final set · locked', 'Coverage', "Clair's TM59 reward", 'Final set · weather control']],
      ['dragonite', ['Teach as Dragonair at level 53', 'TM26 reserved', 'TM02 · Route 27', 'Final set · locked']],
      ['ampharos', ['Repeatable Game Corner TM', 'Coverage', 'Coverage', 'Utility']],
      ['gengar', ['TM30 reserved', 'TM36 · Route 43', 'Coverage', 'Repeatable Game Corner TM']]
    ]);
    const original = descriptions.get(member.id);
    if (member.moves.some((move, i) => move[1] !== original[i])) continue;
    // The stock members already agree today; this sync is intentionally
    // idempotent and won't alter plans unless the canonical metadata changes.
    if (JSON.stringify(member.moves) !== JSON.stringify(target.moves)) {
      member.moves = structuredClone(target.moves); changed = true;
    }
  }
  if (changed) {
    plan.revision = (plan.revision || 0) + 1;
    plan.updatedAt = new Date().toISOString();
  }
  return changed;
}


export async function initializePlanners(storage = localStorage) {
  const raw=storage.getItem(LEGACY_PLANNER_KEY);
  return transaction(['planners','settings'],'readwrite',async tx=>{
    const store=tx.objectStore('planners');
    const settings=tx.objectStore('settings');
    const marker=await valueOf(settings.get('legacyPlannerMigration'));
    const existing=marker && await valueOf(store.get(marker.id));
    if(marker && !existing)throw new Error('The original migration record is missing. Your v1 browser data is preserved; import a backup as a separate plan.');
    const legacy=existing?.schemaVersion===2 || raw===null ? null : normalizeProgress(JSON.parse(raw));
    if (existing?.schemaVersion === 1) {
      const upgraded={...existing,schemaVersion:2,goals:defaultGoals(),state:legacy || normalizeProgress(existing.state),links:{},revision:1,updatedAt:new Date().toISOString(),legacyActivationSource:raw || existing.legacySource};
      validatePlanner(upgraded); store.put(upgraded);
    } else if (!marker && legacy) {
      const plan=newPlanner('SoulSilver / Mando',null,defaultGoals(),legacy);
      plan.revision=1; plan.legacySource=raw; plan.legacyActivationSource=raw;
      store.add(plan); settings.put({key:'legacyPlannerMigration',id:plan.id});
    }
    const plans=await valueOf(store.getAll());
    if (!plans.length) {
      const plan=newPlanner(); plan.revision=1; store.add(plan); plans.push(plan);
    }
    for (const plan of plans) {
      const typhlosionChanged = migrateOriginalTyphlosionGoals(plan);
      const otherGoalsChanged = syncStockPartyGoals(plan);
      if (typhlosionChanged || otherGoalsChanged) {
        validatePlanner(plan);
        store.put(plan);
      }
    }
    plans.forEach(validatePlanner);
    return plans;
  });
}
export async function listPlanners() {
  return transaction(['planners'],'readonly',async tx=>{
    const plans=await valueOf(tx.objectStore('planners').getAll());
    plans.forEach(validatePlanner); return plans;
  });
}
export async function storePlanner(plan, {adventureId = plan.adventureId, select = true} = {}) {
  validatePlanner(plan);
  return transaction(['planners','profiles','settings'],'readwrite',async tx=>{
    const store=tx.objectStore('planners');
    const previous=await valueOf(store.get(plan.id));
    if (!previous && plan.revision!==0) throw new Error('This plan no longer exists. Import a backup as a separate plan.');
    if (previous && previous.revision !== plan.revision) throw new Error('This plan changed in another tab. Refresh before editing; your previous data is preserved.');
    if (plan.adventureId) {
      const profile=await valueOf(tx.objectStore('profiles').get(plan.adventureId));
      if (!profile || profile.gameId!==plan.gameId) throw new Error('Adventure not found for this game.');
    }
    const updated={...structuredClone(plan),revision:(previous?.revision || 0)+1,updatedAt:new Date().toISOString()};
    store.put(updated);
    if (select) tx.objectStore('settings').put({key:selectionKey(adventureId),id:plan.id});
    return updated;
  });
}
export async function choosePlanner(id, adventureId) {
  return transaction(['planners','settings'],'readwrite',async tx=>{
    const plan=await valueOf(tx.objectStore('planners').get(id)); validatePlanner(plan);
    if (plan.adventureId!==null && plan.adventureId!==adventureId) throw new Error('Select the correct adventure first.');
    tx.objectStore('settings').put({key:selectionKey(adventureId),id}); return plan;
  });
}
export async function preferredPlanner(adventureId) {
  return transaction(['settings'],'readonly',async tx=>(await valueOf(tx.objectStore('settings').get(selectionKey(adventureId))))?.id || null);
}
