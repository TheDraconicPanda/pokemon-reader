import { readUint16, readUint32, writeUint16 } from './gen4-binary.js';

export function recalculatePartyStats(record, baseStats, oldMaxHp, oldHp) {
  const level = record[0x8C];
  const ivBits = readUint32(record, 0x38);
  const iv = {
    hp: ivBits & 31,
    attack: (ivBits >>> 5) & 31,
    defense: (ivBits >>> 10) & 31,
    speed: (ivBits >>> 15) & 31,
    specialAttack: (ivBits >>> 20) & 31,
    specialDefense: (ivBits >>> 25) & 31,
  };
  const ev = {
    hp: record[0x18], attack: record[0x19], defense: record[0x1A],
    speed: record[0x1B], specialAttack: record[0x1C], specialDefense: record[0x1D],
  };
  const nature = readUint32(record, 0) % 25;
  const bases = {
    hp: baseStat(baseStats, "hp"),
    attack: baseStat(baseStats, "attack"),
    defense: baseStat(baseStats, "defense"),
    speed: baseStat(baseStats, "speed"),
    specialAttack: baseStat(baseStats, "special-attack"),
    specialDefense: baseStat(baseStats, "special-defense"),
  };
  const calcHp = Math.floor(((2 * bases.hp + iv.hp + Math.floor(ev.hp / 4)) * level) / 100) + level + 10;
  const calcOther = (stat, base, ivValue, evValue) => {
    const raw = Math.floor(((2 * base + ivValue + Math.floor(evValue / 4)) * level) / 100) + 5;
    return Math.floor(raw * natureMultiplier(nature, stat));
  };
  const stats = {
    attack: calcOther("attack", bases.attack, iv.attack, ev.attack),
    defense: calcOther("defense", bases.defense, iv.defense, ev.defense),
    speed: calcOther("speed", bases.speed, iv.speed, ev.speed),
    specialAttack: calcOther("specialAttack", bases.specialAttack, iv.specialAttack, ev.specialAttack),
    specialDefense: calcOther("specialDefense", bases.specialDefense, iv.specialDefense, ev.specialDefense),
  };
  writeUint16(record, 0x90, calcHp);
  writeUint16(record, 0x92, stats.attack);
  writeUint16(record, 0x94, stats.defense);
  writeUint16(record, 0x96, stats.speed);
  writeUint16(record, 0x98, stats.specialAttack);
  writeUint16(record, 0x9A, stats.specialDefense);
  const hp = oldHp === 0 ? 0 : Math.max(1, Math.min(calcHp, calcHp - Math.max(0, oldMaxHp - oldHp)));
  writeUint16(record, 0x8E, hp);
}

function natureMultiplier(nature, stat) {
  const statIndex = { attack: 0, defense: 1, speed: 2, specialAttack: 3, specialDefense: 4 }[stat];
  const raised = Math.floor(nature / 5);
  const lowered = nature % 5;
  if (raised === lowered || raised !== statIndex && lowered !== statIndex) return 1;
  return raised === statIndex ? 1.1 : 0.9;
}

function baseStat(stats, name) {
  const entry = stats.find((stat) => stat.stat?.name === name);
  if (!entry || !Number.isInteger(entry.base_stat)) throw new Error("Invalid evolved species base stats.");
  return entry.base_stat;
}

export function validBaseStats(stats) {
  return Array.isArray(stats) && ["hp", "attack", "defense", "speed", "special-attack", "special-defense"]
    .every((name) => stats.some((stat) => stat.stat?.name === name && Number.isInteger(stat.base_stat)));
}

