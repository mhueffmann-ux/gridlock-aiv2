import React, { useState, useEffect, useRef } from 'react';

const SUNDAY_GAMES = [
  { id: 1, away: 'SEA', home: 'CAR', spread: 'SEA -7', total: 44.5, time: '1:00 PM ET', awayRecord: '11-4', homeRecord: '7-8', playoff: 'SEA fighting for #1 seed & NFC West.' },
  { id: 2, away: 'TB', home: 'MIA', spread: 'TB -5.5', total: 44.5, time: '1:00 PM ET', awayRecord: '6-9', homeRecord: '6-9', playoff: 'TB must win to stay alive for NFC South.' },
  { id: 3, away: 'ARI', home: 'CIN', spread: 'CIN -7.5', total: 53.5, time: '1:00 PM ET', awayRecord: '3-12', homeRecord: '5-10', playoff: 'HIGHEST TOTAL - Shootout expected.' },
  { id: 4, away: 'PIT', home: 'CLE', spread: 'PIT -3', total: 34.5, time: '1:00 PM ET', awayRecord: '9-6', homeRecord: '3-12', playoff: 'PIT clinches AFC North with win.' },
  { id: 5, away: 'NE', home: 'NYJ', spread: 'NE -13.5', total: 43, time: '1:00 PM ET', awayRecord: '12-3', homeRecord: '3-12', playoff: 'SMASH SPOT vs tanking Jets.' },
  { id: 6, away: 'JAX', home: 'IND', spread: 'JAX -5.5', total: 48.5, time: '1:00 PM ET', awayRecord: '11-4', homeRecord: '8-7', playoff: 'JAX clinches AFC South. Trevor Lawrence ON FIRE!' },
  { id: 7, away: 'PHI', home: 'BUF', spread: 'BUF -1.5', total: 49.5, time: '4:25 PM ET', awayRecord: '11-4', homeRecord: '11-4', playoff: 'Playoff preview - marquee matchup.' },
];

// MASTER SALARY LOOKUP - Real DraftKings prices
const SALARY_LOOKUP = {
  // QBs
  'josh allen': 7000, 'drake maye': 6800, 'jalen hurts': 6600, 'joe burrow': 6500,
  'trevor lawrence': 6100, 'sam darnold': 5900, 'jacoby brissett': 5700, 'baker mayfield': 5600,
  'jaxson dart': 5400, 'tyler shough': 5200, 'aaron rodgers': 5000, 'bryce young': 4900,
  'shedeur sanders': 4800, 'philip rivers': 4700, 'tyrod taylor': 4600, 'justin fields': 4600,
  'cam ward': 4500, 'geno smith': 4400, 'quinn ewers': 4300, 'anthony richardson': 4200,
  'riley leonard': 4200, 'brady cook': 4100,

  // RBs
  "de'von achane": 8500, 'devon achane': 8500, 'achane': 8500,
  'james cook': 8000, 'james cook iii': 8000,
  'jonathan taylor': 7800, 'saquon barkley': 7600, 'chase brown': 7400,
  'travis etienne': 7100, 'travis etienne jr': 7100, 'travis etienne jr.': 7100,
  'jaylen warren': 6600, 'treveyon henderson': 6400, 'bucky irving': 6200,
  'ashton jeanty': 6100, 'rico dowdle': 6000, 'rhamondre stevenson': 5900,
  'kenneth walker': 5800, 'kenneth walker iii': 5800, 'breece hall': 5700,
  'kenneth gainwell': 5600, 'alvin kamara': 5500, 'tony pollard': 5500,
  'tyrone tracy': 5400, 'tyrone tracy jr': 5400, 'zach charbonnet': 5300,
  'michael carter': 5200, 'dylan sampson': 5100, 'tyjae spears': 5000,
  'devin singletary': 4900, 'audric estime': 4900, 'rachaad white': 4700,
  'emari demercado': 4700, 'tank bigsby': 4600, 'bhayshul tuten': 4600,
  'trayveon williams': 4600, 'chuba hubbard': 4500, 'jaylen wright': 4500,
  'ty johnson': 4500, 'samaje perine': 4400, 'evan hull': 4400,
  'd\'ernest johnson': 4300, 'tyler goodson': 4300, 'sean tucker': 4200,
  'isaiah davis': 4200, 'raheem mostert': 4100, 'lequint allen': 4100,

  // WRs
  'jaxon smith-njigba': 8600, 'jsn': 8600,
  "ja'marr chase": 8300, 'jamarr chase': 8300, 'chase': 8300,
  'chris olave': 7200, 'a.j. brown': 7000, 'aj brown': 7000,
  'mike evans': 6500, 'michael wilson': 6400, 'tee higgins': 6300,
  'jaylen waddle': 6100, 'devonta smith': 6000, 'tetairoa mcmillan': 5900,
  'stefon diggs': 5800, 'diggs': 5800, "wan'dale robinson": 5700,
  'dk metcalf': 5600, 'emeka egbuka': 5500, 'marvin harrison jr': 5400,
  'marvin harrison': 5400, 'mhj': 5400, 'jakobi meyers': 5300,
  'brian thomas jr': 5200, 'brian thomas': 5200, 'btj': 5200,
  'khalil shakir': 5100, 'chris godwin': 5000, 'michael pittman': 4900,
  'michael pittman jr': 4900, 'parker washington': 4800, 'alec pierce': 4700,
  'kayshon boutte': 4600, 'boutte': 4600, 'adonai mitchell': 4500,
  'jalen coker': 4400, 'rashid shaheed': 4300, 'josh downs': 4200,
  'chimere dike': 4100, 'jerry jeudy': 4000, 'mack hollins': 4000,
  'darius slayton': 3900, 'malik washington': 3900, 'tre tucker': 3800,
  'cooper kupp': 3800, 'john metchie': 3700, 'jack bech': 3700,
  'andrei iosivas': 3600, 'elic ayomanor': 3600, 'demario douglas': 3500,
  'jalen mcmillan': 3500, 'mason tipton': 3500, 'xavier legette': 3400,
  'adam thielen': 3400, 'tyler lockett': 3400, 'keon coleman': 3300,
  'kyle williams': 3300, 'tim patrick': 3300, 'joshua palmer': 3200,
  'calvin austin': 3200, 'kevin austin': 3200, 'cedric tillman': 3100,
  'gabe davis': 3100, 'isaiah williams': 3100, 'garrett wilson': 3000,
  'tyreek hill': 3000, 'malik nabers': 3000, 'calvin ridley': 3000,

  // TEs
  'trey mcbride': 7500, 'mcbride': 7500, 'brock bowers': 5500,
  'harold fannin': 5000, 'harold fannin jr': 5000,
  'hunter henry': 4500, 'tyler warren': 4400, 'dallas goedert': 4300,
  'juwan johnson': 4200, 'dalton kincaid': 4100, 'brenton strange': 4000,
  'darren waller': 3800, 'aj barner': 3600, 'mike gesicki': 3500,
  'theo johnson': 3400, 'chig okonkwo': 3300, 'cade otton': 3200,
  'dawson knox': 3100, 'david njoku': 3000, 'mason taylor': 3000,
  'noah fant': 2900, 'pat freiermuth': 2900,

  // DSTs
  'patriots': 3900, 'patriots dst': 3900, 'new england': 3900, 'ne dst': 3900,
  'seahawks': 3700, 'seahawks dst': 3700, 'seattle': 3700,
  'saints': 3500, 'saints dst': 3500, 'new orleans': 3500,
  'jaguars': 3400, 'jaguars dst': 3400, 'jacksonville': 3400, 'jax dst': 3400,
  'steelers': 3300, 'steelers dst': 3300, 'pittsburgh': 3300,
  'bengals': 3200, 'bengals dst': 3200, 'cincinnati': 3200,
  'buccaneers': 3100, 'buccaneers dst': 3100, 'tampa bay': 3100, 'bucs': 3100,
  'bills': 3000, 'bills dst': 3000, 'buffalo': 3000,
  'giants': 2900, 'giants dst': 2900, 'new york giants': 2900,
  'titans': 2800, 'titans dst': 2800, 'tennessee': 2800,
  'raiders': 2700, 'raiders dst': 2700, 'las vegas': 2700,
  'eagles': 2600, 'eagles dst': 2600, 'philadelphia': 2600,
  'browns': 2500, 'browns dst': 2500, 'cleveland': 2500,
  'colts': 2400, 'colts dst': 2400, 'indianapolis': 2400,
  'cardinals': 2300, 'cardinals dst': 2300, 'arizona': 2300,
  'dolphins': 2200, 'dolphins dst': 2200, 'miami': 2200,
  'panthers': 2100, 'panthers dst': 2100, 'carolina': 2100,
  'jets': 2000, 'jets dst': 2000, 'new york jets': 2000,

  // SHOWDOWN - CHI @ SF (FLEX salaries)
  'christian mccaffrey': 11800, 'cmc': 11800, 'mccaffrey': 11800,
  'brock purdy': 10600, 'purdy': 10600,
  'caleb williams': 10000, 'caleb': 10000,
  'george kittle': 9000, 'kittle': 9000,
  'rome odunze': 8800, 'odunze': 8800,
  'jauan jennings': 8600, 'jennings': 8600,
  'dj moore': 8400, 'd.j. moore': 8400,
  "d'andre swift": 8000, 'dandre swift': 8000, 'swift': 8000,
  'deebo samuel': 7200, 'deebo': 7200,
  'ricky pearsall': 5800, 'pearsall': 5800,
  'roschon johnson': 5200,
  'isaac guerendo': 4800, 'guerendo': 4800,
  'cole kmet': 4600, 'kmet': 4600,
  'bears dst': 3400, 'bears': 3400, 'chicago bears': 3400,
  '49ers dst': 3200, '49ers': 3200, 'san francisco': 3200, 'sf dst': 3200,
  'eric saubert': 2800, 'saubert': 2800,

  // SHOWDOWN - CPT salaries (1.5x)
  'christian mccaffrey cpt': 17700, 'cmc cpt': 17700,
  'brock purdy cpt': 15900, 'purdy cpt': 15900,
  'caleb williams cpt': 15000, 'caleb cpt': 15000,
  'george kittle cpt': 13500, 'kittle cpt': 13500,
  'rome odunze cpt': 13200, 'odunze cpt': 13200,
  'jauan jennings cpt': 12900, 'jennings cpt': 12900,
  'dj moore cpt': 12600, 'd.j. moore cpt': 12600,
  "d'andre swift cpt": 12000, 'swift cpt': 12000,
  'deebo samuel cpt': 10800, 'deebo cpt': 10800,
  'ricky pearsall cpt': 8700, 'pearsall cpt': 8700,
  'roschon johnson cpt': 7800,
  'isaac guerendo cpt': 7200, 'guerendo cpt': 7200,
  'cole kmet cpt': 6900, 'kmet cpt': 6900,
  'bears dst cpt': 5100, 'bears cpt': 5100,
  '49ers dst cpt': 4800, '49ers cpt': 4800,
  'eric saubert cpt': 4200, 'saubert cpt': 4200,
};

// ---------- Validation helpers (NEW) ----------
const normalizeText = (s) => {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[’']/g, '')           // apostrophes
    .replace(/[^a-z0-9\s]/g, ' ')   // punctuation -> spaces
    .replace(/\s+/g, ' ')
    .trim();
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractLineupBlock = (content) => {
  const m = (content || '').match(/---lineup---([\s\S]*?)---end lineup---/i);
  return m ? m[1].trim() : null;
};

const parseLineupLines = (block) => {
  const lines = (block || '').split('\n').map(l => l.trim()).filter(Boolean);
  const entries = [];

  for (const line of lines) {
    // Allow: "QB: Name ($7,000)" OR "QB - Name"
    const m = line.match(/^(CPT|QB|RB\d?|WR\d?|TE|FLEX\d?|DST|D\/ST|DEF)\s*[:\-–]\s*(.+)$/i);
    if (!m) continue;

    let slot = m[1].toUpperCase().replace(/\d$/, '');
    if (slot === 'D/ST' || slot === 'DEF') slot = 'DST';

    // Strip salary annotation + parentheses
    let name = m[2]
      .replace(/\$?\s?\d{1,2},?\d{3}\b/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    entries.push({ slot, name, rawLine: line });
  }

  return entries;
};

const buildNormalizedLookup = () => {
  const map = new Map();
  for (const [k, v] of Object.entries(SALARY_LOOKUP)) {
    map.set(normalizeText(k), v);
  }
  return map;
};

const NORMALIZED_SALARY = buildNormalizedLookup();

// prefer longer keys first to avoid "chase" matching "chase brown"
const NORMALIZED_KEYS_DESC = Array.from(NORMALIZED_SALARY.keys()).sort((a, b) => b.length - a.length);

const resolveSalaryKey = (rawName) => {
  const n = normalizeText(rawName);
  if (!n) return null;

  // exact hit
  if (NORMALIZED_SALARY.has(n)) return n;

  // try longest-first whole-word matching
  // We add padding spaces so boundary matching behaves on start/end.
  const padded = ` ${n} `;
  for (const key of NORMALIZED_KEYS_DESC) {
    // whole word/phrase match
    const re = new RegExp(`(^|\\s)${escapeRegex(key)}(\\s|$)`, 'i');
    if (re.test(padded)) return key;
  }

  return null;
};

const computeLineupValidation = (content, isShowdown = false) => {
  if (!content) return null;

  const block = extractLineupBlock(content);
  if (!block) return null; // Only validate when Claude uses the strict lineup block

  const entries = parseLineupLines(block);
  if (entries.length < (isShowdown ? 6 : 9)) {
    // still show partial info if 5+ entries, but don't mark as valid
    if (entries.length < 5) return null;
  }

  const foundPlayers = [];
  const missing = [];
  const ambiguous = [];
  let aiClaimedTotal = 0;

  // Try to extract AI's claimed total (optional)
  const totalMatch = content.match(/estimated_total[:\s]*\$?([\d,]+)/i) || content.match(/total[:\s]*\$?([\d,]+)/i);
  if (totalMatch) aiClaimedTotal = parseInt(totalMatch[1].replace(/,/g, ''), 10);

  for (const e of entries) {
    const key = resolveSalaryKey(e.name);

    if (!key) {
      missing.push({ slot: e.slot, name: e.name });
      continue;
    }

    // Showdown: CPT salary should already be in lookup (… cpt) OR we detect CPT via slot
    let finalKey = key;
    let salary = NORMALIZED_SALARY.get(finalKey);

    if (isShowdown && e.slot === 'CPT') {
      const cptKey = `${finalKey} cpt`;
      if (NORMALIZED_SALARY.has(cptKey)) {
        finalKey = cptKey;
        salary = NORMALIZED_SALARY.get(finalKey);
      } else {
        // If model used base name in CPT slot, attempt to find "<name> cpt"
        const maybe = `${normalizeText(e.name)} cpt`;
        if (NORMALIZED_SALARY.has(maybe)) {
          finalKey = maybe;
          salary = NORMALIZED_SALARY.get(finalKey);
        }
      }
    }

    // de-dupe exact finalKey so "diggs" + "stefon diggs" doesn't double-count
    if (!foundPlayers.find(p => p.key === finalKey)) {
      foundPlayers.push({
        slot: e.slot,
        key: finalKey,
        name: key, // normalized key for debug
        salary: salary || 0,
        raw: e.name
      });
    }
  }

  const actualTotal = foundPlayers.reduce((sum, p) => sum + (p.salary || 0), 0);

  // For main slate and showdown, if missing players exist, we mark invalid (even if salary <= cap)
  const rosterComplete = isShowdown ? (entries.length >= 6) : (entries.length >= 9);
  const noMissing = missing.length === 0;

  const isValid = (actualTotal <= 50000) && rosterComplete && noMissing;

  return {
    players: foundPlayers,
    missing,
    ambiguous,
    actualTotal,
    aiClaimedTotal,
    isValid,
    difference: aiClaimedTotal ? actualTotal - aiClaimedTotal : 0,
    rosterSpotsFound: entries.length
  };
};

// Salary Validator Component
const SalaryValidator = ({ validation, accent }) => {
  if (!validation) return null;

  const { actualTotal, aiClaimedTotal, isValid, difference, missing, rosterSpotsFound } = validation;

  return (
    <div style={{
      marginTop: '12px',
      padding: '12px 16px',
      background: isValid ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
      border: `1px solid ${isValid ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`,
      borderRadius: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '16px' }}>{isValid ? '✅' : '❌'}</span>
        <span style={{ fontWeight: '700', color: isValid ? '#00ff88' : '#ff4444' }}>
          SALARY CHECK: ${actualTotal.toLocaleString()}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
          (Cap: $50,000)
        </span>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
          Spots parsed: {rosterSpotsFound}
        </span>
      </div>

      {!isValid && (
        <div style={{ color: '#ff4444', fontSize: '13px', marginTop: '4px' }}>
          {actualTotal > 50000
            ? <>⚠️ OVER CAP by ${(actualTotal - 50000).toLocaleString()} — This lineup is INVALID</>
            : <>⚠️ Lineup INVALID — missing or incomplete roster</>
          }
        </div>
      )}

      {missing?.length > 0 && (
        <div style={{ color: '#ffaa00', fontSize: '12px', marginTop: '6px' }}>
          ⚠️ Missing salary matches for: {missing.map(m => `${m.slot}:${m.name}`).join(', ')}
        </div>
      )}

      {aiClaimedTotal > 0 && Math.abs(difference) > 100 && (
        <div style={{ color: '#ffaa00', fontSize: '12px', marginTop: '4px' }}>
          ⚠️ AI claimed ${aiClaimedTotal.toLocaleString()} but actual is ${actualTotal.toLocaleString()}
          (off by ${Math.abs(difference).toLocaleString()})
        </div>
      )}

      {isValid && (
        <div style={{ color: '#00ff88', fontSize: '12px', marginTop: '4px' }}>
          ✓ Remaining salary: {(50000 - actualTotal).toLocaleString()}
        </div>
      )}
    </div>
  );
};

const DFS_PLAYERS = [
  { name: 'Josh Allen', team: 'BUF', pos: 'QB', salary: 7000, opp: 'vs PHI', avg: 24.16, notes: 'Highest ceiling QB - 35pt upside' },
  { name: 'Drake Maye', team: 'NE', pos: 'QB', salary: 6800, opp: '@ NYJ', avg: 21.18, notes: 'SMASH - Jets tanking' },
  { name: 'Jalen Hurts', team: 'PHI', pos: 'QB', salary: 6600, opp: '@ BUF', avg: 20.21, notes: 'Rushing upside' },
  { name: 'Joe Burrow', team: 'CIN', pos: 'QB', salary: 6500, opp: 'vs ARI', avg: 16.65, notes: '53.5 total shootout' },
  { name: 'Trevor Lawrence', team: 'JAX', pos: 'QB', salary: 6100, opp: '@ IND', avg: 20.58, notes: 'SMASH - 10 TDs last 2 games' },
  { name: "De'Von Achane", team: 'MIA', pos: 'RB', salary: 8500, opp: 'vs TB', avg: 21.37, notes: '28-pt ceiling, explosive' },
  { name: 'James Cook III', team: 'BUF', pos: 'RB', salary: 8000, opp: 'vs PHI', avg: 21.47, notes: 'Goal-line work, TD upside' },
  { name: 'Jonathan Taylor', team: 'IND', pos: 'RB', salary: 7800, opp: 'vs JAX', avg: 23.67, notes: 'Elite talent, tough matchup' },
  { name: 'Saquon Barkley', team: 'PHI', pos: 'RB', salary: 7600, opp: '@ BUF', avg: 15.70, notes: 'Volume play' },
  { name: 'Chase Brown', team: 'CIN', pos: 'RB', salary: 7400, opp: 'vs ARI', avg: 16.03, notes: 'Shootout game stack' },
  { name: 'Travis Etienne Jr.', team: 'JAX', pos: 'RB', salary: 7100, opp: '@ IND', avg: 16.26, notes: 'Stack with Lawrence' },
  { name: 'Rhamondre Stevenson', team: 'NE', pos: 'RB', salary: 5900, opp: '@ NYJ', avg: 9.94, notes: 'Smash spot VALUE' },
  { name: 'Jaxon Smith-Njigba', team: 'SEA', pos: 'WR', salary: 8600, opp: '@ CAR', avg: 23.82, notes: 'CHALK - target hog' },
  { name: "Ja'Marr Chase", team: 'CIN', pos: 'WR', salary: 8300, opp: 'vs ARI', avg: 20.50, notes: 'Smash spot, Burrow stack' },
  { name: 'A.J. Brown', team: 'PHI', pos: 'WR', salary: 7000, opp: '@ BUF', avg: 15.96, notes: 'Hurts stack option' },
  { name: 'Tee Higgins', team: 'CIN', pos: 'WR', salary: 6300, opp: 'vs ARI', avg: 14.31, notes: 'Burrow stack WR2' },
  { name: 'Stefon Diggs', team: 'NE', pos: 'WR', salary: 5800, opp: '@ NYJ', avg: 12.86, notes: 'SMASH vs Jets secondary' },
  { name: 'Marvin Harrison Jr.', team: 'ARI', pos: 'WR', salary: 5400, opp: '@ CIN', avg: 11.62, notes: 'Bounce back spot' },
  { name: 'Brian Thomas Jr.', team: 'JAX', pos: 'WR', salary: 5200, opp: '@ IND', avg: 10.25, notes: 'VALUE - Lawrence stack' },
  { name: 'Khalil Shakir', team: 'BUF', pos: 'WR', salary: 5100, opp: 'vs PHI', avg: 10.73, notes: 'Safe floor, Allen stack' },
  { name: 'Kayshon Boutte', team: 'NE', pos: 'WR', salary: 4600, opp: '@ NYJ', avg: 9.44, notes: 'Smash spot value' },
  { name: 'Trey McBride', team: 'ARI', pos: 'TE', salary: 7500, opp: '@ CIN', avg: 19.19, notes: 'ELITE - 10+ targets weekly' },
  { name: 'Brock Bowers', team: 'LV', pos: 'TE', salary: 5500, opp: 'vs NYG', avg: 15.18, notes: 'Rookie stud' },
  { name: 'Hunter Henry', team: 'NE', pos: 'TE', salary: 4500, opp: '@ NYJ', avg: 10.49, notes: 'SMASH spot value' },
  { name: 'Dallas Goedert', team: 'PHI', pos: 'TE', salary: 4300, opp: '@ BUF', avg: 12.74, notes: 'Hurts stack' },
  { name: 'Dalton Kincaid', team: 'BUF', pos: 'TE', salary: 4100, opp: 'vs PHI', avg: 11.30, notes: 'Allen stack option' },
  { name: 'Patriots DST', team: 'NE', pos: 'DST', salary: 3900, opp: '@ NYJ', avg: 7.20, notes: 'SMASH - Jets tanking' },
  { name: 'Seahawks DST', team: 'SEA', pos: 'DST', salary: 3700, opp: '@ CAR', avg: 10.47, notes: 'Good matchup' },
  { name: 'Jaguars DST', team: 'JAX', pos: 'DST', salary: 3400, opp: '@ IND', avg: 8.27, notes: 'Colts eliminated' },
  { name: 'Steelers DST', team: 'PIT', pos: 'DST', salary: 3300, opp: '@ CLE', avg: 7.67, notes: 'Browns bad' },
  { name: 'Bills DST', team: 'BUF', pos: 'DST', salary: 3000, opp: 'vs PHI', avg: 6.67, notes: 'Risky ceiling' },
  { name: 'Eagles DST', team: 'PHI', pos: 'DST', salary: 2600, opp: '@ BUF', avg: 7.87, notes: 'Cheap punt' },
];

const SHOWDOWN_PLAYERS = [
  { name: 'Christian McCaffrey', team: 'SF', pos: 'RB', slot: 'CPT', salary: 17700, avg: 25.72, notes: 'CHALK - Bears 32nd run D' },
  { name: 'Brock Purdy', team: 'SF', pos: 'QB', slot: 'CPT', salary: 15900, avg: 21.18, notes: 'Correlates with CMC' },
  { name: 'Caleb Williams', team: 'CHI', pos: 'QB', slot: 'CPT', salary: 15000, avg: 19.07, notes: 'CONTRARIAN - Upset narrative' },
  { name: 'George Kittle', team: 'SF', pos: 'TE', slot: 'CPT', salary: 13500, avg: 15.66, notes: 'Red zone monster' },
  { name: 'Rome Odunze', team: 'CHI', pos: 'WR', slot: 'CPT', salary: 13200, avg: 12.68, notes: 'Caleb favorite target' },
  { name: 'Jauan Jennings', team: 'SF', pos: 'WR', slot: 'CPT', salary: 12900, avg: 11.89, notes: 'Target share up' },
  { name: 'DJ Moore', team: 'CHI', pos: 'WR', slot: 'CPT', salary: 12600, avg: 11.16, notes: 'Volume play' },
  { name: "D'Andre Swift", team: 'CHI', pos: 'RB', slot: 'CPT', salary: 12000, avg: 15.14, notes: 'Receiving + rushing' },
  { name: 'Christian McCaffrey', team: 'SF', pos: 'RB', slot: 'FLEX', salary: 11800, avg: 25.72, notes: 'CHALK - Bears 32nd run D' },
  { name: 'Brock Purdy', team: 'SF', pos: 'QB', slot: 'FLEX', salary: 10600, avg: 21.18, notes: 'Elite efficiency' },
  { name: 'Caleb Williams', team: 'CHI', pos: 'QB', slot: 'FLEX', salary: 10000, avg: 19.07, notes: 'Rushing upside' },
  { name: 'George Kittle', team: 'SF', pos: 'TE', slot: 'FLEX', salary: 9000, avg: 15.66, notes: 'Red zone target' },
  { name: 'Rome Odunze', team: 'CHI', pos: 'WR', slot: 'FLEX', salary: 8800, avg: 12.68, notes: 'WR1 role' },
  { name: 'Jauan Jennings', team: 'SF', pos: 'WR', slot: 'FLEX', salary: 8600, avg: 11.89, notes: 'Target share up' },
  { name: 'DJ Moore', team: 'CHI', pos: 'WR', slot: 'FLEX', salary: 8400, avg: 11.16, notes: 'Volume play' },
  { name: "D'Andre Swift", team: 'CHI', pos: 'RB', slot: 'FLEX', salary: 8000, avg: 15.14, notes: 'Dual-threat' },
  { name: 'Deebo Samuel', team: 'SF', pos: 'WR', slot: 'FLEX', salary: 7200, avg: 10.45, notes: 'Gadget plays' },
  { name: 'Ricky Pearsall', team: 'SF', pos: 'WR', slot: 'FLEX', salary: 5800, avg: 8.33, notes: 'Deep threat' },
  { name: 'Roschon Johnson', team: 'CHI', pos: 'RB', slot: 'FLEX', salary: 5200, avg: 6.41, notes: 'Swift backup' },
  { name: 'Cole Kmet', team: 'CHI', pos: 'TE', slot: 'FLEX', salary: 4600, avg: 8.69, notes: 'VALUE - Cheap TE' },
  { name: 'Isaac Guerendo', team: 'SF', pos: 'RB', slot: 'FLEX', salary: 4800, avg: 5.88, notes: 'CMC backup' },
  { name: 'Bears DST', team: 'CHI', pos: 'DST', slot: 'FLEX', salary: 3400, avg: 6.93, notes: 'Fade SF narrative' },
  { name: '49ers DST', team: 'SF', pos: 'DST', slot: 'FLEX', salary: 3200, avg: 5.87, notes: 'Home favorite' },
  { name: 'Eric Saubert', team: 'SF', pos: 'TE', slot: 'FLEX', salary: 2800, avg: 3.22, notes: 'MIN SALARY PUNT' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [slateType, setSlateType] = useState('main');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const welcome = slateType === 'showdown'
      ? `GRIDLOCK AI locked in on **SNF Showdown** — Bears @ 49ers!\n\n**Rules:** 1 Captain (1.5x pts) + 5 FLEX | $50K cap\n**Game:** CHI @ SF | SF -3 | O/U 47.5\n\n🏆 **Chalk CPT:** CMC ($17,700)\n🎲 **Contrarian:** Caleb ($15,000)\n💰 **Punts:** Kmet ($4,600), Saubert ($2,800)\n\nWinning lineup ceiling: 180-220+ pts\n\nWant a **cash** or **GPP** lineup?`
      : `GRIDLOCK AI ready for **Week 17 Main Slate**!\n\n**Format:** Classic | $50K cap | 1QB/2RB/3WR/1TE/1FLEX/1DST\n\n🔥 **Top Stacks:**\n• JAX Stack (Lawrence + Etienne + BTJ)\n• NE Smash (Maye + Diggs + Stevenson)\n• CIN Shootout (Burrow + Chase + Higgins)\n\nWhat do you need? **Lineup builds, player analysis, or betting picks?**`;
    setMessages([{ role: 'assistant', content: welcome }]);
    setHistory([]);
  }, [slateType]);

  const callAPI = async (msgs) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs, slateType })
      });
      const data = await res.json();
      return data.response || 'Error getting response';
    } catch (e) {
      return 'Connection error. Please try again.';
    }
  };

  const fetchPlayerInfo = async (player) => {
    setLoadingPlayer(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Give me a quick breakdown on ${player.name} (${player.team} ${player.pos}) for DFS this week. Include: recent performance, this week's matchup, and DFS verdict.` }],
          slateType,
          playerLookup: true
        })
      });
      const data = await res.json();
      setPlayerInfo(data.response || 'Could not fetch player info');
    } catch (e) {
      setPlayerInfo('Error fetching player info');
    }
    setLoadingPlayer(false);
  };

  useEffect(() => {
    if (selectedPlayer) {
      fetchPlayerInfo(selectedPlayer);
    } else {
      setPlayerInfo(null);
    }
  }, [selectedPlayer]);

  const send = async () => {
    if (!input.trim()) return;
    const newHistory = [...history, { role: 'user', content: input }];
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setHistory(newHistory);
    setInput('');
    setIsTyping(true);
    const response = await callAPI(newHistory);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setHistory(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const quickPrompts = slateType === 'showdown'
    ? ['Build GPP lineup', 'CMC or Caleb Captain?', 'Value FLEX plays']
    : ['Build GPP lineup', 'Best spread bets', 'Break down JAX @ IND'];

  const renderContent = (content) => content.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => p.startsWith('**') && p.endsWith('**') ? <strong key={j} style={{color:'#fff'}}>{p.slice(2,-2)}</strong> : p);
    if (line.trim().match(/^[•\-\*]/)) return <div key={i} style={{paddingLeft:'12px',marginBottom:'4px',display:'flex',gap:'8px'}}><span style={{color:slateType==='showdown'?'#ffaa00':'#00ff88'}}>•</span><span>{parts}</span></div>;
    return <p key={i} style={{margin:line===''?'8px 0':'4px 0'}}>{parts}</p>;
  });

  const accent = slateType === 'showdown' ? '#ffaa00' : '#00ff88';

  // Player Card Component
  const PlayerCard = ({ player, showSlot }) => (
    <div
      onClick={() => setSelectedPlayer(player)}
      style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:showSlot && player.slot==='CPT'?'rgba(255,170,0,0.05)':'rgba(255,255,255,0.03)',border:showSlot && player.slot==='CPT'?'1px solid rgba(255,170,0,0.1)':'1px solid rgba(255,255,255,0.05)',borderRadius:'10px',marginBottom:'6px',cursor:'pointer',transition:'all 0.2s'}}
      onMouseEnter={e => e.currentTarget.style.background = showSlot && player.slot==='CPT'?'rgba(255,170,0,0.1)':'rgba(255,255,255,0.08)'}
      onMouseLeave={e => e.currentTarget.style.background = showSlot && player.slot==='CPT'?'rgba(255,170,0,0.05)':'rgba(255,255,255,0.03)'}
    >
      <div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontWeight:'600',fontSize:'14px'}}>{player.name}</span>
          <span style={{color:slateType==='showdown'?(player.team==='SF'?'#c9a227':'#f26522'):'rgba(255,255,255,0.4)',fontSize:'10px',background:slateType==='showdown'?(player.team==='SF'?'rgba(201,162,39,0.15)':'rgba(242,101,34,0.15)'):'rgba(255,255,255,0.05)',padding:'2px 8px',borderRadius:'4px',fontWeight:'600'}}>{player.team}</span>
          {player.opp && <span style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>{player.opp}</span>}
        </div>
        <p style={{margin:'4px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{player.notes}</p>
      </div>
      <div style={{textAlign:'right'}}>
        <span style={{color:accent,fontSize:'14px',fontWeight:'700'}}>${player.salary?.toLocaleString()}</span>
        <p style={{margin:'2px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>{showSlot && player.slot==='CPT' ? `${(player.avg*1.5).toFixed(1)} pt ceil` : `${player.avg} avg`}</p>
      </div>
      <div style={{marginLeft:'8px',color:'rgba(255,255,255,0.3)',fontSize:'16px'}}>›</div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0a0f 0%,#1a1a2e 50%,#0f0f1a 100%)',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif'}}>

      {/* Player Modal */}
      {selectedPlayer && (
        <div onClick={() => setSelectedPlayer(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{background:'linear-gradient(145deg,#1a1a2e,#16213e)',borderRadius:'16px',maxWidth:'500px',width:'100%',maxHeight:'80vh',overflow:'auto',border:`1px solid ${accent}44`}} onClick={e => e.stopPropagation()}>
            <div style={{padding:'20px',borderBottom:`1px solid ${accent}22`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
                <div>
                  <h2 style={{margin:0,fontSize:'20px'}}>{selectedPlayer.name}</h2>
                  <p style={{margin:'4px 0 0',color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>{selectedPlayer.team} • {selectedPlayer.pos} • {selectedPlayer.opp || (slateType==='showdown'?'CHI @ SF':'')}</p>
                </div>
                <div style={{textAlign:'right'}}>
                  <span style={{color:accent,fontSize:'20px',fontWeight:'700'}}>${selectedPlayer.salary?.toLocaleString()}</span>
                  <p style={{margin:'4px 0 0',color:'rgba(255,255,255,0.5)',fontSize:'12px'}}>{selectedPlayer.avg} FPPG</p>
                </div>
              </div>
            </div>
            <div style={{padding:'20px'}}>
              {loadingPlayer ? (
                <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.5)'}}>
                  <div style={{width:'24px',height:'24px',border:`2px solid ${accent}`,borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 12px'}}></div>
                  Fetching player intel...
                </div>
              ) : playerInfo ? (
                <div style={{fontSize:'13px',lineHeight:'1.7'}}>{renderContent(playerInfo)}</div>
              ) : null}
            </div>
            <div style={{padding:'16px 20px',borderTop:`1px solid ${accent}22`,textAlign:'right'}}>
              <button onClick={() => setSelectedPlayer(null)} style={{background:accent,color:'#000',border:'none',padding:'10px 24px',borderRadius:'8px',fontWeight:'600',cursor:'pointer'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{background:'rgba(0,0,0,0.3)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'36px',height:'36px',background:`linear-gradient(135deg,${accent},${slateType==='showdown'?'#cc8800':'#00aa55'})`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🏈</div>
          <div>
            <h1 style={{margin:0,fontSize:'18px',fontWeight:'700',letterSpacing:'-0.5px'}}>GRIDLOCK AI</h1>
            <p style={{margin:0,fontSize:'11px',color:'rgba(255,255,255,0.4)',letterSpacing:'0.5px'}}>NFL WEEK 17 • {slateType==='showdown'?'SNF SHOWDOWN':'MAIN SLATE'}</p>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={()=>setSlateType('main')} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:slateType==='main'?'#00ff88':'rgba(255,255,255,0.05)',color:slateType==='main'?'#000':'#fff',fontWeight:'600',fontSize:'12px',cursor:'pointer'}}>MAIN</button>
          <button onClick={()=>setSlateType('showdown')} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:slateType==='showdown'?'#ffaa00':'rgba(255,255,255,0.05)',color:slateType==='showdown'?'#000':'#fff',fontWeight:'600',fontSize:'12px',cursor:'pointer'}}>SHOWDOWN</button>
        </div>
        <div style={{display:'flex',gap:'4px'}}>
          {['chat','games','dfs'].map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{padding:'8px 14px',borderRadius:'6px',border:'none',background:activeTab===t?'rgba(255,255,255,0.1)':'transparent',color:activeTab===t?'#fff':'rgba(255,255,255,0.5)',fontWeight:'500',fontSize:'12px',cursor:'pointer',textTransform:'uppercase'}}>{t}</button>
          ))}
        </div>
      </header>

      <main style={{maxWidth:activeTab==='chat'?'850px':'1100px',margin:'0 auto',padding:'16px',height:'calc(100vh - 70px)',display:'flex',flexDirection:'column'}}>
        {activeTab === 'chat' ? (<>
          <div style={{flex:1,overflow:'auto',paddingBottom:'16px'}}>
            {messages.map((msg,i) => (
              <div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',marginBottom:'12px'}}>
                <div style={{maxWidth:'85%'}}>
                  <div style={{padding:'14px 18px',borderRadius:msg.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',background:msg.role==='user'?`linear-gradient(135deg,${slateType==='showdown'?'#aa7700':'#00aa55'},${slateType==='showdown'?'#886600':'#008844'})`:'rgba(255,255,255,0.05)',border:msg.role==='user'?'none':'1px solid rgba(255,255,255,0.08)',fontSize:'13px',lineHeight:'1.6'}}>{renderContent(msg.content)}</div>
                  {msg.role === 'assistant' && (
                    <SalaryValidator
                      validation={computeLineupValidation(msg.content, slateType === 'showdown')}
                      accent={accent}
                    />
                  )}
                </div>
              </div>
            ))}
            {isTyping && <div style={{display:'flex',gap:'4px',padding:'12px'}}><span style={{width:'8px',height:'8px',background:accent,borderRadius:'50%',animation:'pulse 1s infinite'}}></span><span style={{width:'8px',height:'8px',background:accent,borderRadius:'50%',animation:'pulse 1s infinite 0.2s'}}></span><span style={{width:'8px',height:'8px',background:accent,borderRadius:'50%',animation:'pulse 1s infinite 0.4s'}}></span></div>}
            <div ref={messagesEndRef} />
          </div>
          <div style={{display:'flex',gap:'8px',marginBottom:'12px',flexWrap:'wrap'}}>
            {quickPrompts.map((p,i)=>(<button key={i} onClick={()=>setInput(p)} style={{padding:'8px 14px',borderRadius:'20px',border:`1px solid ${accent}44`,background:'transparent',color:accent,fontSize:'12px',cursor:'pointer',transition:'all 0.2s'}}>{p}</button>))}
          </div>
          <div style={{display:'flex',gap:'12px'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder={slateType==='showdown'?'Ask about Showdown strategy...':'Ask about lineups, props, spreads...'} style={{flex:1,padding:'14px 18px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.03)',color:'#fff',fontSize:'14px',outline:'none'}} />
            <button onClick={send} style={{padding:'14px 24px',borderRadius:'12px',border:'none',background:`linear-gradient(135deg,${accent},${slateType==='showdown'?'#cc8800':'#00aa55'})`,color:'#000',fontWeight:'600',cursor:'pointer'}}>Send</button>
          </div>
        </>) : activeTab === 'games' ? (
          <div style={{overflow:'auto'}}>
            <h2 style={{fontSize:'12px',color:accent,letterSpacing:'2px',marginBottom:'16px'}}>WEEK 17 GAMES</h2>
            {SUNDAY_GAMES.map(g => (
              <div key={g.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'12px',padding:'16px',marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                  <span style={{fontWeight:'700',fontSize:'16px'}}>{g.away} @ {g.home}</span>
                  <span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>{g.time}</span>
                </div>
                <div style={{display:'flex',gap:'16px',fontSize:'13px',color:'rgba(255,255,255,0.6)'}}>
                  <span style={{color:accent}}>{g.spread}</span>
                  <span>O/U {g.total}</span>
                  <span>{g.awayRecord} vs {g.homeRecord}</span>
                </div>
                <p style={{margin:'8px 0 0',fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{g.playoff}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{overflow:'auto'}}>
            <div style={{background:`linear-gradient(135deg,${accent}11,transparent)`,border:`1px solid ${accent}33`,borderRadius:'8px',padding:'10px 14px',marginBottom:'16px',fontSize:'12px',color:accent}}>
              💡 Tap any player for detailed analysis, news & stats
            </div>
            {slateType==='showdown'?(<>
              <h2 style={{fontSize:'12px',color:'#ffaa00',letterSpacing:'2px',marginBottom:'16px'}}>SHOWDOWN PLAYER POOL</h2>
              <h3 style={{fontSize:'11px',color:'#ffaa00',marginBottom:'10px'}}>👑 CAPTAIN OPTIONS (1.5x)</h3>
              {SHOWDOWN_PLAYERS.filter(p=>p.slot==='CPT').map(p=>(<PlayerCard key={`c-${p.name}`} player={p} showSlot={true} />))}
              <h3 style={{fontSize:'11px',color:'#00ff88',marginTop:'16px',marginBottom:'10px'}}>⚡ FLEX OPTIONS</h3>
              {SHOWDOWN_PLAYERS.filter(p=>p.slot==='FLEX').map(p=>(<PlayerCard key={`f-${p.name}`} player={p} showSlot={false} />))}
            </>):(<>
              <h2 style={{fontSize:'12px',color:'#00ff88',letterSpacing:'2px',marginBottom:'16px'}}>DFS PLAYER POOL</h2>
              {['QB','RB','WR','TE','DST'].map(pos=>(<div key={pos} style={{marginBottom:'20px'}}>
                <h3 style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginBottom:'10px',letterSpacing:'1px'}}>{pos==='QB'?'QUARTERBACKS':pos==='RB'?'RUNNING BACKS':pos==='WR'?'WIDE RECEIVERS':pos==='TE'?'TIGHT ENDS':'DEFENSE/ST'}</h3>
                {DFS_PLAYERS.filter(p=>p.pos===pos).map(p=>(<PlayerCard key={p.name} player={p} showSlot={false} />))}
              </div>))}
            </>)}
          </div>
        )}
      </main>

      <style>{`::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}::-webkit-scrollbar-thumb{background:${accent}33;border-radius:3px}input::placeholder{color:rgba(255,255,255,0.3)}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
