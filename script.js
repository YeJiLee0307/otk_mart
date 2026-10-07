(() => {
  const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const state={
    xp:0, points:350, chefCount:0,
    missions:{pang:0,chef:0,campus:0}, rewardClaimed:false,
    avatar:{tab:"helmet", selected:{helmet:"기본 헬멧",suit:"핑크 우주복",acc:"없음"}},
    campusScores:{"서강대학교":12840,"연세대학교":12150,"홍익대학교":11920,"이화여자대학교":11340}
  };
  const screens=$$(".screen");
  const levels=[300,480,650,850,1100];
  function levelInfo(){
    let xp=state.xp,l=1;
    while(xp>=(levels[l-1]||1400)){xp-=(levels[l-1]||1400);l++}
    return {level:l,current:xp,need:levels[l-1]||1400}
  }
  function updateGlobal(){
    const L=levelInfo();
    $("#globalLevel").textContent=L.level;
    $("#globalXpFill").style.width=Math.min(100,L.current/L.need*100)+"%";
    $("#globalPoint").textContent=state.points.toLocaleString();
    $("#rewardPoint").textContent=state.points.toLocaleString();
    $("#rewardExp").textContent=state.xp.toLocaleString();
    $("#missionPang").textContent=`${Math.min(1,state.missions.pang)}/1`;
    $("#missionChef").textContent=`${Math.min(1,state.missions.chef)}/1`;
    $("#missionCampus").textContent=`${Math.min(1,state.missions.campus)}/1`;
    $("#chefCount").textContent=state.chefCount;
    $("#chefProgressFill").style.width=Math.min(100,state.chefCount/2*100)+"%";
    const all=state.missions.pang&&state.missions.chef&&state.missions.campus;
    if(all&&!state.rewardClaimed){state.points+=500;state.rewardClaimed=true;toast("TODAY MISSION ALL CLEAR! +500P");}
  }
  function grant(xp,p){state.xp+=xp;state.points+=p;updateGlobal()}
  function go(name){
    screens.forEach(s=>s.classList.remove("active"));
    const target=$("#screen-"+name); if(!target)return;
    target.classList.add("active");window.scrollTo({top:0,behavior:"smooth"});
    if(name==="avatar")renderCloset(); if(name==="campus")renderRanking(); updateGlobal();
  }
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));

  let tt; function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),1800)}

  function modal(title,text,reward,primaryText="확인",primary=closeModal){
    $("#modalTitle").textContent=title;$("#modalText").textContent=text;$("#modalReward").textContent=reward;
    $("#modalPrimary").textContent=primaryText;$("#modalPrimary").onclick=primary;
    $("#resultModal").classList.remove("hidden");
  }
  function closeModal(){$("#resultModal").classList.add("hidden")}
  $("#modalWorld").addEventListener("click",()=>{closeModal();go("world")});

  // -------- UNO PANG 7x7 --------
  const R=7,C=7,TYPES=["pizza","pasta","cheese","tomato","fork","package"];
  let pang={grid:[],selected:null,locked:false,playing:false,score:0,time:60,gauge:0,combo:1,best:1,timer:null,fever:false,feverLeft:0,feverTimer:null};
  const tileSrc=id=>`assets/${id}.png`;
  const rand=()=>TYPES[Math.floor(Math.random()*TYPES.length)];
  function pkey(r,c){return `${r},${c}`}
  function makeGrid(){
    pang.grid=Array.from({length:R},()=>Array(C).fill(null));
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){let id,tries=0;do{id=rand();tries++}while(tries<50&&((c>=2&&pang.grid[r][c-1]===id&&pang.grid[r][c-2]===id)||(r>=2&&pang.grid[r-1][c]===id&&pang.grid[r-2][c]===id)));pang.grid[r][c]=id}
  }
  function renderBoard(newAnim=false){
    const b=$("#pangBoard");b.innerHTML="";
    for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      const bt=document.createElement("button");bt.className="tile"+(pang.selected&&pang.selected.r===r&&pang.selected.c===c?" selected":"")+(newAnim?" new":"");bt.type="button";
      bt.innerHTML=`<img src="${tileSrc(pang.grid[r][c])}" alt="">`;bt.addEventListener("click",()=>tapTile(r,c));b.appendChild(bt)
    }
  }
  function swap(a,b){[pang.grid[a.r][a.c],pang.grid[b.r][b.c]]=[pang.grid[b.r][b.c],pang.grid[a.r][a.c]]}
  function adjacent(a,b){return Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1}
  function matches(){
    const s=new Set();
    for(let r=0;r<R;r++){let st=0;for(let c=1;c<=C;c++){if(c<C&&pang.grid[r][c]===pang.grid[r][st])continue;const len=c-st;if(pang.grid[r][st]!=null&&len>=3)for(let x=st;x<c;x++)s.add(pkey(r,x));st=c}}
    for(let c=0;c<C;c++){let st=0;for(let r=1;r<=R;r++){if(r<R&&pang.grid[r][c]===pang.grid[st][c])continue;const len=r-st;if(pang.grid[st]?.[c]!=null&&len>=3)for(let x=st;x<r;x++)s.add(pkey(x,c));st=r}}
    return s;
  }
  async function tapTile(r,c){
    if(!pang.playing||pang.locked)return;
    const cur={r,c};
    if(!pang.selected){pang.selected=cur;renderBoard();return}
    if(pang.selected.r===r&&pang.selected.c===c){pang.selected=null;renderBoard();return}
    if(!adjacent(pang.selected,cur)){pang.selected=cur;renderBoard();return}
    pang.locked=true;const a=pang.selected,b=cur;pang.selected=null;swap(a,b);renderBoard();await wait(110);
    let m=matches();if(!m.size){swap(a,b);renderBoard();pang.combo=1;$("#pangGuide").textContent="앗! 3개가 안 맞았어. 다른 조합을 찾아봐!";pang.locked=false;updatePang();return}
    await resolve(m);pang.locked=false;
  }
  async function resolve(m){
    let chain=0;
    while(m.size&&pang.playing){
      chain++;pang.combo=Math.min(9,chain);pang.best=Math.max(pang.best,pang.combo);
      m.forEach(k=>{const [r,c]=k.split(",").map(Number);$("#pangBoard").children[r*C+c]?.classList.add("match")});await wait(160);
      const count=m.size;pang.score+=count*120*pang.combo*(pang.fever?2:1);if(!pang.fever)addGauge(count*4+Math.max(0,count-3)*2);
      m.forEach(k=>{const [r,c]=k.split(",").map(Number);pang.grid[r][c]=null});collapse();fill();renderBoard(true);updatePang();await wait(160);m=matches()
    }
    $("#pangGuide").textContent=chain>1?`${chain} CHAIN! 연쇄 매치 성공!`:(pang.fever?"FEVER 중! 점수 2배!":"좋아! Meal Gauge를 계속 채워!")
  }
  function collapse(){for(let c=0;c<C;c++){let w=R-1;for(let r=R-1;r>=0;r--)if(pang.grid[r][c]!=null){pang.grid[w][c]=pang.grid[r][c];if(w!==r)pang.grid[r][c]=null;w--}}}
  function fill(){for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(pang.grid[r][c]==null)pang.grid[r][c]=rand()}
  function addGauge(n){pang.gauge=Math.min(100,pang.gauge+n);if(pang.gauge>=100&&!pang.fever)startFever()}
  function startFever(){pang.fever=true;pang.feverLeft=10;document.body.classList.add("fever");$("#feverBanner").classList.remove("hidden");clearInterval(pang.feverTimer);pang.feverTimer=setInterval(()=>{pang.feverLeft--;$("#feverBanner").textContent=`★ UNO FEVER ${pang.feverLeft}s ★`;if(pang.feverLeft<=0){clearInterval(pang.feverTimer);pang.fever=false;pang.gauge=0;document.body.classList.remove("fever");$("#feverBanner").classList.add("hidden");$("#feverBanner").textContent="★ UNO FEVER ★";updatePang()}},1000)}
  function updatePang(){$("#pangScore").textContent=String(pang.score).padStart(6,"0");$("#pangTime").textContent=pang.time;$("#pangCombo").textContent=`x${pang.combo}`;$("#gaugeText").textContent=`${Math.round(pang.gauge)}%`;$("#gaugeFill").style.width=pang.gauge+"%"}
  function startPang(){clearInterval(pang.timer);clearInterval(pang.feverTimer);document.body.classList.remove("fever");pang={...pang,selected:null,locked:false,playing:true,score:0,time:60,gauge:0,combo:1,best:1,fever:false};makeGrid();renderBoard();updatePang();$("#pangStart").disabled=true;pang.timer=setInterval(()=>{pang.time--;updatePang();if(pang.time<=0)endPang()},1000)}
  function endPang(){if(!pang.playing)return;pang.playing=false;pang.locked=true;clearInterval(pang.timer);clearInterval(pang.feverTimer);document.body.classList.remove("fever");$("#feverBanner").classList.add("hidden");$("#pangStart").disabled=false;const pts=Math.max(80,Math.floor(pang.score/80));grant(160,pts);state.missions.pang=1;updateGlobal();modal("UNO팡 탐사 완료!",`최종 SCORE ${pang.score.toLocaleString()} · BEST COMBO x${pang.best}`,`+160 EXP · +${pts}P`,"한 판 더",()=>{closeModal();startPang()})}
  function shuffle(){if(!pang.playing||pang.locked)return;let flat=pang.grid.flat();for(let i=flat.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[flat[i],flat[j]]=[flat[j],flat[i]]}pang.grid=Array.from({length:R},(_,r)=>flat.slice(r*C,(r+1)*C));pang.score=Math.max(0,pang.score-300);renderBoard(true);updatePang()}
  $("#pangStart").addEventListener("click",startPang);$("#pangShuffle").addEventListener("click",shuffle);makeGrid();renderBoard();updatePang();

  // -------- CHEF --------
  const sel=new Map(),positions=[[23,25],[55,20],[38,48],[70,55],[18,63],[52,72],[77,32],[33,77],[60,42],[40,15],[15,43],[76,73]];
  function renderPizza(){const l=$("#toppingLayer");l.innerHTML="";let i=0;[...sel.values()].forEach(v=>{for(let k=0;k<2;k++){const s=document.createElement("span");s.className="topping";s.textContent=v.emoji;const p=positions[i++%positions.length];s.style.left=p[0]+"%";s.style.top=p[1]+"%";s.style.transform="translate(-50%,-50%)";l.appendChild(s)}});const names=[...sel.values()].map(v=>v.name);$("#pizzaName").textContent=names.length?`${names.slice(0,2).join(" & ")} 피자`:"오리지널 치즈 피자"}
  $$(".ingredient").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.item;if(sel.has(id)){sel.delete(id);b.classList.remove("selected")}else{sel.set(id,{emoji:b.dataset.emoji,name:$("span",b).textContent});b.classList.add("selected")}renderPizza()}))
  $("#chefClear").addEventListener("click",()=>{sel.clear();$$(".ingredient").forEach(b=>b.classList.remove("selected"));renderPizza()})
  $("#chefBake").addEventListener("click",()=>{if(!sel.size){toast("토핑을 하나 이상 골라줘!");return}state.chefCount++;state.missions.chef=1;const unlock=state.chefCount===2;grant(140,130);modal("UNO Chef 완료!",unlock?"PINK SPACE HELMET 아이템이 해금됐어!":"피자 완성! 꾸미기 아이템에 한 걸음 더 가까워졌어.",`+140 EXP · +130P${unlock?" · HELMET UNLOCK":""}`,"또 만들기",()=>{closeModal();sel.clear();$$(".ingredient").forEach(b=>b.classList.remove("selected"));renderPizza()})});renderPizza();

  // -------- AVATAR --------
  const closet={
    helmet:[{n:"기본 헬멧",i:"🫧",ok:()=>true},{n:"핑크 헬멧",i:"🪖",ok:()=>state.chefCount>=2},{n:"골든 바이저",i:"🌟",ok:()=>levelInfo().level>=4}],
    suit:[{n:"핑크 우주복",i:"💗",ok:()=>true},{n:"블루 노바",i:"💙",ok:()=>levelInfo().level>=2},{n:"딥 스페이스",i:"🖤",ok:()=>levelInfo().level>=3}],
    acc:[{n:"없음",i:"✨",ok:()=>true},{n:"피자 안테나",i:"🍕",ok:()=>levelInfo().level>=2},{n:"로켓팩",i:"🚀",ok:()=>levelInfo().level>=3}]
  };
  function renderCloset(){const list=$("#closetList"),tab=state.avatar.tab;list.innerHTML="";closet[tab].forEach(it=>{const ok=it.ok();const b=document.createElement("button");b.className="closet-item"+(!ok?" locked":"")+(state.avatar.selected[tab]===it.n?" selected":"");b.disabled=!ok;b.innerHTML=`<span class="icon">${ok?it.i:"🔒"}</span><b>${it.n}</b><small>${ok?"사용 가능":"LOCKED"}</small>`;b.addEventListener("click",()=>{state.avatar.selected[tab]=it.n;renderCloset();$("#avatarTitle").textContent=(state.avatar.selected.suit+" EXPLORER").toUpperCase();toast(`${it.n} 장착 완료`)});list.appendChild(b)})}
  $$(".tab").forEach(t=>t.addEventListener("click",()=>{$$(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");state.avatar.tab=t.dataset.tab;renderCloset()}));renderCloset();

  // -------- REWARD --------
  $$(".redeem").forEach(b=>b.addEventListener("click",()=>{const cost=+b.dataset.cost;if(state.points<cost){toast(`${cost.toLocaleString()}P가 필요해!`);return}state.points-=cost;updateGlobal();modal("쿠폰 교환 완료!",`${b.dataset.name}이 보상함에 저장됐어.`,`-${cost.toLocaleString()}P`)}))

  // -------- CAMPUS --------
  let campus={running:false,round:0,timer:null};
  function renderRanking(){const arr=Object.entries(state.campusScores).sort((a,b)=>b[1]-a[1]);$("#rankList").innerHTML="";arr.forEach(([s,p],i)=>{const li=document.createElement("li");li.className="rank-row";li.innerHTML=`<span>${i+1}</span><b>${s}</b><em>${p.toLocaleString()}P</em>`;$("#rankList").appendChild(li)})}
  function schoolUI(){const s=$("#schoolSelect").value;$("#schoolTitle").textContent=s+" ORBIT";$("#schoolMark").textContent={"서강대학교":"S","연세대학교":"Y","홍익대학교":"H","이화여자대학교":"E"}[s]||"U"}
  $("#schoolSelect").addEventListener("change",schoolUI);$("#campusStart").addEventListener("click",()=>{if(campus.running)return;campus.running=true;campus.round=0;$("#campusRound").textContent=0;$("#tapButton").disabled=false;$("#campusStart").disabled=true;let t=10;$("#campusTimer").textContent=t+"s";clearInterval(campus.timer);campus.timer=setInterval(()=>{t--;$("#campusTimer").textContent=t+"s";if(t<=0){clearInterval(campus.timer);campus.running=false;$("#tapButton").disabled=true;$("#campusStart").disabled=false;$("#campusTimer").textContent="FINISH";const s=$("#schoolSelect").value,g=campus.round*20;state.campusScores[s]+=g;state.missions.campus=1;grant(90,Math.max(50,Math.floor(g/5)));renderRanking();modal("Campus League 반영!",`${s}에 ${g.toLocaleString()}P가 추가됐어.`,`개인 보상 +90 EXP`) }},1000)})
  $("#tapButton").addEventListener("click",()=>{if(!campus.running)return;campus.round++;$("#campusRound").textContent=campus.round});schoolUI();renderRanking();

  // SHOP
  $$(".shopBtn").forEach(b=>b.addEventListener("click",()=>toast("프로토타입: 실제 캠페인에서는 29CM 기획전으로 연결됩니다.")));

  function wait(ms){return new Promise(r=>setTimeout(r,ms))}
  updateGlobal();
})();

(() => {
  const navButtons=[...document.querySelectorAll(".bottom-nav [data-go]")];
  document.querySelectorAll("[data-go]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      navButtons.forEach(n=>n.classList.toggle("active",n.dataset.go===btn.dataset.go));
    });
  });
  if(navButtons[0]) navButtons[0].classList.add("active");
})();
