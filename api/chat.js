export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, slateType } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages required' });
  }

  const systemPrompt = buildSystemPrompt(slateType || 'main');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.[0]?.text || 'Error generating response';
    return res.status(200).json({ response: text });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to connect to Claude API' });
  }
}

function buildSystemPrompt(slateType) {
  const terminology = `
DFS TERMINOLOGY - BE PRECISE:
- Individual "ceiling" = max realistic output (RB/WR: 25-32 pts, elite QB: 30-38 pts)
- "Lineup ceiling" = combined total (Classic GPPs: 220-250+, Showdown: 180-220+)
- NEVER say non-QB has "40+ ceiling" - say "28-point upside" or "30-point ceiling"
- Captain math: 25-pt player = 37.5 as CPT (1.5x)
- Always clarify: individual ceiling vs lineup ceiling`;

  const SUNDAY_GAMES = [
    { away: 'SEA', home: 'CAR', spread: 'SEA -7', total: 44.5, playoff: 'SEA fighting for #1 seed.' },
    { away: 'TB', home: 'MIA', spread: 'TB -5.5', total: 44.5, playoff: 'TB must win for NFC South.' },
    { away: 'ARI', home: 'CIN', spread: 'CIN -7.5', total: 53.5, playoff: 'HIGHEST TOTAL - Shootout.' },
    { away: 'PIT', home: 'CLE', spread: 'PIT -3', total: 34.5, playoff: 'PIT clinches AFC North with win.' },
    { away: 'NE', home: 'NYJ', spread: 'NE -13.5', total: 43, playoff: 'SMASH SPOT vs tanking Jets.' },
    { away: 'JAX', home: 'IND', spread: 'JAX -5.5', total: 48.5, playoff: 'JAX clinches. Lawrence ON FIRE!' },
    { away: 'PHI', home: 'BUF', spread: 'BUF -1.5', total: 49.5, playoff: 'Playoff preview.' },
  ];

  const DFS_PLAYERS = [
    { name: 'Josh Allen', team: 'BUF', pos: 'QB', salary: 7000, opp: 'vs PHI', avg: 24.16, notes: 'Highest ceiling QB' },
    { name: 'Trevor Lawrence', team: 'JAX', pos: 'QB', salary: 6100, opp: '@ IND', avg: 20.58, notes: 'BEST VALUE - 10 TDs last 2 games' },
    { name: 'Joe Burrow', team: 'CIN', pos: 'QB', salary: 6500, opp: 'vs ARI', avg: 16.65, notes: '53.5 total shootout' },
    { name: 'Drake Maye', team: 'NE', pos: 'QB', salary: 6800, opp: '@ NYJ', avg: 21.18, notes: 'Smash spot vs Jets' },
    { name: "De'Von Achane", team: 'MIA', pos: 'RB', salary: 8500, opp: 'vs TB', avg: 21.37, notes: '28-pt ceiling' },
    { name: 'James Cook III', team: 'BUF', pos: 'RB', salary: 8000, opp: 'vs PHI', avg: 21.47, notes: 'TD upside' },
    { name: 'Travis Etienne Jr.', team: 'JAX', pos: 'RB', salary: 7100, opp: '@ IND', avg: 16.26, notes: 'Stack with Lawrence' },
    { name: 'Chase Brown', team: 'CIN', pos: 'RB', salary: 7400, opp: 'vs ARI', avg: 16.03, notes: 'High total game' },
    { name: 'Jaxon Smith-Njigba', team: 'SEA', pos: 'WR', salary: 8600, opp: '@ CAR', avg: 23.82, notes: 'CHALK' },
    { name: "Ja'Marr Chase", team: 'CIN', pos: 'WR', salary: 8300, opp: 'vs ARI', avg: 20.50, notes: 'Smash spot' },
    { name: 'Brian Thomas Jr.', team: 'JAX', pos: 'WR', salary: 5200, opp: '@ IND', avg: 10.25, notes: 'VALUE' },
    { name: 'Stefon Diggs', team: 'NE', pos: 'WR', salary: 5800, opp: '@ NYJ', avg: 12.86, notes: 'Smash spot' },
    { name: 'Trey McBride', team: 'ARI', pos: 'TE', salary: 7500, opp: '@ CIN', avg: 19.19, notes: 'ELITE targets' },
    { name: 'Hunter Henry', team: 'NE', pos: 'TE', salary: 4500, opp: '@ NYJ', avg: 10.49, notes: 'VALUE' },
  ];

  const SHOWDOWN_PLAYERS = [
    { name: 'Christian McCaffrey', team: 'SF', pos: 'RB', slot: 'CPT', salary: 17700, avg: 25.72, notes: 'CHALK - Bears 32nd run D' },
    { name: 'Brock Purdy', team: 'SF', pos: 'QB', slot: 'CPT', salary: 15900, avg: 21.18, notes: 'Correlates with CMC' },
    { name: 'Caleb Williams', team: 'CHI', pos: 'QB', slot: 'CPT', salary: 15000, avg: 19.07, notes: 'CONTRARIAN' },
    { name: 'George Kittle', team: 'SF', pos: 'TE', slot: 'CPT', salary: 13500, avg: 15.66, notes: 'Red zone monster' },
    { name: 'Rome Odunze', team: 'CHI', pos: 'WR', slot: 'CPT', salary: 13200, avg: 12.68, notes: 'Caleb favorite' },
    { name: "D'Andre Swift", team: 'CHI', pos: 'RB', slot: 'CPT', salary: 12000, avg: 15.14, notes: 'Dual-threat' },
    { name: 'Christian McCaffrey', team: 'SF', pos: 'RB', slot: 'FLEX', salary: 11800, avg: 25.72, notes: 'CHALK' },
    { name: 'Brock Purdy', team: 'SF', pos: 'QB', slot: 'FLEX', salary: 10600, avg: 21.18, notes: 'Elite efficiency' },
    { name: 'Caleb Williams', team: 'CHI', pos: 'QB', slot: 'FLEX', salary: 10000, avg: 19.07, notes: 'Rushing upside' },
    { name: 'George Kittle', team: 'SF', pos: 'TE', slot: 'FLEX', salary: 9000, avg: 15.66, notes: 'Red zone' },
    { name: 'Rome Odunze', team: 'CHI', pos: 'WR', slot: 'FLEX', salary: 8800, avg: 12.68, notes: 'WR1' },
    { name: 'DJ Moore', team: 'CHI', pos: 'WR', slot: 'FLEX', salary: 8400, avg: 11.16, notes: 'Volume' },
    { name: "D'Andre Swift", team: 'CHI', pos: 'RB', slot: 'FLEX', salary: 8000, avg: 15.14, notes: 'Dual-threat' },
    { name: 'Jauan Jennings', team: 'SF', pos: 'WR', slot: 'FLEX', salary: 8600, avg: 11.89, notes: 'Targets up' },
    { name: 'Colston Loveland', team: 'CHI', pos: 'TE', slot: 'FLEX', salary: 4800, avg: 8.69, notes: 'VALUE' },
    { name: 'Bears', team: 'CHI', pos: 'DST', slot: 'FLEX', salary: 3600, avg: 6.93, notes: 'Fade SF' },
    { name: 'Cole Kmet', team: 'CHI', pos: 'TE', slot: 'FLEX', salary: 2800, avg: 4.96, notes: 'PUNT' },
  ];

  if (slateType === 'showdown') {
    const players = SHOWDOWN_PLAYERS.map(p => `${p.name} (${p.pos}, ${p.team}) | ${p.slot} | $${p.salary} | ${p.avg} avg | ${p.notes}`).join('\n');
    return `You are GRIDLOCK AI, expert DFS assistant for DraftKings Captain Mode.

GAME: CHI (11-4) @ SF (11-4) | SF -3 | O/U 47.5 | 8:20 PM ET
STAKES: CHI clinches NFC North with win. SF fighting for #1 seed.

SHOWDOWN RULES: 1 Captain (1.5x pts & salary) + 5 FLEX. $50K cap.
Winning scores: 180-220+ points total lineup.

PLAYERS:
${players}

STRATEGY: CMC chalk CPT (~45% owned, 38.6 pt ceiling as CPT). Caleb contrarian ($2,700 savings). Kmet/Loveland punts.
${terminology}

Be confident. Show full lineups with salaries. Verify under $50K.`;
  }

  const games = SUNDAY_GAMES.map(g => `${g.away} @ ${g.home} | ${g.spread} | O/U ${g.total} | ${g.playoff}`).join('\n');
  const players = DFS_PLAYERS.map(p => `${p.name} (${p.pos}, ${p.team}) | $${p.salary} | ${p.opp} | ${p.avg} avg | ${p.notes}`).join('\n');

  return `You are GRIDLOCK AI, expert NFL DFS and betting assistant.

SLATE: NFL Week 17 | DraftKings Classic ($50K, 1QB/2RB/3WR/1TE/1FLEX/1DST)
Winning GPP scores: 220-250+ total lineup points.

GAMES:
${games}

PLAYERS:
${players}

KEY: Trevor Lawrence 10 TDs in 2 games vs eliminated Colts. CIN/ARI 53.5 shootout. NE -13.5 smash.
${terminology}

Be confident. Show full lineups with salaries under $50K.`;
}
