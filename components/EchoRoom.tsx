'use client';
import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { initialEchoState, EchoState, EchoChoice } from '../lib/game-state';

const SAVE='echo-v1-state';
const spots={orb:[57,59,11],window:[18,28,13],stone:[34,77,12],door:[78,27,13]} as const;
type Target=keyof typeof spots|null;
type Pos={x:number;y:number};

export default function EchoRoom(){
 const [state,setState]=useState<EchoState>(initialEchoState),[run,setRun]=useState(1),[pos,setPos]=useState<Pos>({x:50,y:79});
 const [target,setTarget]=useState<Target>(null),[choice,setChoice]=useState(false),[echo,setEcho]=useState(false),[ending,setEnding]=useState(false),[paused,setPaused]=useState(false),[door,setDoor]=useState(false),[message,setMessage]=useState('The room is quiet. Look around. It is already watching you.');
 useEffect(()=>{try{const x=localStorage.getItem(SAVE);if(x){const p=JSON.parse(x);setState({...initialEchoState,...p});setRun(Math.max(1,p.runNumber||1))}}catch{}},[]);
 useEffect(()=>{localStorage.setItem(SAVE,JSON.stringify({...state,runNumber:run}))},[state,run]);
 useEffect(()=>{const down=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(k==='e')interact();if(k==='escape')setPaused(v=>!v);setKeys(v=>({...v,[k]:true}))};const up=(e:KeyboardEvent)=>setKeys(v=>({...v,[e.key.toLowerCase()]:false}));window.addEventListener('keydown',down);window.addEventListener('keyup',up);return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}},[]);
 const [keys,setKeys]=useState<Record<string,boolean>>({});
 useEffect(()=>{let id:number;const tick=()=>{if(!paused&&!choice&&!ending){let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);if(dx||dy){const l=Math.hypot(dx,dy);setPos(p=>({x:Math.max(7,Math.min(93,p.x+dx/l*.45)),y:Math.max(52,Math.min(90,p.y+dy/l*.36))}))}};id=requestAnimationFrame(tick)};id=requestAnimationFrame(tick);return()=>cancelAnimationFrame(id)},[keys,paused,choice,ending]);
 useEffect(()=>{let best:Target=null,d=999;(Object.keys(spots) as Target[]).forEach(k=>{if(!k)return;const [x,y,r]=spots[k],n=Math.hypot(pos.x-x,pos.y-y);if(n<r&&n<d){d=n;best=k}});setTarget(best)},[pos]);
 function interact(){if(paused||choice||ending)return;if(!target){setMessage('Nothing nearby answers. Keep walking.');return}
  if(target==='orb'){setState(s=>({...s,orbTouched:true,memoryCount:s.memoryCount+1,lastChoice:'orb'}));setMessage('A pulse moves through the room. Somewhere, something answers.');setEcho(true);return}
  if(target==='window'){setState(s=>({...s,windowSeen:true}));setMessage(state.memoryCount?'Your reflection moves a fraction too late.':'Rain hangs beyond the glass, although you cannot hear it.');setChoice(true);return}
  if(target==='stone'){setState(s=>({...s,stoneMarked:true}));setMessage('The stone is cold. A mark catches the light from somewhere it should not exist.');setChoice(true);return}
  if(!state.orbTouched){setMessage('The door is silent. The room wants you to notice something else first.');return}
  if(!state.doorUnlocked){setState(s=>({...s,doorUnlocked:true}));setMessage('The lock releases without a sound. It remembers something you did before.');return}
  setDoor(true);setEcho(true);setState(s=>({...s,hasSeenEcho:true}));setTimeout(()=>setEnding(true),900);
 }
 function choose(c:Exclude<EchoChoice,null>){setChoice(false);setState(s=>({...s,memoryCount:s.memoryCount+1,lastChoice:c,orbTouched:c==='orb'||s.orbTouched,windowSeen:c==='window'||s.windowSeen,stoneMarked:c==='stone'||s.stoneMarked}));setMessage(c==='orb'?'You choose the light. The room inhales.':c==='window'?'You choose the window. Outside becomes somewhere else.':'You choose the stone. Its mark is now on the room, not the stone.')}
 function again(){setEnding(false);setDoor(false);setEcho(false);setRun(r=>r+1);setPos({x:50,y:79});setMessage('You begin again. The room is almost the same. Almost.')}
 function erase(){setState(initialEchoState);setRun(1);setDoor(false);setEcho(false);setEnding(false);setPos({x:50,y:79});localStorage.removeItem(SAVE);setMessage('Memory erased. The room is quiet again.')}
 const style={'--px':pos.x+'%','--py':pos.y+'%'} as CSSProperties;
 const prompt=target==='orb'?'TOUCH THE LIGHT':target==='window'?'LOOK THROUGH':target==='stone'?'EXAMINE':target==='door'?(state.doorUnlocked?'ENTER':'INSPECT'):'';
 return <main className={'game-shell '+(state.orbTouched?'awake ':'')+(state.memoryCount>1?'deep ':'')+(door?'opened ':'')}>
  <header className="topbar"><div className="brand"><span>E</span><div><small>A NARRATIVE MEMORY</small><h1>ECHO</h1></div></div><div><b>RUN {String(run).padStart(2,'0')}</b><button onClick={()=>setPaused(true)}>PAUSE</button></div></header>
  <section className="room" style={style}>
   <div className="ceiling"/><div className="wall back"/><div className="wall left"/><div className="wall right"/><div className="floor"/>
   <div className="window"><div className="sky"><i className="moon"/></div><i className="reflection"/></div>
   <div className="cabinet"><i/><i/><i/></div><div className="lamp"><i/><i/></div>
   <div className={'door '+(state.doorUnlocked?'unlocked':'')}><i/><b>ECHO</b></div><div className="rug"/>
   <div className={'stone '+(state.stoneMarked?'marked':'')}><i>{state.stoneMarked?'◈':'·'}</i></div>
   <div className={'orb '+(state.orbTouched?'lit':'')}><i/><i/><b/></div>
   {echo&&<div className="echo"><i/><b/><span/></div>}
   <div className="player"><i/><b/><span/><span/></div>
   {target&&!choice&&!ending&&<button className="prompt" onClick={interact}><b>E</b>{prompt}</button>}
   <div className="vignette"/><div className="caption"><b>THE ROOM REMEMBERS</b><small>{state.memoryCount?state.memoryCount+' memories retained':'memory dormant'}</small></div>
  </section>
  <footer><span>● {message}</span><small>WASD / ARROWS MOVE · E INTERACT · ESC PAUSE</small></footer>
  <div className="mobile"><button onPointerDown={()=>setKeys(v=>({...v,w:true}))} onPointerUp={()=>setKeys(v=>({...v,w:false}))}>▲</button><div><button onPointerDown={()=>setKeys(v=>({...v,a:true}))} onPointerUp={()=>setKeys(v=>({...v,a:false}))}>◀</button><button onClick={interact}>E</button><button onPointerDown={()=>setKeys(v=>({...v,d:true}))} onPointerUp={()=>setKeys(v=>({...v,d:false}))}>▶</button></div><button onPointerDown={()=>setKeys(v=>({...v,s:true}))} onPointerUp={()=>setKeys(v=>({...v,s:false}))}>▼</button></div>
  {choice&&<div className="overlay"><article><small>THE ROOM ASKS</small><h2>What do you trust?</h2><p>The answer will remain in the room.</p><button onClick={()=>choose('orb')}>01 · THE LIGHT</button><button onClick={()=>choose('window')}>02 · THE OUTSIDE</button><button onClick={()=>choose('stone')}>03 · THE MARK</button></article></div>}
  {paused&&<div className="overlay"><article><small>ECHO / PAUSED</small><h2>Listen.</h2><p>Your memory is safe.</p><button onClick={()=>setPaused(false)}>RETURN</button><button onClick={erase}>ERASE MEMORY</button></article></div>}
  {ending&&<div className="overlay ending"><article><small>END OF RUN {String(run).padStart(2,'0')}</small><h2>{run>1||state.memoryCount>1?'THE ROOM REMEMBERS YOU':'THE DOOR REMEMBERS'}</h2><p>The threshold was never empty. Something crossed with you.</p><button onClick={again}>BEGIN AGAIN</button></article></div>}
 </main>
}