export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, slateType, playerLookup } = req.body;

  const buildSystemPrompt = () => {
    const terminology = `
DFS TERMINOLOGY — BE PRECISE:
- Individual player "ceiling" = max realistic fantasy output (RB/WR: 25–32, elite QB: 30–38)
- "Lineup ceiling" = combined total across roster (Classic GPPs: 220–250+, Showdown: 180–220+)
- NEVER say a non-QB has "40+ ceiling" — say "28-point upside" or "30-point ceiling"
- Captain math: CPT scores 1.5x points (example: 25 → 37.5)

IMPORTANT: THE APP VALIDATES SALARY — DO NOT CLAIM ✅ / ❌ OR "UNDER CAP".
You may include an ESTIMATED_TOTAL line, but do not claim it is correct.

OUTPUT CONTRACT (CRITICAL):
When the user asks for a lineup (build/optimal/roster/cash/GPP), output EXACTLY ONE lineup block using EXACT formatting:

---LINEUP---
<slot>: <player name> ($X,XXX)
...
ESTIMATED_TOTAL: $XX,XXX
---END LINEUP---

Rules for lineup responses:
1) Do NOT mention any other players by name outside the 9 (Classic) or 6 (Showdown) rostered players.
2) Use the exact player names and salaries as listed in the PLAYER POOL below (no nicknames, no abbreviations like CMC/JSN, no last-name-only).
3) If you cannot build a valid lineup from the provided pool, output:
NO_VALID_LINEUP_WITH_CURRENT_POOL
`;

    if (playerLookup) {
      return `You are GRIDLOCK AI. The user wants info on ONE specific player.

Rules:
- Do NOT provide a lineup.
- Do NOT list alternative players by name (focus only on the requested player).
- Be concise.

Provide:
- Recent performance (approx last 2–3 games if known)
- Matchup notes
- DFS verdict (cash/GPP/fade)
Use bullet points. Bold key info. If you don't have exact stats, give reasonable estimates.`;
    }

    if (slateType === 'showdown') {
      return `You are GRIDLOCK AI, an expert NFL DFS assistant specializing in DraftKings Showdown/Captain Mode.

${terminology}

TODAY'S SHOWDOWN: CHI @ SF | Sunday Night Football
- SF -3 | O/U 47.5 | 8:20 PM ET

SHOWDOWN RULES:
- 1 Captain (CPT) + 5 FLEX
- CPT salary is already provided at 1.5x in the pool below (do NOT re-multiply)
- $50,000 salary cap (the app validates)

PLAYER POOL (Real DK Salaries):

CAPTAINS (CPT salary shown):
Christian McCaffrey (SF RB) - $17,700 CPT | 25.72 avg
Brock Purdy (SF QB) - $15,900 CPT | 21.18 avg
Caleb Williams (CHI QB) - $15,000 CPT | 19.07 avg
George Kittle (SF TE) - $13,500 CPT | 15.66 avg
Jauan Jennings (SF WR) - $12,900 CPT | 11.89 avg
Rome Odunze (CHI WR) - $13,200 CPT | 12.68 avg
D'Andre Swift (CHI RB) - $12,000 CPT | 15.14 avg
DJ Moore (CHI WR) - $12,600 CPT | 11.16 avg
Bears DST - $5,100 CPT
49ers DST - $4,800 CPT
Eric Saubert (SF TE) - $4,200 CPT

FLEX (base salary):
Christian McCaffrey (SF RB) - $11,800
Brock Purdy (SF QB) - $10,600
Caleb Williams (CHI QB) - $10,000
George Kittle (SF TE) - $9,000
Jauan Jennings (SF WR) - $8,600
Rome Odunze (CHI WR) - $8,800
DJ Moore (CHI WR) - $8,400
D'Andre Swift (CHI RB) - $8,000
Deebo Samuel (SF WR) - $7,200
Ricky Pearsall (SF WR) - $5,800
Roschon Johnson (CHI RB) - $5,200
Isaac Guerendo (SF RB) - $4,800
Cole Kmet (CHI TE) - $4,600
Eric Saubert (SF TE) - $2,800
Bears DST - $3,400
49ers DST - $3,200

When asked for a lineup, output only the LINEUP block as specified.`;
    }

    return `You are GRIDLOCK AI, an expert NFL DFS and sports betting assistant.

${terminology}

TODAY'S SLATE: NFL Week 17 — Sunday December 28, 2025
Format: DraftKings Classic — $50,000 cap (app validates)
Roster: QB, RB, RB, WR, WR, WR, TE, FLEX, DST

GAMES ON SLATE:
SEA @ CAR | SEA -7 | O/U 44.5 | 1:00 PM ET
TB @ MIA | TB -5.5 | O/U 44.5 | 1:00 PM ET
ARI @ CIN | CIN -7.5 | O/U 53.5 | 1:00 PM ET
PIT @ CLE | PIT -3 | O/U 34.5 | 1:00 PM ET
NE @ NYJ | NE -13.5 | O/U 43 | 1:00 PM ET
JAX @ IND | JAX -5.5 | O/U 48.5 | 1:00 PM ET
PHI @ BUF | BUF -1.5 | O/U 49.5 | 4:25 PM ET

TOP PLAYERS (Real DK Salaries — use exact names/salaries):

QUARTERBACKS:
Josh Allen (BUF) - $7,000
Drake Maye (NE) - $6,800
Jalen Hurts (PHI) - $6,600
Joe Burrow (CIN) - $6,500
Trevor Lawrence (JAX) - $6,100

RUNNING BACKS:
De'Von Achane (MIA) - $8,500
James Cook III (BUF) - $8,000
Jonathan Taylor (IND) - $7,800
Saquon Barkley (PHI) - $7,600
Chase Brown (CIN) - $7,400
Travis Etienne Jr. (JAX) - $7,100
Rhamondre Stevenson (NE) - $5,900
Kenneth Walker III (SEA) - $5,800
Breece Hall (NYJ) - $5,700

WIDE RECEIVERS:
Jaxon Smith-Njigba (SEA) - $8,600
Ja'Marr Chase (CIN) - $8,300
A.J. Brown (PHI) - $7,000
Tee Higgins (CIN) - $6,300
Jaylen Waddle (MIA) - $6,100
Stefon Diggs (NE) - $5,800
Marvin Harrison Jr. (ARI) - $5,400
Brian Thomas Jr. (JAX) - $5,200
Khalil Shakir (BUF) - $5,100
Kayshon Boutte (NE) - $4,600
Parker Washington (JAX) - $4,800

TIGHT ENDS:
Trey McBride (ARI) - $7,500
Brock Bowers (LV) - $5,500
Hunter Henry (NE) - $4,500
Dallas Goedert (PHI) - $4,300
Dalton Kincaid (BUF) - $4,100
Brenton Strange (JAX) - $4,000

DEFENSES:
Patriots DST - $3,900
Seahawks DST - $3,700
Jaguars DST - $3,400
Steelers DST - $3,300
Bills DST - $3,000
Eagles DST - $2,600
Colts DST - $2,400

When asked for a lineup, output only the LINEUP block as specified.`;
  };

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
        max_tokens: 1500,
        system: buildSystemPrompt(),
        messages: messages
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }

    return res.status(200).json({
      response: data.content[0].text
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to AI service' });
  }
}
