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

const SNF_GAME = { away: 'CHI', home: 'SF', spread: 'SF -3', total: 47.5, time: '8:20 PM ET', awayRecord: '11-4', homeRecord: '11-4', playoff: 'CHI clinches NFC North with win. SF fighting for #1 seed.' };

const DFS_PLAYERS = [
  { name: 'Josh Allen', team: 'BUF', pos: 'QB', salary: 7000, opp: 'vs PHI', avg: 24.16, notes: 'Highest ceiling QB - 35pt upside' },
  { name: 'Trevor Lawrence', team: 'JAX', pos: 'QB', salary: 6100, opp: '@ IND', avg: 20.58, notes: 'BEST VALUE - 10 TDs last 2 games' },
  { name: 'Joe Burrow', team: 'CIN', pos: 'QB', salary: 6500, opp: 'vs ARI', avg: 16.65, notes: '53.5 total, stack with Chase' },
  { name: 'Drake Maye', team: 'NE', pos: 'QB', salary: 6800, opp: '@ NYJ', avg: 21.18, notes: 'Smash spot vs Jets' },
  { name: "De'Von Achane", team: 'MIA', pos: 'RB', salary: 8500, opp: 'vs TB', avg: 21.37, notes: '28-pt ceiling, explosive' },
  { name: 'James Cook III', team: 'BUF', pos: 'RB', salary: 8000, opp: 'vs PHI', avg: 21.47, notes: 'Goal-line work, TD upside' },
  { name: 'Travis Etienne Jr.', team: 'JAX', pos: 'RB', salary: 7100, opp: '@ IND', avg: 16.26, notes: 'Stack with Lawrence' },
  { name: 'Chase Brown', team: 'CIN', pos: 'RB', salary: 7400, opp: 'vs ARI', avg: 16.03, notes: 'High total game' },
  { name: 'Jaxon Smith-Njigba', team: 'SEA', pos: 'WR', salary: 8600, opp: '@ CAR', avg: 23.82, notes: 'CHALK - 30pt ceiling' },
  { name: "Ja'Marr Chase", team: 'CIN', pos: 'WR', salary: 8300, opp: 'vs ARI', avg: 20.50, notes: 'Smash spot, stack with Burrow' },
  { name: 'Brian Thomas Jr.', team: 'JAX', pos: 'WR', salary: 5200, opp: '@ IND', avg: 10.25, notes: 'VALUE - Lawrence stack' },
  { name: 'Stefon Diggs', team: 'NE', pos: 'WR', salary: 5800, opp: '@ NYJ', avg: 12.86, notes: 'Smash spot vs Jets' },
  { name: 'Trey McBride', team: 'ARI', pos: 'TE', salary: 7500, opp: '@ CIN', avg: 19.19, notes: 'ELITE - 10+ targets weekly' },
  { name: 'Hunter Henry', team: 'NE', pos: 'TE', salary: 4500, opp: '@ NYJ', avg: 10.49, notes: 'VALUE in smash spot' },
];

const SHOWDOWN_PLAYERS = [
  { name: 'Christian McCaffrey', team: 'SF', pos: 'RB', slot: 'CPT', salary: 17700, avg: 25.72, notes: 'CHALK - Bears 32nd run D' },
  { name: 'Brock Purdy', team: 'SF', pos: 'QB', slot: 'CPT', salary: 15900, avg: 21.18, notes: 'Correlates with CMC' },
  { name: 'Caleb Williams', team: 'CHI', pos: 'QB', slot: 'CPT', salary: 15000, avg: 19.07, notes: 'CONTRARIAN - Upset narrative' },
  { name: 'George Kittle', team: 'SF', pos: 'TE', slot: 'CPT', salary: 13500, avg: 15.66, notes: 'Red zone monster' },
  { name: 'Rome Odunze', team: 'CHI', pos: 'WR', slot: 'CPT', salary: 13200, avg: 12.68, notes: 'Caleb favorite target' },
  { name: "D'Andre Swift", team: 'CHI', pos: 'RB', slot: 'CPT', salary: 12000, avg: 15.14, notes: 'Receiving + rushing' },
  { name: 'Christian McCaffrey', team: 'SF', pos: 'RB', slot: 'FLEX', salary: 11800, avg: 25.72, notes: 'CHALK - Bears 32nd run D' },
  { name: 'Brock Purdy', team: 'SF', pos: 'QB', slot: 'FLEX', salary: 10600, avg: 21.18, notes: 'Elite efficiency' },
  { name: 'Caleb Williams', team: 'CHI', pos: 'QB', slot: 'FLEX', salary: 10000, avg: 19.07, notes: 'Rushing upside' },
  { name: 'George Kittle', team: 'SF', pos: 'TE', slot: 'FLEX', salary: 9000, avg: 15.66, notes: 'Red zone target' },
  { name: 'Rome Odunze', team: 'CHI', pos: 'WR', slot: 'FLEX', salary: 8800, avg: 12.68, notes: 'WR1 role' },
  { name: 'DJ Moore', team: 'CHI', pos: 'WR', slot: 'FLEX', salary: 8400, avg: 11.16, notes: 'Volume play' },
  { name: "D'Andre Swift", team: 'CHI', pos: 'RB', slot: 'FLEX', salary: 8000, avg: 15.14, notes: 'Dual-threat' },
  { name: 'Jauan Jennings', team: 'SF', pos: 'WR', slot: 'FLEX', salary: 8600, avg: 11.89, notes: 'Target share up' },
  { name: 'Colston Loveland', team: 'CHI', pos: 'TE', slot: 'FLEX', salary: 4800, avg: 8.69, notes: 'VALUE - Cheap TE' },
  { name: 'Bears', team: 'CHI', pos: 'DST', slot: 'FLEX', salary: 3600, avg: 6.93, notes: 'Fade SF narrative' },
  { name: 'Cole Kmet', team: 'CHI', pos: 'TE', slot: 'FLEX', salary: 2800, avg: 4.96, notes: 'PUNT - Min salary' },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [slateType, setSlateType] = useState('main');
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const greeting = slateType === 'showdown' 
      ? `**GRIDLOCK AI** locked in on **SNF Showdown** — Bears @ 49ers!\n\n**Rules:** 1 Captain (1.5x pts) + 5 FLEX | $50K cap\n**Game:** CHI @ SF | SF -3 | O/U 47.5\n\n🏆 **Chalk CPT:** CMC ($17,700) - 38.6 pt ceiling as Captain\n🎲 **Contrarian:** Caleb ($15,000) - 28.6 pt ceiling, saves $2,700\n💰 **Punts:** Kmet ($2,800), Loveland ($4,800)\n\n**Winning lineup ceiling:** 180-220+ pts\n\nWant a **cash** or **GPP** lineup?`
      : `**GRIDLOCK AI** ready for NFL Week 17!\n\n**9 games** — JAX @ IND is THE smash spot (Lawrence 10 TDs in 2 games, Colts eliminated)\n\n🎯 Spreads & totals analysis\n📊 DFS lineups (targeting 220+ lineup ceiling)\n🎰 Player props & SGPs\n\nWhat do you want to attack?`;
    setMessages([{ role: 'assistant', content: greeting }]);
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
      if (data.error) return `Error: ${data.error}`;
      return data.response;
    } catch (e) {
      return 'Connection error. Try again!';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = { role: 'user', content: input };
    const newHistory = [...history, userMsg];
    setMessages(prev => [...prev, userMsg]);
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

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(145deg,#0a0a0f,#0d1a14,#0a0a0f)',fontFamily:'-apple-system,sans-serif',color:'#e0e0e0'}}>
      <header style={{background:'rgba(0,0,0,0.85)',borderBottom:`1px solid ${accent}22`,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{width:'40px',height:'40px',background:`linear-gradient(135deg,${accent},${slateType==='showdown'?'#ff8800':'#00aa55'})`,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',boxShadow:`0 4px 20px ${accent}44`}}>🏈</div>
          <div>
            <h1 style={{margin:0,fontSize:'18px',fontWeight:'700',background:`linear-gradient(90deg,${accent},${slateType==='showdown'?'#ffcc00':'#00ffaa'})`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>GRIDLOCK AI</h1>
            <p style={{margin:0,fontSize:'10px',color:'rgba(255,255,255,0.4)',letterSpacing:'1px'}}>{slateType==='showdown'?'SNF SHOWDOWN • CHI @ SF':'NFL WEEK 17 • MAIN SLATE'}</p>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <div style={{display:'flex',gap:'4px',background:'rgba(255,255,255,0.05)',padding:'3px',borderRadius:'8px'}}>
            <button onClick={()=>setSlateType('main')} style={{padding:'6px 12px',background:slateType==='main'?'rgba(0,255,136,0.2)':'transparent',border:slateType==='main'?'1px solid rgba(0,255,136,0.3)':'1px solid transparent',borderRadius:'6px',color:slateType==='main'?'#00ff88':'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'10px',fontWeight:'700'}}>MAIN</button>
            <button onClick={()=>setSlateType('showdown')} style={{padding:'6px 12px',background:slateType==='showdown'?'rgba(255,170,0,0.2)':'transparent',border:slateType==='showdown'?'1px solid rgba(255,170,0,0.3)':'1px solid transparent',borderRadius:'6px',color:slateType==='showdown'?'#ffaa00':'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'10px',fontWeight:'700'}}>SHOWDOWN</button>
          </div>
          <div style={{display:'flex',gap:'4px',background:'rgba(255,255,255,0.05)',padding:'3px',borderRadius:'8px'}}>
            {['chat','games','dfs'].map(tab=>(<button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:'6px 14px',background:activeTab===tab?`${accent}22`:'transparent',border:'none',borderRadius:'6px',color:activeTab===tab?accent:'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'10px',fontWeight:'600',textTransform:'uppercase'}}>{tab}</button>))}
          </div>
        </div>
      </header>

      <main style={{maxWidth:'850px',margin:'0 auto',padding:'16px',height:'calc(100vh - 70px)',display:'flex',flexDirection:'column'}}>
        {activeTab==='chat'&&(<>
          <div style={{flex:1,overflowY:'auto',marginBottom:'12px'}}>
            {messages.map((msg,i)=>(<div key={i} style={{display:'flex',justifyContent:msg.role==='user'?'flex-end':'flex-start',marginBottom:'14px'}}>
              {msg.role==='assistant'&&<div style={{width:'30px',height:'30px',background:`linear-gradient(135deg,${accent},${slateType==='showdown'?'#ff8800':'#00aa55'})`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'10px',fontSize:'14px',flexShrink:0}}>🏈</div>}
              <div style={{maxWidth:'85%',padding:'14px 18px',borderRadius:msg.role==='user'?'18px 18px 4px 18px':'18px 18px 18px 4px',background:msg.role==='user'?`linear-gradient(135deg,${slateType==='showdown'?'#aa7700':'#00aa55'},${slateType==='showdown'?'#886600':'#008844'})`:'rgba(255,255,255,0.05)',border:msg.role==='user'?'none':'1px solid rgba(255,255,255,0.08)',fontSize:'13px',lineHeight:'1.6'}}>{renderContent(msg.content)}</div>
            </div>))}
            {isTyping&&<div style={{display:'flex',marginBottom:'14px'}}><div style={{width:'30px',height:'30px',background:`linear-gradient(135deg,${accent},${slateType==='showdown'?'#ff8800':'#00aa55'})`,borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',marginRight:'10px',fontSize:'14px'}}>🏈</div><div style={{padding:'14px 18px',background:'rgba(255,255,255,0.05)',borderRadius:'18px',color:'rgba(255,255,255,0.5)'}}>Thinking...</div></div>}
            <div ref={messagesEndRef}/>
          </div>
          <div style={{display:'flex',gap:'8px',marginBottom:'12px',flexWrap:'wrap'}}>
            {quickPrompts.map((p,i)=>(<button key={i} onClick={()=>setInput(p)} style={{padding:'8px 14px',background:'rgba(255,255,255,0.05)',border:`1px solid ${accent}33`,borderRadius:'20px',color:'rgba(255,255,255,0.7)',cursor:'pointer',fontSize:'12px'}}>{p}</button>))}
          </div>
          <div style={{display:'flex',gap:'10px'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSend()} placeholder="Ask about lineups, spreads, props..." style={{flex:1,padding:'14px 18px',background:'rgba(255,255,255,0.05)',border:`1px solid ${accent}33`,borderRadius:'12px',color:'#fff',fontSize:'14px',outline:'none'}}/>
            <button onClick={handleSend} disabled={!input.trim()||isTyping} style={{padding:'14px 28px',background:input.trim()&&!isTyping?`linear-gradient(135deg,${accent},${slateType==='showdown'?'#ff8800':'#00cc6a'})`:'rgba(255,255,255,0.08)',border:'none',borderRadius:'12px',color:input.trim()&&!isTyping?'#000':'rgba(255,255,255,0.3)',cursor:input.trim()&&!isTyping?'pointer':'not-allowed',fontWeight:'700',fontSize:'14px'}}>Send</button>
          </div>
          <p style={{textAlign:'center',marginTop:'10px',fontSize:'10px',color:'rgba(255,255,255,0.3)'}}>Powered by Claude • For entertainment only</p>
        </>)}

        {activeTab==='games'&&(<div style={{flex:1,overflowY:'auto'}}>
          {slateType==='showdown'?(<>
            <h2 style={{fontSize:'12px',color:'#ffaa00',letterSpacing:'2px',marginBottom:'16px'}}>SNF SHOWDOWN</h2>
            <div style={{background:'linear-gradient(135deg,rgba(255,170,0,0.1),rgba(255,100,0,0.05))',border:'1px solid rgba(255,170,0,0.2)',borderRadius:'14px',padding:'20px',marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'12px',flexWrap:'wrap'}}>
                <span style={{fontSize:'24px',fontWeight:'700'}}>CHI</span><span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>(11-4)</span>
                <span style={{color:'rgba(255,255,255,0.3)',fontSize:'18px'}}>@</span>
                <span style={{fontSize:'24px',fontWeight:'700'}}>SF</span><span style={{color:'rgba(255,255,255,0.4)',fontSize:'12px'}}>(11-4)</span>
              </div>
              <div style={{display:'flex',gap:'10px',marginBottom:'12px'}}>
                <span style={{background:'rgba(255,170,0,0.15)',padding:'8px 16px',borderRadius:'8px',fontSize:'14px',color:'#ffaa00',fontWeight:'700'}}>SF -3</span>
                <span style={{background:'rgba(255,255,255,0.08)',padding:'8px 16px',borderRadius:'8px',fontSize:'14px',color:'#fff',fontWeight:'600'}}>O/U 47.5</span>
              </div>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',margin:0}}>🔥 CHI clinches NFC North with win. SF fighting for #1 seed.</p>
            </div>
            <div style={{background:'rgba(255,255,255,0.03)',borderRadius:'12px',padding:'16px'}}>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',margin:'8px 0'}}>👑 <strong>Captain:</strong> 1.5x points, 1.5x salary</p>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',margin:'8px 0'}}>⚡ <strong>FLEX:</strong> 5 players at base salary</p>
              <p style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',margin:'8px 0'}}>💰 <strong>Cap:</strong> $50,000 | <strong>Winning total:</strong> 180-220+ pts</p>
            </div>
          </>):(<>
            <h2 style={{fontSize:'12px',color:'#00ff88',letterSpacing:'2px',marginBottom:'16px'}}>MAIN SLATE • {SUNDAY_GAMES.length} GAMES</h2>
            {SUNDAY_GAMES.map(g=>(<div key={g.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px',marginBottom:'8px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'8px',flexWrap:'wrap',gap:'8px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontWeight:'600',fontSize:'15px'}}>{g.away}</span><span style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>({g.awayRecord})</span><span style={{color:'rgba(255,255,255,0.2)'}}>@</span><span style={{fontWeight:'600',fontSize:'15px'}}>{g.home}</span><span style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>({g.homeRecord})</span></div>
                <span style={{color:'rgba(255,255,255,0.4)',fontSize:'11px'}}>{g.time}</span>
              </div>
              <div style={{display:'flex',gap:'10px',marginBottom:'8px'}}>
                <span style={{background:'rgba(0,255,136,0.1)',padding:'5px 12px',borderRadius:'6px',fontSize:'12px',color:'#00ff88',fontWeight:'600'}}>{g.spread}</span>
                <span style={{background:'rgba(255,200,0,0.1)',padding:'5px 12px',borderRadius:'6px',fontSize:'12px',color:'#ffcc00',fontWeight:'600'}}>O/U {g.total}</span>
              </div>
              <p style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',margin:0}}>📌 {g.playoff}</p>
            </div>))}
          </>)}
        </div>)}

        {activeTab==='dfs'&&(<div style={{flex:1,overflowY:'auto'}}>
          {slateType==='showdown'?(<>
            <h2 style={{fontSize:'12px',color:'#ffaa00',letterSpacing:'2px',marginBottom:'16px'}}>SHOWDOWN POOL</h2>
            <h3 style={{fontSize:'11px',color:'#ffaa00',marginBottom:'10px'}}>👑 CAPTAIN OPTIONS <span style={{color:'rgba(255,255,255,0.4)',fontWeight:'400'}}>(1.5x pts)</span></h3>
            {SHOWDOWN_PLAYERS.filter(p=>p.slot==='CPT').map(p=>(<div key={`c-${p.name}`} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:'rgba(255,170,0,0.05)',border:'1px solid rgba(255,170,0,0.1)',borderRadius:'10px',marginBottom:'6px'}}>
              <div><div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontWeight:'600',fontSize:'14px'}}>{p.name}</span><span style={{color:p.team==='SF'?'#c9a227':'#f26522',fontSize:'10px',background:p.team==='SF'?'rgba(201,162,39,0.15)':'rgba(242,101,34,0.15)',padding:'2px 8px',borderRadius:'4px',fontWeight:'600'}}>{p.team}</span></div><p style={{margin:'4px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{p.notes}</p></div>
              <div style={{textAlign:'right'}}><span style={{color:'#ffaa00',fontSize:'14px',fontWeight:'700'}}>${p.salary.toLocaleString()}</span><p style={{margin:'2px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>{(p.avg*1.5).toFixed(1)} pt ceiling</p></div>
            </div>))}
            <h3 style={{fontSize:'11px',color:'#00ff88',marginTop:'16px',marginBottom:'10px'}}>⚡ FLEX OPTIONS</h3>
            {SHOWDOWN_PLAYERS.filter(p=>p.slot==='FLEX').map(p=>(<div key={`f-${p.name}`} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',marginBottom:'6px'}}>
              <div><div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontWeight:'600',fontSize:'14px'}}>{p.name}</span><span style={{color:p.team==='SF'?'#c9a227':'#f26522',fontSize:'10px',background:p.team==='SF'?'rgba(201,162,39,0.15)':'rgba(242,101,34,0.15)',padding:'2px 8px',borderRadius:'4px',fontWeight:'600'}}>{p.team}</span></div><p style={{margin:'4px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{p.notes}</p></div>
              <div style={{textAlign:'right'}}><span style={{color:'#00ff88',fontSize:'14px',fontWeight:'700'}}>${p.salary.toLocaleString()}</span><p style={{margin:'2px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>{p.avg} avg</p></div>
            </div>))}
          </>):(<>
            <h2 style={{fontSize:'12px',color:'#00ff88',letterSpacing:'2px',marginBottom:'16px'}}>DFS PLAYER POOL</h2>
            {['QB','RB','WR','TE'].map(pos=>(<div key={pos} style={{marginBottom:'20px'}}>
              <h3 style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginBottom:'10px',letterSpacing:'1px'}}>{pos==='QB'?'QUARTERBACKS':pos==='RB'?'RUNNING BACKS':pos==='WR'?'WIDE RECEIVERS':'TIGHT ENDS'}</h3>
              {DFS_PLAYERS.filter(p=>p.pos===pos).map(p=>(<div key={p.name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px',background:'rgba(255,255,255,0.03)',borderRadius:'10px',marginBottom:'6px'}}>
                <div><div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontWeight:'600',fontSize:'14px'}}>{p.name}</span><span style={{color:'rgba(255,255,255,0.4)',fontSize:'10px',background:'rgba(255,255,255,0.05)',padding:'2px 8px',borderRadius:'4px'}}>{p.team}</span><span style={{color:'rgba(255,255,255,0.3)',fontSize:'11px'}}>{p.opp}</span></div><p style={{margin:'4px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{p.notes}</p></div>
                <div style={{textAlign:'right'}}><span style={{color:'#00ff88',fontSize:'14px',fontWeight:'700'}}>${p.salary.toLocaleString()}</span><p style={{margin:'2px 0 0',fontSize:'11px',color:'rgba(255,255,255,0.5)'}}>{p.avg} avg</p></div>
              </div>))}
            </div>))}
          </>)}
        </div>)}
      </main>
      <style>{`::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:rgba(255,255,255,0.02)}::-webkit-scrollbar-thumb{background:${accent}33;border-radius:3px}input::placeholder{color:rgba(255,255,255,0.3)}`}</style>
    </div>
  );
}
