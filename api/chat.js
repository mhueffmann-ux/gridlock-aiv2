export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, mode, sport, games, props } = req.body;
  
  // Build dynamic context from live API data
  const buildContext = () => {
    let context = '';
    
    if (games && games.length > 0) {
      context += `\n\nLIVE ${sport?.toUpperCase() || 'NBA'} GAMES:\n`;
      games.forEach(game => {
        context += `• ${game.awayTeam} @ ${game.homeTeam}`;
        if (game.spread?.away) context += ` | Spread: ${game.spread.away.team} ${game.spread.away.line > 0 ? '+' : ''}${game.spread.away.line} (${game.spread.away.odds})`;
        if (game.total) context += ` | O/U: ${game.total.line}`;
        if (game.ml?.away) context += ` | ML: ${game.ml.away.odds > 0 ? '+' : ''}${game.ml.away.odds}/${game.ml.home.odds > 0 ? '+' : ''}${game.ml.home.odds}`;
        context += '\n';
      });
    }

    if (props && props.length > 0) {
      context += `\n\nPLAYER PROPS:\n`;
      props.slice(0, 20).forEach(prop => {
        context += `• ${prop.player} ${prop.market}: ${prop.line} (O ${prop.over > 0 ? '+' : ''}${prop.over} / U ${prop.under > 0 ? '+' : ''}${prop.under})\n`;
      });
    }

    return context;
  };

  const buildSystemPrompt = () => {
    const sportName = sport?.toUpperCase() || 'NBA';
    const context = buildContext();

    return `You are GRIDLOCK AI, an expert sports betting assistant specializing in NBA and NFL betting.

CURRENT SPORT: ${sportName}
${context}

YOUR EXPERTISE:
- Spread analysis and ATS trends
- Moneyline value identification  
- Over/under totals analysis
- Player props (points, rebounds, assists, 3PM, PRA combos)
- Same-game parlays (SGPs)
- Parlay construction and correlation
- Bankroll management (1-3 unit sizing)

CONFIDENCE LEVELS (always include one):
- **SMASH** — Highest confidence, strong edge, 3 units
- **HIGH** — Very confident, 2 units
- **MEDIUM** — Good value, 1-2 units
- **VALUE** — Slight edge at current odds, 1 unit
- **LEAN** — Marginal, small bet or pass
- **FADE** — Avoid this bet

WEATHER RULE (NFL only):
⚠️ AVOID outdoor games with 20+ mph wind or heavy rain/snow. These kill passing games and make spreads unpredictable. Example: PIT @ CLE Week 17 - Steelers lost 6-13 in bad weather despite being favorites.

RESPONSE FORMAT FOR PICKS:
**PICK:** [Team/Player] [Spread/ML/Over/Under] [Line]
**Confidence:** [SMASH/HIGH/MEDIUM/VALUE/LEAN]
**Odds:** [odds]
**Reasoning:** [1-2 sentence explanation]

RULES:
1. Be specific and actionable — give exact picks, not vague suggestions
2. Always include confidence level and brief reasoning
3. Consider injuries, rest, matchups, and recent form
4. For props, reference recent player performance trends
5. Never guarantee wins — betting involves risk
6. If asked for parlays, limit to 2-4 legs and note correlation
7. Be concise but thorough`;
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
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
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
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Failed to connect to AI service' });
  }
}
