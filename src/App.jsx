import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// API CONFIGURATION
// ============================================================
const ODDS_API_KEY = '79a2b30d4997c3d4399958effcd00e2e';
const ODDS_API_BASE = 'https://api.the-odds-api.com/v4/sports';

// Sports configuration
const SPORTS = {
  nba: { key: 'basketball_nba', name: 'NBA', icon: '🏀', accent: '#f97316' },
  nfl: { key: 'americanfootball_nfl', name: 'NFL', icon: '🏈', accent: '#00ff88' },
};

// Prop markets to fetch
const PROP_MARKETS = [
  'player_points',
  'player_rebounds', 
  'player_assists',
  'player_threes',
  'player_points_rebounds_assists',
  'player_points_rebounds',
  'player_points_assists',
];

// ============================================================
// API FUNCTIONS
// ============================================================

// Fetch game odds from API
const fetchGameOdds = async (sportKey) => {
  try {
    const response = await fetch(
      `${ODDS_API_BASE}/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=spreads,h2h,totals&oddsFormat=american`
    );
    if (!response.ok) throw new Error('Failed to fetch odds');
    const data = await response.json();
    
    // Check remaining requests from headers
    const remaining = response.headers.get('x-requests-remaining');
    console.log(`API Requests Remaining: ${remaining}`);
    
    return { games: data, remaining: parseInt(remaining) || 0 };
  } catch (error) {
    console.error('Error fetching odds:', error);
    return { games: [], remaining: 0 };
  }
};

// Fetch player props for a specific event
const fetchPlayerProps = async (sportKey, eventId) => {
  try {
    const marketsParam = PROP_MARKETS.join(',');
    const response = await fetch(
      `${ODDS_API_BASE}/${sportKey}/events/${eventId}/odds?apiKey=${ODDS_API_KEY}&regions=us&markets=${marketsParam}&oddsFormat=american`
    );
    
    if (!response.ok) {
      // Props might not be available on free tier
      console.log('Props not available for this event or tier');
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching props:', error);
    return null;
  }
};

// ============================================================
// DATA PARSING
// ============================================================

// Parse game odds into cleaner format
const parseGameOdds = (game) => {
  const bookmaker = game.bookmakers?.[0];
  if (!bookmaker) return null;

  let spread = null, ml = null, total = null;

  bookmaker.markets.forEach(market => {
    if (market.key === 'spreads') {
      const homeSpread = market.outcomes.find(o => o.name === game.home_team);
      const awaySpread = market.outcomes.find(o => o.name === game.away_team);
      spread = {
        home: { team: game.home_team, line: homeSpread?.point, odds: homeSpread?.price },
        away: { team: game.away_team, line: awaySpread?.point, odds: awaySpread?.price },
      };
    }
    if (market.key === 'h2h') {
      const homeMl = market.outcomes.find(o => o.name === game.home_team);
      const awayMl = market.outcomes.find(o => o.name === game.away_team);
      ml = {
        home: { team: game.home_team, odds: homeMl?.price },
        away: { team: game.away_team, odds: awayMl?.price },
      };
    }
    if (market.key === 'totals') {
      const over = market.outcomes.find(o => o.name === 'Over');
      const under = market.outcomes.find(o => o.name === 'Under');
      total = { line: over?.point, over: over?.price, under: under?.price };
    }
  });

  return {
    id: game.id,
    homeTeam: game.home_team,
    awayTeam: game.away_team,
    startTime: new Date(game.commence_time),
    bookmaker: bookmaker.title,
    spread, ml, total,
  };
};

// Parse player props from API response
const parsePlayerProps = (propsData) => {
  if (!propsData?.bookmakers?.length) return [];
  
  const props = [];
  const bookmaker = propsData.bookmakers[0];
  
  bookmaker.markets.forEach(market => {
    const marketName = market.key.replace('player_', '').replace(/_/g, ' ').toUpperCase();
    
    market.outcomes.forEach(outcome => {
      props.push({
        player: outcome.description,
        market: marketName,
        type: outcome.name, // Over/Under
        line: outcome.point,
        odds: outcome.price,
        book: bookmaker.title,
      });
    });
  });
  
  // Group by player
  const grouped = {};
  props.forEach(prop => {
    const key = `${prop.player}-${prop.market}`;
    if (!grouped[key]) {
      grouped[key] = { player: prop.player, market: prop.market, over: null, under: null, line: prop.line };
    }
    if (prop.type === 'Over') grouped[key].over = prop.odds;
    if (prop.type === 'Under') grouped[key].under = prop.odds;
  });
  
  return Object.values(grouped);
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const formatOdds = (odds) => {
  if (!odds) return '-';
  return odds > 0 ? `+${odds}` : `${odds}`;
};

const formatSpread = (line) => {
  if (!line && line !== 0) return '-';
  return line > 0 ? `+${line}` : `${line}`;
};

const formatTime = (date) => {
  return date.toLocaleString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true 
  });
};

const getTimeUntil = (date) => {
  const now = new Date();
  const diff = date - now;
  if (diff < 0) return 'LIVE';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

// ============================================================
// MAIN APP COMPONENT
// ============================================================

export default function App() {
  const [activeSport, setActiveSport] = useState('nba');
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propsLoading, setPropsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [apiRemaining, setApiRemaining] = useState(null);
  const [error, setError] = useState(null);
  const [propsError, setPropsError] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [myPicks, setMyPicks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const sport = SPORTS[activeSport];
  const accent = sport.accent;

  // ============================================================
  // DATA LOADING
  // ============================================================

  useEffect(() => {
    loadGames();
  }, [activeSport]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(loadGames, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeSport]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const welcome = `**GRIDLOCK AI** — Live ${sport.name} Betting Intelligence ${sport.icon}

📊 **Live odds** from The-Odds-API (refreshes every 5 min)
🎯 **Player props** available per game
📝 **Pick tracking** with W/L record

**Tabs:**
• **Games** — Spreads, MLs, Totals (click to add picks)
• **Props** — Player props for selected game
• **Picks** — Your bet slip
• **Chat** — Ask me anything

Select a game to view player props!`;
    setMessages([{ role: 'assistant', content: welcome }]);
  }, [activeSport]);

  const loadGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const { games: data, remaining } = await fetchGameOdds(sport.key);
      const parsed = data.map(parseGameOdds).filter(Boolean);
      parsed.sort((a, b) => a.startTime - b.startTime);
      setGames(parsed);
      setApiRemaining(remaining);
      setLastUpdate(new Date());
      
      // Auto-select first game for props
      if (parsed.length > 0 && !selectedGame) {
        setSelectedGame(parsed[0]);
      }
    } catch (err) {
      setError('Failed to load odds. Check API key or try again.');
    }
    setLoading(false);
  };

  const loadProps = async (game) => {
    if (!game) return;
    setPropsLoading(true);
    setPropsError(null);
    
    try {
      const propsData = await fetchPlayerProps(sport.key, game.id);
      if (propsData) {
        const parsed = parsePlayerProps(propsData);
        setProps(parsed);
        if (parsed.length === 0) {
          setPropsError('No props available for this game yet.');
        }
      } else {
        setPropsError('Player props require a paid API tier. Try the Props tab for manual entry.');
        setProps([]);
      }
    } catch (err) {
      setPropsError('Failed to load props.');
      setProps([]);
    }
    setPropsLoading(false);
  };

  useEffect(() => {
    if (selectedGame) {
      loadProps(selectedGame);
    }
  }, [selectedGame]);

  // ============================================================
  // PICK MANAGEMENT
  // ============================================================

  const addPick = (game, pickType, pick) => {
    const newPick = {
      id: Date.now(),
      sport: activeSport,
      game: `${game.awayTeam} @ ${game.homeTeam}`,
      gameTime: game.startTime,
      pickType,
      pick,
      odds: pick.odds,
      result: 'PENDING',
      addedAt: new Date(),
    };
    setMyPicks(prev => [newPick, ...prev]);
  };

  const addPropPick = (prop) => {
    if (!selectedGame) return;
    const newPick = {
      id: Date.now(),
      sport: activeSport,
      game: `${selectedGame.awayTeam} @ ${selectedGame.homeTeam}`,
      gameTime: selectedGame.startTime,
      pickType: 'Prop',
      pick: { 
        player: prop.player, 
        market: prop.market, 
        side: 'Over',
        line: prop.line,
        odds: prop.over 
      },
      odds: prop.over,
      result: 'PENDING',
      addedAt: new Date(),
    };
    setMyPicks(prev => [newPick, ...prev]);
  };

  const removePick = (pickId) => {
    setMyPicks(prev => prev.filter(p => p.id !== pickId));
  };

  const updatePickResult = (pickId, result) => {
    setMyPicks(prev => prev.map(p => p.id === pickId ? { ...p, result } : p));
  };

  // ============================================================
  // CHAT
  // ============================================================

  const callAPI = async (msgs) => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: msgs, 
          mode: 'betting',
          sport: activeSport,
          games: games.slice(0, 10),
          props: props.slice(0, 20)
        })
      });
      const data = await res.json();
      return data.response || 'Error getting response';
    } catch (e) {
      return 'Connection error. Please try again.';
    }
  };

  const send = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);
    const response = await callAPI([...messages, { role: 'user', content: input }]);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const renderContent = (content) => content.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => 
      p.startsWith('**') && p.endsWith('**') ? <strong key={j} style={{color:'#fff'}}>{p.slice(2,-2)}</strong> : p
    );
    if (line.trim().match(/^[•\-\*]/)) {
      return <div key={i} style={{paddingLeft:'12px',marginBottom:'4px',display:'flex',gap:'8px'}}>
        <span style={{color: accent}}>•</span><span>{parts}</span>
      </div>;
    }
    return <p key={i} style={{margin: line === '' ? '8px 0' : '4px 0'}}>{parts}</p>;
  });

  // ============================================================
  // UI HELPERS
  // ============================================================

  const getResultBadge = (result) => {
    if (result === 'WIN') return { bg: 'rgba(0,255,136,0.15)', color: '#00ff88', text: '✅ WIN' };
    if (result === 'LOSS') return { bg: 'rgba(255,68,68,0.15)', color: '#ff4444', text: '❌ LOSS' };
    if (result === 'PUSH') return { bg: 'rgba(255,255,255,0.1)', color: '#888', text: '➖ PUSH' };
    return { bg: 'rgba(255,170,0,0.15)', color: '#ffaa00', text: '⏳ PENDING' };
  };

  const wins = myPicks.filter(p => p.result === 'WIN').length;
  const losses = myPicks.filter(p => p.result === 'LOSS').length;
  const pending = myPicks.filter(p => p.result === 'PENDING').length;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0a0a0f 0%,#1a1a2e 50%,#0f0f1a 100%)',color:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,sans-serif'}}>
      
      {/* HEADER */}
      <header style={{background:'rgba(0,0,0,0.3)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'12px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'36px',height:'36px',background:`linear-gradient(135deg,${accent},${accent}88)`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🎯</div>
          <div>
            <h1 style={{margin:0,fontSize:'18px',fontWeight:'700'}}>GRIDLOCK AI</h1>
            <p style={{margin:0,fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>
              {sport.icon} {sport.name} • LIVE ODDS
              {apiRemaining !== null && <span style={{marginLeft:'8px',color:apiRemaining < 50 ? '#ff4444' : accent}}>({apiRemaining} API calls left)</span>}
            </p>
          </div>
        </div>

        {/* Sport Toggle */}
        <div style={{display:'flex',gap:'4px',background:'rgba(255,255,255,0.05)',padding:'4px',borderRadius:'8px'}}>
          {Object.entries(SPORTS).map(([key, s]) => (
            <button key={key} onClick={() => { setActiveSport(key); setSelectedGame(null); setProps([]); }}
              style={{padding:'8px 16px',borderRadius:'6px',border:'none',background: activeSport === key ? s.accent : 'transparent',
                color: activeSport === key ? '#000' : 'rgba(255,255,255,0.6)',fontWeight:'600',fontSize:'12px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
              {s.icon} {s.name}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'4px'}}>
          {['games','props','picks','chat'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} 
              style={{padding:'8px 14px',borderRadius:'6px',border:'none',background: activeTab === t ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: activeTab === t ? '#fff' : 'rgba(255,255,255,0.5)',fontWeight:'500',fontSize:'12px',cursor:'pointer',textTransform:'uppercase'}}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <main style={{maxWidth: activeTab === 'chat' ? '850px' : '1200px', margin:'0 auto', padding:'16px', minHeight:'calc(100vh - 70px)'}}>
        
        {/* ============ GAMES TAB ============ */}
        {activeTab === 'games' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <h2 style={{margin:0,fontSize:'14px',color:accent,letterSpacing:'1px'}}>{sport.name} GAMES</h2>
                <span style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{games.length} games</span>
                {lastUpdate && <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>Updated {lastUpdate.toLocaleTimeString()}</span>}
              </div>
              <button onClick={loadGames} disabled={loading}
                style={{padding:'8px 16px',borderRadius:'8px',border:`1px solid ${accent}44`,background:'transparent',color: accent,fontSize:'12px',cursor: loading ? 'wait' : 'pointer'}}>
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {error && <div style={{background:'rgba(255,68,68,0.1)',border:'1px solid rgba(255,68,68,0.3)',borderRadius:'8px',padding:'12px 16px',marginBottom:'16px',fontSize:'13px',color:'#ff4444'}}>⚠️ {error}</div>}

            {loading && games.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.5)'}}>⏳ Loading {sport.name} odds...</div>
            ) : games.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.5)'}}>{sport.icon} No {sport.name} games scheduled</div>
            ) : (
              <div style={{display:'grid',gap:'12px'}}>
                {games.map(game => (
                  <div key={game.id} onClick={() => { setSelectedGame(game); setActiveTab('props'); }}
                    style={{background: selectedGame?.id === game.id ? `${accent}11` : 'rgba(255,255,255,0.03)',
                      border: selectedGame?.id === game.id ? `1px solid ${accent}44` : '1px solid rgba(255,255,255,0.08)',
                      borderRadius:'12px',padding:'16px',cursor:'pointer',transition:'all 0.2s'}}>
                    
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <div>
                        <div style={{fontWeight:'700',fontSize:'16px',marginBottom:'4px'}}>{game.awayTeam} @ {game.homeTeam}</div>
                        <div style={{fontSize:'12px',color:'rgba(255,255,255,0.4)'}}>{formatTime(game.startTime)} • {game.bookmaker}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontSize:'11px',color:accent}}>Click for props →</span>
                        <div style={{background: getTimeUntil(game.startTime) === 'LIVE' ? 'rgba(255,68,68,0.2)' : 'rgba(255,255,255,0.05)',
                          color: getTimeUntil(game.startTime) === 'LIVE' ? '#ff4444' : accent,padding:'6px 12px',borderRadius:'6px',fontSize:'12px',fontWeight:'600'}}>
                          {getTimeUntil(game.startTime)}
                        </div>
                      </div>
                    </div>

                    {/* Odds Grid */}
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px'}} onClick={e => e.stopPropagation()}>
                      {/* Spread */}
                      <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'12px'}}>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',marginBottom:'8px',letterSpacing:'1px'}}>SPREAD</div>
                        {[game.spread?.away, game.spread?.home].map((side, idx) => side && (
                          <div key={idx} onClick={() => addPick(game, 'Spread', { team: side.team, line: side.line, odds: side.odds })}
                            style={{display:'flex',justifyContent:'space-between',padding:'6px 8px',borderRadius:'6px',cursor:'pointer',marginBottom: idx === 0 ? '4px' : 0,
                              background:'rgba(255,255,255,0.02)',transition:'background 0.2s'}}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                            <span style={{fontSize:'13px'}}>{side.team}</span>
                            <span style={{color:accent,fontWeight:'600'}}>{formatSpread(side.line)} ({formatOdds(side.odds)})</span>
                          </div>
                        ))}
                      </div>

                      {/* Moneyline */}
                      <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'12px'}}>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',marginBottom:'8px',letterSpacing:'1px'}}>MONEYLINE</div>
                        {[game.ml?.away, game.ml?.home].map((side, idx) => side && (
                          <div key={idx} onClick={() => addPick(game, 'ML', { team: side.team, odds: side.odds })}
                            style={{display:'flex',justifyContent:'space-between',padding:'6px 8px',borderRadius:'6px',cursor:'pointer',marginBottom: idx === 0 ? '4px' : 0,
                              background:'rgba(255,255,255,0.02)',transition:'background 0.2s'}}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                            <span style={{fontSize:'13px'}}>{side.team}</span>
                            <span style={{color: side.odds > 0 ? '#00ff88' : '#ff9500',fontWeight:'600'}}>{formatOdds(side.odds)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'8px',padding:'12px'}}>
                        <div style={{fontSize:'10px',color:'rgba(255,255,255,0.4)',marginBottom:'8px',letterSpacing:'1px'}}>TOTAL</div>
                        {game.total && ['Over', 'Under'].map((side, idx) => (
                          <div key={side} onClick={() => addPick(game, 'Total', { side, line: game.total.line, odds: side === 'Over' ? game.total.over : game.total.under })}
                            style={{display:'flex',justifyContent:'space-between',padding:'6px 8px',borderRadius:'6px',cursor:'pointer',marginBottom: idx === 0 ? '4px' : 0,
                              background:'rgba(255,255,255,0.02)',transition:'background 0.2s'}}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                            <span style={{fontSize:'13px'}}>{side} {game.total.line}</span>
                            <span style={{color:accent,fontWeight:'600'}}>{formatOdds(side === 'Over' ? game.total.over : game.total.under)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ PROPS TAB ============ */}
        {activeTab === 'props' && (
          <div>
            {/* Game Selector */}
            <div style={{marginBottom:'16px'}}>
              <label style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginBottom:'8px',display:'block'}}>SELECT GAME FOR PROPS</label>
              <select 
                value={selectedGame?.id || ''} 
                onChange={(e) => setSelectedGame(games.find(g => g.id === e.target.value))}
                style={{width:'100%',padding:'12px 16px',borderRadius:'8px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'#fff',fontSize:'14px'}}>
                <option value="">Select a game...</option>
                {games.map(g => (
                  <option key={g.id} value={g.id}>{g.awayTeam} @ {g.homeTeam} — {formatTime(g.startTime)}</option>
                ))}
              </select>
            </div>

            {selectedGame && (
              <div style={{background:`${accent}11`,border:`1px solid ${accent}33`,borderRadius:'8px',padding:'12px 16px',marginBottom:'16px'}}>
                <span style={{fontWeight:'600'}}>{selectedGame.awayTeam} @ {selectedGame.homeTeam}</span>
                <span style={{color:'rgba(255,255,255,0.5)',marginLeft:'12px',fontSize:'13px'}}>{formatTime(selectedGame.startTime)}</span>
              </div>
            )}

            {propsLoading ? (
              <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.5)'}}>⏳ Loading player props...</div>
            ) : propsError ? (
              <div style={{background:'rgba(255,170,0,0.1)',border:'1px solid rgba(255,170,0,0.3)',borderRadius:'8px',padding:'16px',marginBottom:'16px'}}>
                <div style={{color:'#ffaa00',marginBottom:'8px'}}>⚠️ {propsError}</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)'}}>
                  Player props may require a paid API tier (~$20/mo) or you can manually add props below.
                </div>
              </div>
            ) : props.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.5)'}}>
                {selectedGame ? 'No props available for this game.' : 'Select a game above to view player props.'}
              </div>
            ) : (
              <div style={{display:'grid',gap:'8px'}}>
                <h3 style={{fontSize:'12px',color:accent,letterSpacing:'1px',margin:'0 0 8px'}}>PLAYER PROPS ({props.length})</h3>
                {props.map((prop, i) => (
                  <div key={i} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontWeight:'600',fontSize:'14px'}}>{prop.player}</div>
                      <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)'}}>{prop.market}</div>
                    </div>
                    <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                      <span style={{fontSize:'16px',fontWeight:'700',color:'#fff'}}>{prop.line}</span>
                      <button onClick={() => addPropPick(prop)} 
                        style={{padding:'6px 12px',borderRadius:'6px',border:'none',background:'rgba(0,255,136,0.15)',color:'#00ff88',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}>
                        O {formatOdds(prop.over)}
                      </button>
                      <button onClick={() => { /* Add under pick */ }}
                        style={{padding:'6px 12px',borderRadius:'6px',border:'none',background:'rgba(255,68,68,0.15)',color:'#ff4444',fontSize:'12px',cursor:'pointer',fontWeight:'600'}}>
                        U {formatOdds(prop.under)}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Prop Entry */}
            <div style={{marginTop:'24px',background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'16px'}}>
              <h3 style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',letterSpacing:'1px',margin:'0 0 12px'}}>➕ MANUAL PROP ENTRY</h3>
              <p style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',margin:'0 0 12px'}}>
                If API props aren't available, manually add props from your sportsbook:
              </p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px 80px auto',gap:'8px',alignItems:'end'}}>
                <input placeholder="Player name" style={{padding:'10px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.03)',color:'#fff',fontSize:'13px'}} />
                <select style={{padding:'10px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.05)',color:'#fff',fontSize:'13px'}}>
                  <option>Points</option>
                  <option>Rebounds</option>
                  <option>Assists</option>
                  <option>3PM</option>
                  <option>PRA</option>
                </select>
                <input placeholder="Line" style={{padding:'10px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.03)',color:'#fff',fontSize:'13px'}} />
                <input placeholder="Odds" style={{padding:'10px',borderRadius:'6px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.03)',color:'#fff',fontSize:'13px'}} />
                <button style={{padding:'10px 16px',borderRadius:'6px',border:'none',background:accent,color:'#000',fontWeight:'600',cursor:'pointer'}}>Add</button>
              </div>
            </div>
          </div>
        )}

        {/* ============ PICKS TAB ============ */}
        {activeTab === 'picks' && (
          <div>
            {/* Summary */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'12px',marginBottom:'20px'}}>
              {[
                { label: 'TOTAL', value: myPicks.length, color: accent },
                { label: 'WINS', value: wins, color: '#00ff88', bg: 'rgba(0,255,136,0.05)', border: 'rgba(0,255,136,0.2)' },
                { label: 'LOSSES', value: losses, color: '#ff4444', bg: 'rgba(255,68,68,0.05)', border: 'rgba(255,68,68,0.2)' },
                { label: 'PENDING', value: pending, color: '#ffaa00', bg: 'rgba(255,170,0,0.05)', border: 'rgba(255,170,0,0.2)' },
              ].map(stat => (
                <div key={stat.label} style={{background: stat.bg || 'rgba(255,255,255,0.03)',border:`1px solid ${stat.border || 'rgba(255,255,255,0.08)'}`,borderRadius:'12px',padding:'16px',textAlign:'center'}}>
                  <div style={{fontSize:'28px',fontWeight:'700',color:stat.color}}>{stat.value}</div>
                  <div style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',marginTop:'4px'}}>{stat.label}</div>
                </div>
              ))}
            </div>

            {myPicks.length === 0 ? (
              <div style={{textAlign:'center',padding:'60px',color:'rgba(255,255,255,0.5)'}}>
                📝 No picks yet. Click on any line in Games or Props to add a pick.
              </div>
            ) : (
              <div style={{display:'grid',gap:'10px'}}>
                {myPicks.map(pick => {
                  const result = getResultBadge(pick.result);
                  return (
                    <div key={pick.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'16px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px'}}>
                        <div>
                          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                            <span style={{fontSize:'14px'}}>{SPORTS[pick.sport]?.icon}</span>
                            <span style={{fontWeight:'600',fontSize:'14px'}}>{pick.game}</span>
                          </div>
                          <div style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginTop:'2px'}}>{pick.gameTime.toLocaleString()} • {pick.pickType}</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <span style={{background:result.bg,color:result.color,padding:'4px 12px',borderRadius:'6px',fontSize:'11px',fontWeight:'600'}}>{result.text}</span>
                          <button onClick={() => removePick(pick.id)} style={{background:'rgba(255,68,68,0.1)',border:'none',color:'#ff4444',padding:'4px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'12px'}}>✕</button>
                        </div>
                      </div>
                      
                      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                        <span style={{color:accent,fontWeight:'700',fontSize:'16px'}}>
                          {pick.pick.player || pick.pick.team || pick.pick.side} {pick.pick.line ? formatSpread(pick.pick.line) : ''}
                        </span>
                        <span style={{color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>{formatOdds(pick.odds)}</span>
                      </div>
                      
                      {pick.result === 'PENDING' && (
                        <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                          <button onClick={() => updatePickResult(pick.id, 'WIN')} style={{flex:1,padding:'8px',borderRadius:'6px',border:'none',background:'rgba(0,255,136,0.15)',color:'#00ff88',cursor:'pointer',fontWeight:'600',fontSize:'12px'}}>✓ Win</button>
                          <button onClick={() => updatePickResult(pick.id, 'LOSS')} style={{flex:1,padding:'8px',borderRadius:'6px',border:'none',background:'rgba(255,68,68,0.15)',color:'#ff4444',cursor:'pointer',fontWeight:'600',fontSize:'12px'}}>✗ Loss</button>
                          <button onClick={() => updatePickResult(pick.id, 'PUSH')} style={{flex:1,padding:'8px',borderRadius:'6px',border:'none',background:'rgba(255,255,255,0.1)',color:'#888',cursor:'pointer',fontWeight:'600',fontSize:'12px'}}>— Push</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============ CHAT TAB ============ */}
        {activeTab === 'chat' && (
          <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 100px)'}}>
            <div style={{flex:1,overflow:'auto',paddingBottom:'16px'}}>
              {messages.map((msg, i) => (
                <div key={i} style={{display:'flex',justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom:'12px'}}>
                  <div style={{maxWidth:'85%'}}>
                    <div style={{padding:'14px 18px',borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user' ? `linear-gradient(135deg,${accent},${accent}88)` : 'rgba(255,255,255,0.05)',
                      border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',fontSize:'13px',lineHeight:'1.6',color: msg.role === 'user' ? '#000' : '#fff'}}>
                      {renderContent(msg.content)}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && <div style={{display:'flex',gap:'4px',padding:'12px'}}>
                <span style={{width:'8px',height:'8px',background:accent,borderRadius:'50%',animation:'pulse 1s infinite'}}></span>
                <span style={{width:'8px',height:'8px',background:accent,borderRadius:'50%',animation:'pulse 1s infinite 0.2s'}}></span>
                <span style={{width:'8px',height:'8px',background:accent,borderRadius:'50%',animation:'pulse 1s infinite 0.4s'}}></span>
              </div>}
              <div ref={messagesEndRef} />
            </div>
            
            <div style={{display:'flex',gap:'12px'}}>
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} 
                placeholder={`Ask about ${sport.name} games, spreads, props...`}
                style={{flex:1,padding:'14px 18px',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.03)',color:'#fff',fontSize:'14px',outline:'none'}} />
              <button onClick={send} style={{padding:'14px 24px',borderRadius:'12px',border:'none',background:`linear-gradient(135deg,${accent},${accent}88)`,color:'#000',fontWeight:'600',cursor:'pointer'}}>Send</button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: ${accent}33; border-radius: 3px; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1a1a2e; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
      `}</style>
    </div>
  );
}
