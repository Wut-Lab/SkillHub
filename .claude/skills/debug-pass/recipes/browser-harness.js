// Headless run-through for a browser app or game (see SKILL.md, recipe "Browser app or game").
// Fill in CFG from the map step, copy to the scratchpad, then: S=<scratchpad> node browser-harness.js > run.out 2>&1
// Needs Playwright with Chromium. Every CFG string is evaluated inside the page. The values below are EXAMPLES from one game: replace them all.
const CFG={
  // Optional fields can be '' or null: render, loop, clock, ents, invincible, pickers, lists, screens.
  url:'file:///path/to/index.html',
  cdn:{match:/cdnjs/,file:'three.min.js'},     // local copy in $S, or null
  viewport:{width:390,height:844},
  boot:`try{reelEnd()}catch(e){}`,              // skip intros
  // Fast-forward (games/animated apps): set render+loop+clock. Leave loop '' to play in real time instead.
  render:'R',                                   // object whose .render() is stubbed
  loop:'tick', clock:'last',                    // rAF loop fn and its time variable
  ents:'ents', hp:'hp', maxHp:'max',            // enemy list and hp fields
  invincible:`st.dvInv=1`,                      // run each tick (patch hurt() if no flag)
  pickers:'#opts button,#evO button',           // choice overlays to auto-click
  running:'running',                            // true while gameplay is live
  progress:`st.sec+' '+st.area+' hp'+st.hp`,    // where a run ended
  runs:[                                        // [label, setup code, simulated seconds]
    ['campaign mech',`toMenu();start('mech')`,600],
    ['timed',`toMenu();start('ship',1)`,120],
  ],
  // Dev-menu selectors: each option is run in turn
  lists:[
    {label:'boss',select:'#dvB',prep:`show('devc')`,setup:i=>`toMenu();show('devc');$('dvB').value=${i};$('dvBGo').click()`,sec:90,
     after:`ents.filter(e=>BOSSES.has(e.type)).map(e=>e.type+':'+(e.hp|0)).join()||'boss down'`},
    {label:'event',select:'#dvE',setup:i=>`toMenu();show('devc');$('dvE').value=${i};$('dvEGo').click()`,sec:20},
  ],
  screens:{all:`[...document.querySelectorAll('.scr')].map(e=>e.id).filter(Boolean)`,open:id=>`toMenu();show('${id}')`},
};

const {chromium}=require('playwright');
(async()=>{
  const S=process.env.S||'.',b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const p=await b.newPage({viewport:CFG.viewport}),out=[];let ctx='load';
  if(CFG.cdn)await p.route(CFG.cdn.match,r=>r.fulfill({path:S+'/'+CFG.cdn.file,contentType:'text/javascript'}));
  p.on('pageerror',e=>out.push(`ERR ${ctx}: ${e.message} @${(e.stack||'').split('\n')[1]||''}`));
  p.on('console',m=>{if(m.type()==='error')out.push(`CONSOLE ${ctx}: ${m.text()}`)});
  await p.goto(CFG.url);await p.waitForTimeout(2500);
  await p.evaluate(c=>{eval(c.boot);
    // sim(sec): fast-forward the game loop with rendering and rAF stubbed
    window.__sim=sec=>{if(!c.loop)return [];const _r=eval(c.render),rr=_r.render,raf=window.requestAnimationFrame,_errs=[];
      _r.render=()=>{};window.requestAnimationFrame=()=>0;let _t=eval(c.clock);
      try{for(let i=0;i<sec*20;i++){_t+=50;eval(c.invincible);
        if(c.ents&&i%10===0)for(const _e of eval(c.ents))if(_e.m?.visible!==false&&_e[c.hp]>0)_e[c.hp]-=Math.max(1,(_e[c.maxHp]||_e[c.hp])*.25);
        if(c.pickers&&!eval(c.running)&&i%20===5){const _b=[...document.querySelectorAll(c.pickers)].filter(x=>x.offsetParent&&!x.disabled);if(_b.length)_b[Math.random()*_b.length|0].click()}
        try{eval(c.loop)(_t)}catch(_x){_errs.push(_x.message+' @'+(_x.stack||'').split('\n')[1]);if(_errs.length>3)break}}}
      finally{eval(`${c.clock}=performance.now()`);_r.render=rr;window.requestAnimationFrame=raf}return _errs}},
    {boot:CFG.boot,render:CFG.render,clock:CFG.clock,invincible:CFG.invincible,ents:CFG.ents,hp:CFG.hp,maxHp:CFG.maxHp,running:CFG.running,pickers:CFG.pickers,loop:CFG.loop});
  const run=async(label,setup,sec,after)=>{ctx=label;const errs=[];
    const bad=await p.evaluate(s=>{try{eval(s)}catch(x){return 'setup: '+x.message}},setup);if(bad)errs.push(bad);
    for(let c=0;c<sec&&!bad;c+=5){errs.push(...await p.evaluate(()=>__sim(5)));await p.waitForTimeout(CFG.loop?400:5000)}
    const end=await p.evaluate(([pr,af])=>{try{return eval(pr)+(af?' | '+eval(af):'')}catch(x){return '?'}},[CFG.progress,after]);
    out.push(`${errs.length?'FAIL':'ok  '} ${label} -> ${end}${errs.length?'\n     '+[...new Set(errs)].join('\n     '):''}`)};
  for(const [l,s,sec] of CFG.runs)await run(l,s,sec);
  for(const L of CFG.lists||[]){if(L.prep){await p.evaluate(s=>eval(s),L.prep);await p.waitForTimeout(800)}const names=await p.evaluate(sel=>[...document.querySelectorAll(sel+' option')].map(o=>o.text),L.select);
    for(let i=0;i<names.length;i++)await run(`${L.label} ${names[i]}`,L.setup(i),L.sec,L.after)}
  if(CFG.screens){ctx='screens';for(const id of await p.evaluate(CFG.screens.all))
    await p.evaluate(s=>eval(s),CFG.screens.open(id)).catch(x=>out.push(`FAIL screen ${id}: ${x.message}`))}
  console.log(out.join('\n'));await b.close()})();
