const $=id=>document.getElementById(id),R=Math.PI/180,D=180/Math.PI,norm=x=>(x%360+360)%360;
const state={lat:48.7219,lon:1.3696,name:'Vernouillet, France',offset:0,layers:{starlink:true,oneweb:true,station:true,science:true},target:[],display:new Map(),points:[],rot:0,drag:false,startX:0,startY:0,lastX:0,lastY:0,compass:false,heading:0,constellations:true,milky:true,labels:true,brightness:true,selected:null,workerReady:false,requestId:0,lastWorker:0,lastPasses:0,notified:new Set(),stationAlert:true,trainAlert:true,alertsArmed:true,latestPasses:[],catalogueMeta:null,fov:180,centerAz:0,centerEl:90,transitionStart:0,transitionDuration:1000,rawHeading:0,headingSource:'unknown',compassAccuracy:null,headingCorrection:Number(safeGet('sw_compass_correction')||0),selectedTrack:[],lastDiag:0};
const canvas=$('sky'),ctx=canvas.getContext('2d'),worker=new Worker('./orbit-worker.js?v=51');
const stars={
 Polaris:[37.9546,89.2641,1.98],
 Caph:[2.2945,59.1498,2.27],Schedar:[10.1271,56.5373,2.23],Navi:[14.1771,60.7167,2.47],Ruchbah:[21.4542,60.2353,2.68],Segin:[28.5988,63.6700,3.38],
 Alpheratz:[2.0969,29.0904,2.06],Mirach:[17.4330,35.6206,2.06],Almach:[30.9748,42.3297,2.26],
 Hamal:[31.7934,23.4624,2.00],Sheratan:[28.6600,20.8080,2.64],
 Mirfak:[51.0807,49.8612,1.79],Algol:[47.0422,40.9556,2.12],
 Aldebaran:[68.9800,16.5093,0.85],Elnath:[81.5729,28.6074,1.65],Alcyone:[56.8712,24.1051,2.87],
 Capella:[79.1723,45.9979,0.08],Menkalinan:[89.8822,44.9474,1.90],
 Betelgeuse:[88.7929,7.4071,0.42],Bellatrix:[81.2828,6.3497,1.64],Mintaka:[83.0017,-0.2991,2.25],Alnilam:[84.0534,-1.2019,1.69],Alnitak:[85.1897,-1.9426,1.74],Saiph:[86.9391,-9.6696,2.07],Rigel:[78.6345,-8.2016,0.13],
 Sirius:[101.2872,-16.7161,-1.46],Mirzam:[95.6750,-17.9559,1.98],Adhara:[104.6565,-28.9721,1.50],Wezen:[107.0979,-26.3932,1.83],
 Procyon:[114.8255,5.2250,0.34],Gomeisa:[111.7875,8.2893,2.89],
 Castor:[113.6494,31.8883,1.58],Pollux:[116.3289,28.0262,1.14],Alhena:[99.4279,16.3993,1.93],
 Regulus:[152.0929,11.9672,1.35],Algieba:[154.9931,19.8415,2.08],Zosma:[168.5271,20.5237,2.56],Denebola:[177.2649,14.5721,2.14],
 Alphard:[141.8968,-8.6586,1.98],
 Arcturus:[213.9153,19.1824,-0.05],Muphrid:[208.6713,18.3977,2.68],Izar:[221.2467,27.0742,2.35],
 Spica:[201.2983,-11.1613,0.98],Vindemiatrix:[195.5442,10.9591,2.83],
 Alphecca:[233.6720,26.7147,2.22],
 Antares:[247.3519,-26.4320,0.96],Dschubba:[240.0834,-22.6217,2.32],Acrab:[241.3593,-19.8055,2.56],Shaula:[263.4022,-37.1038,1.62],Lesath:[262.6909,-37.2958,2.70],
 Rasalhague:[263.7336,12.5600,2.07],Cebalrai:[265.8681,4.5673,2.76],
 Kornephoros:[247.5550,21.4896,2.77],Rasalgethi:[258.6619,14.3903,2.78],
 Vega:[279.2347,38.7837,0.03],Sheliak:[282.5199,33.3627,3.45],Sulafat:[284.7359,32.6896,3.25],
 Eltanin:[269.1516,51.4889,2.24],Rastaban:[262.6082,52.3014,2.79],
 Deneb:[310.3580,45.2803,1.25],Sadr:[305.5571,40.2567,2.23],Gienah:[292.6804,33.9703,2.46],Albireo:[292.6803,27.9597,3.05],
 Altair:[297.6958,8.8683,0.77],Tarazed:[296.5649,10.6133,2.72],Alshain:[298.8283,6.4068,3.71],
 Enif:[326.0465,9.8750,2.39],
 Markab:[346.1902,15.2053,2.49],Scheat:[345.9436,28.0828,2.44],
 Fomalhaut:[344.4128,-29.6222,1.16],
 Diphda:[10.8974,-17.9866,2.04],Menkar:[45.5700,4.0897,2.53],
 Nunki:[283.8163,-26.2967,2.05],KausAustralis:[276.0429,-34.3846,1.79],
 Kochab:[222.6760,74.1555,2.08],Pherkad:[230.1823,71.8340,3.05],
 Dubhe:[165.9319,61.7510,1.79],Merak:[165.4603,56.3824,2.37],Phecda:[178.4577,53.6948,2.44],Megrez:[183.8565,57.0326,3.31],Alioth:[193.5073,55.9598,1.76],Mizar:[200.9814,54.9254,2.23],Alkaid:[206.8852,49.3133,1.85]
};
const lines=[['Ursa Major',['Dubhe','Merak','Phecda','Megrez','Alioth','Mizar','Alkaid']],['Cassiopeia',['Caph','Schedar','Navi','Ruchbah','Segin']],['Orion',['Betelgeuse','Bellatrix','Mintaka','Alnilam','Alnitak','Saiph','Rigel']],['Lyra',['Vega','Sheliak','Sulafat','Vega']],['Cygnus',['Deneb','Sadr','Gienah'],['Deneb','Sadr','Albireo']],['Aquila',['Tarazed','Altair','Alshain']],['Leo',['Regulus','Algieba','Zosma','Denebola']],['Gemini',['Castor','Pollux']],['Taurus',['Aldebaran','Elnath']]];
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
let statusTimer=null;
function status(a,b,type=''){
  const e=$('status');
  if(statusTimer){clearTimeout(statusTimer);statusTimer=null}
  e.className='status '+type;
  e.innerHTML='<b>'+a+'</b><span>'+b+'</span>';
  if(type==='good'){
    statusTimer=setTimeout(()=>e.classList.add('hidden'),1800);
  }else{
    e.classList.remove('hidden');
  }
}
function julian(date){return date/86400000+2440587.5}
function gmst(date){const jd=julian(date),T=(jd-2451545)/36525;return norm(280.46061837+360.98564736629*(jd-2451545)+.000387933*T*T-T*T*T/38710000)}
function precessJ2000(ra,dec,date){
  const jd=julian(date),T=(jd-2451545.0)/36525;
  const zeta=(2306.2181*T+0.30188*T*T+0.017998*T*T*T)/3600*R;
  const z=(2306.2181*T+1.09468*T*T+0.018203*T*T*T)/3600*R;
  const theta=(2004.3109*T-0.42665*T*T-0.041833*T*T*T)/3600*R;
  const a=ra*R,d=dec*R;
  const A=Math.cos(d)*Math.sin(a+zeta);
  const B=Math.cos(theta)*Math.cos(d)*Math.cos(a+zeta)-Math.sin(theta)*Math.sin(d);
  const C=Math.sin(theta)*Math.cos(d)*Math.cos(a+zeta)+Math.cos(theta)*Math.sin(d);
  return{ra:norm((Math.atan2(A,B)+z)*D),dec:Math.asin(Math.max(-1,Math.min(1,C)))*D};
}
function refractionDeg(el){
  if(el<=-1||el>=89.8)return 0;
  const x=(el+10.3/(el+5.11))*R;
  return (1.02/Math.tan(x))/60;
}
function apparentElevation(el){return el+refractionDeg(el)}
function altaz(ra,dec,date){
  const p=precessJ2000(ra,dec,date);
  const H=norm(gmst(date)+state.lon-p.ra)*R,ph=state.lat*R,de=p.dec*R;
  const el=Math.asin(Math.sin(ph)*Math.sin(de)+Math.cos(ph)*Math.cos(de)*Math.cos(H));
  const az=Math.atan2(-Math.sin(H)*Math.cos(de),Math.sin(de)*Math.cos(ph)-Math.cos(de)*Math.sin(ph)*Math.cos(H));
  const geometricEl=el*D;
  return{az:norm(az*D),el:apparentElevation(geometricEl),geometricEl};
}

function altazIndependent(ra,dec,date){
  const p=precessJ2000(ra,dec,date),theta=(gmst(date)+state.lon)*R,a=p.ra*R,d=p.dec*R,phi=state.lat*R;
  const x=Math.cos(d)*Math.cos(a),y=Math.cos(d)*Math.sin(a),z=Math.sin(d);
  const xe=Math.cos(theta)*x+Math.sin(theta)*y,ye=-Math.sin(theta)*x+Math.cos(theta)*y,ze=z;
  const east=ye,north=-Math.sin(phi)*xe+Math.cos(phi)*ze,up=Math.cos(phi)*xe+Math.sin(phi)*ze;
  const geometricEl=Math.asin(Math.max(-1,Math.min(1,up)))*D;
  return{az:norm(Math.atan2(east,north)*D),el:apparentElevation(geometricEl),geometricEl};
}
function angularSepAltAz(a,b){
  const e1=a.el*R,e2=b.el*R,da=headingDelta(a.az,b.az)*R;
  return Math.acos(Math.max(-1,Math.min(1,Math.sin(e1)*Math.sin(e2)+Math.cos(e1)*Math.cos(e2)*Math.cos(da))))*D;
}
function galToEq(l,b=0){const lr=l*R,br=b*R;const x=Math.cos(br)*Math.cos(lr),y=Math.cos(br)*Math.sin(lr),z=Math.sin(br);const ex=-.0548755604*x+.4941094279*y-.8676661490*z,ey=-.8734370902*x-.4448296300*y-.1980763734*z,ez=-.4838350155*x+.7469822445*y+.4559837762*z;return{ra:norm(Math.atan2(ey,ex)*D),dec:Math.asin(ez)*D}}
const timeEngine={wallAtStart:Date.now(),perfAtStart:performance.now()};
function viewTime(){return new Date(timeEngine.wallAtStart+(performance.now()-timeEngine.perfAtStart)+state.offset*60000)}
function screenAngle(){
  const a=(screen.orientation&&typeof screen.orientation.angle==='number')?screen.orientation.angle:(typeof window.orientation==='number'?window.orientation:0);
  return Number.isFinite(a)?a:0;
}
function rawScreenHeading(){
  return state.headingSource==='webkit'
    ? norm(state.rawHeading)
    : norm(state.rawHeading+screenAngle());
}
function correctedHeading(){return norm(rawScreenHeading()+state.headingCorrection)}
function headingDelta(a,b){return ((a-b+540)%360)-180}

function rotation(){return state.compass?-state.heading:state.rot}
function project(az,el,w,h){
  if(state.fov>=180){
    const cx=w/2,cy=h*.54,rad=Math.min(w*.46,h*.405),rho=(90-el)/90*rad;
    const topHeading=state.compass?state.heading:0;
    const a=(az-topHeading+state.rot)*R;
    return{x:cx+rho*Math.sin(a),y:cy-rho*Math.cos(a),rad,visible:el>=0};
  }
  const cx=w/2,cy=h*.52;
  const radius=Math.min(w*.46,h*.42);
  const angularDistance=90-el;
  const topHeading=state.compass?state.heading:state.centerAz;
  const a=(az-topHeading)*R;
  const rho=(angularDistance/(state.fov/2))*radius;
  return{x:cx+rho*Math.sin(a),y:cy-rho*Math.cos(a),rad:radius,visible:el>=0&&angularDistance<=state.fov/2};
}
function compassLabel(deg){
  const d=norm(deg);
  if(d===0)return'N';
  if(d===90)return'E';
  if(d===180)return'S';
  if(d===270)return'W';
  return Math.round(d)+'°';
}
function drawCompassEdge(w,h){
  const focused=state.fov<180;
  const cx=w/2,cy=focused?h*.52:h*.54;
  const rad=focused?Math.min(w*.46,h*.42):Math.min(w*.46,h*.405);
  const topHeading=state.compass?state.heading:(focused?state.centerAz:0);
  ctx.save();
  ctx.font='9px -apple-system';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  for(let bearing=0;bearing<360;bearing+=30){
    const ang=(bearing-topHeading+(focused?0:state.rot))*R;
    const sin=Math.sin(ang),cos=Math.cos(ang);
    const x1=cx+(rad-5)*sin,y1=cy-(rad-5)*cos;
    const x2=cx+rad*sin,y2=cy-rad*cos;
    ctx.strokeStyle=(bearing%90===0)?'rgba(174,192,226,.48)':'rgba(130,149,186,.26)';
    ctx.lineWidth=(bearing%90===0)?1.2:.8;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const lr=rad-15,lx=cx+lr*sin,ly=cy-lr*cos;
    ctx.fillStyle=(bearing%90===0)?'rgba(202,216,241,.76)':'rgba(150,165,197,.50)';
    ctx.fillText(compassLabel(bearing),lx,ly);
  }
  // phone-heading index at the top of the field
  if(state.compass){
    ctx.fillStyle='rgba(98,227,255,.85)';
    ctx.beginPath();
    ctx.moveTo(cx,cy-rad+3);ctx.lineTo(cx-4,cy-rad+10);ctx.lineTo(cx+4,cy-rad+10);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0)}
function drawMilky(date,w,h){if(!state.milky)return;const tracks=[-8,0,8];for(const b of tracks){ctx.beginPath();let started=false;for(let l=0;l<=360;l+=3){const e=galToEq(l,b),q=altaz(e.ra,e.dec,date);if(q.el<0){started=false;continue}const p=project(q.az,q.el,w,h);if(!p.visible){started=false;continue}if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}ctx.strokeStyle=b===0?'rgba(124,151,220,.13)':'rgba(124,151,220,.055)';ctx.lineWidth=b===0?20:12;ctx.stroke()}}
function airmass(el){
  if(el<=0)return 99;
  return 1/(Math.sin(el*R)+0.50572*Math.pow(el+6.07995,-1.6364));
}
function drawStars(date,w,h){
  const pos={},visible=[];
  state.visibleStars=[];
  for(const [name,s] of Object.entries(stars)){
    const q=altaz(s[0],s[1],date);
    if(q.el<=0)continue;
    const pp=project(q.az,q.el,w,h);
    const ext=q.el>3?0.18*Math.max(0,airmass(q.el)-1):2.5;
    const apparentMag=s[2]+ext;
    if(pp.visible){
      pos[name]=pp;
      visible.push({name,ra:s[0],dec:s[1],mag:s[2],apparentMag,az:q.az,el:q.el,p:pp});
      state.visibleStars.push({name,az:q.az,el:q.el,apparentMag});
    }
  }
  if(state.constellations){
    ctx.lineWidth=.75;ctx.strokeStyle='rgba(126,151,205,.24)';
    for(const item of lines){
      const seqs=Array.isArray(item[1][0])?item.slice(1):[item[1]];
      for(const seq of seqs){
        ctx.beginPath();let begun=false;
        for(const n of seq){
          if(!pos[n]){begun=false;continue}
          if(!begun){ctx.moveTo(pos[n].x,pos[n].y);begun=true}else ctx.lineTo(pos[n].x,pos[n].y)
        }
        ctx.stroke();
      }
    }
  }
  visible.sort((a,b)=>a.apparentMag-b.apparentMag);
  const labelSet=new Set(visible.filter(s=>s.el>6&&s.apparentMag<3.25).slice(0,24).map(s=>s.name));
  for(const s of visible){
    const size=Math.max(1.15,3.7-s.mag);
    ctx.beginPath();
    ctx.fillStyle=s.mag<.6?'#ffd977':'#edf2ff';
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=s.apparentMag<1.3?6:2;
    ctx.arc(s.p.x,s.p.y,size,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    if(labelSet.has(s.name)){
      ctx.fillStyle='#aeb9d5';ctx.font='9px -apple-system';
      ctx.fillText(s.name,s.p.x+5,s.p.y-4);
    }
  }
}
function interpAngle(a,b,k){let d=((b-a+540)%360)-180;return norm(a+d*k)}
function updateDisplay(){const k=Math.max(0,Math.min(1,(performance.now()-state.transitionStart)/state.transitionDuration));const seen=new Set();for(const s of state.target){const id=String(s.id);seen.add(id);let d=state.display.get(id);if(!d){d={...s,fromAz:s.az,fromEl:s.el,toAz:s.az,toEl:s.el};state.display.set(id,d)}d.az=interpAngle(d.fromAz??d.az,d.toAz??d.az,k);d.el=(d.fromEl??d.el)+((d.toEl??d.el)-(d.fromEl??d.el))*k;d.alt=s.alt;d.range=s.range;d.sunlit=s.sunlit;d.mag=s.mag;d.layer=s.layer;d.name=s.name;d.phase=s.phase}for(const[id,d]of state.display){if(!seen.has(id)&&d.el<-2)state.display.delete(id)}}
function beginTransition(next){const cur=new Map();for(const[id,d]of state.display)cur.set(id,{az:d.az,el:d.el});state.target=next;for(const s of next){const id=String(s.id);let d=state.display.get(id);if(!d){d={...s,fromAz:s.az,fromEl:s.el,toAz:s.az,toEl:s.el};state.display.set(id,d)}else{const c=cur.get(id)||{az:d.az,el:d.el};d.fromAz=c.az;d.fromEl=c.el;d.toAz=s.az;d.toEl=s.el}}state.transitionStart=performance.now();state.transitionDuration=1000}
function satColor(layer,sunlit){if(layer==='station')return'#ffd56e';if(layer==='science')return'#ffa76b';if(layer==='oneweb')return sunlit?'#c69cff':'#6f6788';return sunlit?'#62e3ff':'#647494'}
function drawSatellites(w,h){
  updateDisplay();state.points=[];const date=viewTime();
  const arr=[...state.display.values()].filter(s=>s.el>=0&&state.layers[s.layer]).sort((a,b)=>a.mag-b.mag);
  for(const s of arr){
    const drawEl=apparentElevation(s.el),p=project(s.az,drawEl,w,h);if(!p.visible)continue;
    const cls=visibilityClass(s,date);let c='#71809d',size=2.5,fill=true,glow=0;
    if(cls==='likely'){c='#fff';size=s.layer==='station'?5.5:4;glow=10}
    else if(cls==='possible'){c='#ffd56e';size=s.layer==='station'?5:3.5;glow=6}
    else if(cls==='shadow'){c='#5c6880';size=3;fill=false}
    ctx.beginPath();ctx.strokeStyle=c;ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=glow;ctx.arc(p.x,p.y,size,0,Math.PI*2);
    if(fill)ctx.fill();else{ctx.lineWidth=1;ctx.stroke()}ctx.shadowBlur=0;
    if(cls==='likely'){ctx.beginPath();ctx.strokeStyle=satColor(s.layer,s.sunlit);ctx.lineWidth=1;ctx.arc(p.x,p.y,size+2.5,0,Math.PI*2);ctx.stroke()}
    if(state.labels&&(s.layer==='station'||s.layer==='science'||cls==='likely')){ctx.fillStyle='#d9e1f5';ctx.font='9px -apple-system';ctx.fillText(s.name.replace('STARLINK-','SL-'),p.x+7,p.y-5)}
    if(state.selected&&String(state.selected.id)===String(s.id)){ctx.strokeStyle='#62e3ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,size+7,0,Math.PI*2);ctx.stroke()}
    state.points.push({...s,visibility:cls,apparentEl:drawEl,x:p.x,y:p.y});
  }
  if(state.selectedTrack.length>1){
    ctx.save();ctx.strokeStyle='rgba(98,227,255,.55)';ctx.lineWidth=1.3;ctx.setLineDash([5,5]);ctx.beginPath();let started=false;
    for(const q of state.selectedTrack){const p=project(q.az,apparentElevation(q.el),w,h);if(!p.visible){started=false;continue}if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}
    ctx.stroke();ctx.restore();
  }
  $('above').textContent=arr.length;$('sunlit').textContent=arr.filter(x=>x.sunlit).length;$('bright').textContent=arr.filter(x=>visibilityClass(x,date)==='likely').length;
  const count=l=>arr.filter(x=>x.layer===l).length;$('countStarlink').textContent=count('starlink');$('countOneweb').textContent=count('oneweb');$('countStation').textContent=count('station');$('countScience').textContent=count('science');
}

function updateDiagnostics(date){
  if(performance.now()-state.lastDiag<500)return;state.lastDiag=performance.now();
  const jd=julian(date),lst=norm(gmst(date)+state.lon),v=stars.Vega,p=stars.Polaris;
  const v1=altaz(v[0],v[1],date),v2=altazIndependent(v[0],v[1],date),v10=altaz(v[0],v[1],new Date(date.getTime()+600000));
  const pol=altaz(p[0],p[1],date),pol2=altazIndependent(p[0],p[1],date);
  const cross=Math.max(angularSepAltAz(v1,v2),angularSepAltAz(pol,pol2));
  $('diagUtc').textContent=date.toISOString().replace('T',' ').slice(0,19);$('diagJd').textContent=jd.toFixed(6);$('diagLst').textContent=(lst/15).toFixed(4)+' h';
  $('diagCross').textContent=(cross*60).toFixed(3)+' arcmin';
  $('diagVegaNow').textContent='Now: '+cardinal(v1.az)+' '+v1.az.toFixed(1)+'° / '+v1.el.toFixed(1)+'° high';
  $('diagVega10').textContent='+10 min: '+cardinal(v10.az)+' '+v10.az.toFixed(1)+'° / '+v10.el.toFixed(1)+'° high';
  $('diagVegaMotion').textContent='Angular movement in 10 min: '+angularSepAltAz(v1,v10).toFixed(2)+'°';
  $('diagPolaris').textContent=cardinal(pol.az)+' '+pol.az.toFixed(1)+'° / '+pol.el.toFixed(1)+'° high';
  $('diagStatus').textContent=cross<0.01?'PASS — two independent horizontal-coordinate transforms agree to <0.01°.':'CHECK — transform disagreement '+cross.toFixed(3)+'°.';
}
function draw(){requestAnimationFrame(draw);const r=canvas.getBoundingClientRect(),w=r.width,h=r.height,date=viewTime();ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w/2,h*.52,20,w/2,h*.52,Math.max(w,h)*.65);g.addColorStop(0,'#152142');g.addColorStop(1,'#020510');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);drawMilky(date,w,h);ctx.lineWidth=1;ctx.strokeStyle='#33405e';ctx.fillStyle='#96a3c0';ctx.font='11px -apple-system';if(state.fov>=180){const p0=project(0,0,w,h),rad=p0.rad,cx=w/2,cy=h*.54;for(const el of[0,30,60]){ctx.beginPath();ctx.arc(cx,cy,(90-el)/90*rad,0,Math.PI*2);ctx.stroke()}for(let a=0;a<360;a+=45){const p=project(a,0,w,h);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(p.x,p.y);ctx.stroke()}for(const[t,a]of[['N',0],['E',90],['S',180],['W',270]]){const p=project(a,-5,w,h);ctx.fillText(t,p.x-4,p.y+4)}}else{const cx=w/2,cy=h*.52,rad=Math.min(w,h*.9)/2;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-rad,cy);ctx.lineTo(cx+rad,cy);ctx.moveTo(cx,cy-rad);ctx.lineTo(cx,cy+rad);ctx.stroke();const head=state.compass?state.heading:state.centerAz;
ctx.fillText(cardinal(head)+' '+Math.round(norm(head))+'°',cx-24,cy-rad+16);
ctx.fillText('ZENITH',cx,cy+4)}drawCompassEdge(w,h);drawStars(date,w,h);drawSatellites(w,h);updateDiagnostics(date);$('utc').textContent='UTC '+date.toISOString().slice(11,19)}
function requestPositions(force=false){if(!state.workerReady)return;const now=performance.now();if(!force&&now-state.lastWorker<950)return;state.lastWorker=now;worker.postMessage({type:'calc',requestId:++state.requestId,time:viewTime().getTime(),lat:state.lat,lon:state.lon,layers:state.layers})}
setInterval(()=>requestPositions(),1000);
worker.onerror=e=>{const d=$('diagWorker');if(d)d.textContent='ERROR';status('Orbit worker error',e.message||'Worker failed to start','warn')};
worker.onmessage=e=>{const m=e.data;if(m.type==='ready'){state.workerReady=true;$('diagWorker').textContent='ready • '+m.count.toLocaleString()+' objects';status('Live orbital engine ready',m.count.toLocaleString()+' objects loaded','good');requestPositions(true);requestPasses(true)}if(m.type==='positions'){beginTransition(m.positions);checkAlerts(m.positions)}if(m.type==='passes'){renderPasses(m.passes)}if(m.type==='track'){state.selectedTrack=m.track||[]}};
async function loadCatalogue(force=false){status('Loading orbital catalogue…','Starlink, OneWeb, stations and Hubble');try{let r=await fetch('./data/catalogue.json?'+(force?Date.now():'v=4'),{cache:force?'no-store':'default'});if(!r.ok)throw new Error('HTTP '+r.status);const p=await r.json();if(!p.objects||p.objects.length<100)throw new Error('Catalogue has not been populated yet');state.catalogueMeta=p.meta||{};worker.postMessage({type:'catalogue',objects:p.objects});const dt=p.meta&&p.meta.fetched_at?new Date(p.meta.fetched_at):null;if(dt){const age=(Date.now()-dt)/3600000;$('catalogueAge').textContent=age<1?Math.round(age*60)+' min old':age.toFixed(1)+' h old'}$('catalogueInfo').textContent=(p.meta.count||p.objects.length).toLocaleString()+' orbital records • '+(dt?'updated '+dt.toLocaleString():'update time unknown')}catch(e){status('Orbital catalogue unavailable',e.message+'. Run the GitHub “Update orbital catalogue” workflow once.','warn')}}
function requestPasses(force=false){if(!state.workerReady)return;if(!force&&Date.now()-state.lastPasses<60000)return;state.lastPasses=Date.now();worker.postMessage({type:'passes',time:viewTime().getTime(),lat:state.lat,lon:state.lon,layers:state.layers,minutes:360,step:2,minEl:20,maxMag:5})}

function solarRaDec(date){
  const n=julian(date)-2451545.0,L=norm(280.460+0.9856474*n),g=norm(357.528+0.9856003*n)*R;
  const lam=(L+1.915*Math.sin(g)+0.020*Math.sin(2*g))*R,eps=(23.439-0.0000004*n)*R;
  return{ra:norm(Math.atan2(Math.cos(eps)*Math.sin(lam),Math.cos(lam))*D),dec:Math.asin(Math.sin(eps)*Math.sin(lam))*D};
}
function sunAltitude(date){const s=solarRaDec(date);return altaz(s.ra,s.dec,date).geometricEl}
function visibilityClass(s,date){
  if(!s.sunlit)return'shadow';
  const sunEl=sunAltitude(date),mag=Number.isFinite(s.mag)?s.mag:99;
  if(s.el>=12&&mag<=4.0&&sunEl<=-4)return'likely';
  if(s.el>=7&&mag<=5.7&&sunEl<=1)return'possible';
  return'dim';
}
function cardinal(a){return['N','NE','E','SE','S','SW','W','NW'][Math.round(norm(a)/45)%8]}
function updateCompassInfo(){
  const box=$('compassInfo');if(!box)return;
  if(!state.compass){box.textContent='Compass not enabled yet.';return}
  const acc=state.compassAccuracy;
  const accText=(typeof acc==='number'&&acc>=0)?(' ±'+Math.round(acc)+'°'):'';
  const corr=Math.abs(state.headingCorrection)<.05?'':(' • correction '+(state.headingCorrection>=0?'+':'')+state.headingCorrection.toFixed(1)+'°');
  const quality=(typeof acc==='number'&&acc<0)?' • calibration unreliable':((typeof acc==='number'&&acc>20)?' • low accuracy':'');
  box.textContent='Heading '+Math.round(state.heading)+'° '+cardinal(state.heading)+accText+corr+quality+' • '+(state.headingSource==='webkit'?'iPhone compass':'orientation fallback');
}
function updateOrientationPill(){
  const az=state.compass?norm(state.heading):norm(state.centerAz);
  if(state.fov>=180){
    $('orientationPill').textContent=state.compass?(cardinal(az)+' '+Math.round(az)+'°'):'N • zenith';
  }else{
    $('orientationPill').textContent=(state.compass?cardinal(az)+' '+Math.round(az)+'° • ':'')+state.fov+'° zenith';
  }
}
function renderPasses(passes){
  state.latestPasses=passes||[];
  const list=$('passList');list.innerHTML='';
  if(!passes.length){
    list.innerHTML='<div class="empty">No sunlit passes brighter than magnitude 5 are predicted in the next six hours.</div>';
    $('nextTime').textContent='None soon';$('nextDesc').textContent='';
    evaluatePassAlerts([]);
    return;
  }
  for(const p of passes.slice(0,15)){
    const t=new Date(Date.now()+p.start*60000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const d=document.createElement('div');d.className='pass-item';
    d.innerHTML='<div><b>'+p.name+'</b><span>'+cardinal(p.startAz)+' → '+cardinal(p.endAz)+' • peak '+Math.round(p.max)+'° • est. mag '+p.minMag.toFixed(1)+'</span></div><strong>'+t+'</strong>';
    list.appendChild(d);
  }
  const p=passes[0];
  $('nextTime').textContent=new Date(Date.now()+p.start*60000).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  $('nextDesc').textContent=p.name+' • '+cardinal(p.startAz)+' → '+cardinal(p.endAz)+' • mag '+p.minMag.toFixed(1);
  evaluatePassAlerts(passes);
}
function evaluatePassAlerts(passes){
  if(!state.alertsArmed)return;
  if(state.stationAlert){
    const p=passes.find(x=>x.layer==='station'&&x.start>=0&&x.start<=10&&x.minMag<=3);
    if(p){
      const bucket=Math.floor((viewTime().getTime()+p.start*60000)/600000);
      const key='station-upcoming-'+p.id+'-'+bucket;
      if(!state.notified.has(key)){
        state.notified.add(key);
        fireAlert(p.name+' pass in '+Math.max(1,Math.round(p.start))+' min',
          'Look '+cardinal(p.startAz)+' → '+cardinal(p.endAz)+' • peak '+Math.round(p.max)+'° • estimated mag '+p.minMag.toFixed(1));
      }
    }
  }
}
function checkAlerts(arr){if(state.offset!==0)return;const now=timeEngine.wallAtStart+(performance.now()-timeEngine.perfAtStart);if(state.stationAlert){for(const s of arr.filter(x=>x.layer==='station'&&x.sunlit&&x.el>10&&x.mag<2)){const key='station-'+s.id+'-'+new Date().toDateString();if(!state.notified.has(key)){state.notified.add(key);fireAlert(s.name+' is visible now',Math.round(s.el)+'° high toward '+cardinal(s.az)+' • estimated mag '+s.mag.toFixed(1))}}}
 if(state.trainAlert){const sl=arr.filter(x=>x.layer==='starlink'&&x.sunlit&&x.el>10&&x.mag<5);let best=[];for(const a of sl){const group=sl.filter(b=>Math.abs(b.el-a.el)<7&&Math.abs((((b.az-a.az)+540)%360)-180)<10);if(group.length>best.length)best=group}if(best.length>=5){const key='train-'+Math.floor(now/1800000);if(!state.notified.has(key)){state.notified.add(key);fireAlert('Possible Starlink train visible',best.length+' sunlit Starlinks clustered near '+cardinal(best[0].az))}}}
}
let alertHideTimer=null;
function fireAlert(title,body){
  $('alertStatus').textContent=title+' — '+body;
  $('alertBannerTitle').textContent=title;
  $('alertBannerBody').textContent=body;
  $('alertBanner').classList.add('show');
  if(alertHideTimer)clearTimeout(alertHideTimer);
  alertHideTimer=setTimeout(()=>$('alertBanner').classList.remove('show'),12000);
  if(navigator.vibrate)try{navigator.vibrate([120,80,120])}catch(e){}
  if('Notification'in window && Notification.permission==='granted' && navigator.serviceWorker){
    navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,icon:'./icons/icon-192.svg',tag:title})).catch(()=>{});
  }
}
function setLocation(lat,lon,name){
  state.lat=lat;state.lon=lon;state.name=name;
  $('locname').textContent=name;
  $('coords').textContent=Math.abs(lat).toFixed(4)+'° '+(lat>=0?'N':'S')+' · '+Math.abs(lon).toFixed(4)+'° '+(lon>=0?'E':'W');
  const card=document.querySelector('.location');
  card.classList.remove('applied');void card.offsetWidth;card.classList.add('applied');
  $('locationResults').classList.remove('show');
  $('locationResults').innerHTML='';
  safeSet('sw3_loc',JSON.stringify({lat,lon,name}));
  state.lastPasses=0;
  requestPositions(true);
  requestPasses(true);populateCalibrationStars();
  $('alertStatus').textContent='Location updated to '+name+'. Pass alerts and predictions have been recalculated.';
}
function populateCalibrationStars(){
  const sel=$('calStar');if(!sel)return;
  const date=viewTime(),items=[];
  for(const [name,s] of Object.entries(stars)){
    const q=altaz(s[0],s[1],date);
    if(q.el<15)continue;
    const ext=0.18*Math.max(0,airmass(q.el)-1);
    items.push({name,mag:s[2]+ext,az:q.az,el:q.el});
  }
  items.sort((a,b)=>a.mag-b.mag);
  const keep=sel.value;
  sel.innerHTML='<option value="">Visible bright stars…</option>';
  for(const x of items.slice(0,18)){
    const o=document.createElement('option');
    o.value=x.name;o.textContent=x.name+' — '+cardinal(x.az)+' '+Math.round(x.az)+'° / '+Math.round(x.el)+'° high';
    sel.appendChild(o);
  }
  if([...sel.options].some(o=>o.value===keep))sel.value=keep;
}
async function calibrateCompassToStar(){
  try{if(!state.compass)await enableCompass()}catch(e){status('Compass unavailable',e.message,'warn');return}
  const name=$('calStar').value;
  if(!name||!stars[name]){status('Choose a calibration star','Select a clearly visible bright star first.','warn');return}
  const s=stars[name],q=altaz(s[0],s[1],viewTime());
  const raw=rawScreenHeading();
  state.headingCorrection=headingDelta(q.az,raw);
  safeSet('sw_compass_correction',String(state.headingCorrection));
  state.heading=correctedHeading();
  updateOrientationPill();updateCompassInfo();
  $('compassInfo').textContent+=' • aligned on '+name+' at true az '+Math.round(q.az)+'°';
  status('Compass star-aligned',name+' fixes magnetic declination and sensor heading offset for this session/location.','good');
}
function resetCompassCorrection(){
  state.headingCorrection=0;safeSet('sw_compass_correction','0');state.heading=correctedHeading();
  updateOrientationPill();updateCompassInfo();
}
async function findPlace(){
  const q=$('place').value.trim();
  if(!q)return;
  const box=$('locationResults');
  box.innerHTML='<button class="location-choice"><b>Searching…</b><span>'+q+'</span></button>';
  box.classList.add('show');
  try{
    const r=await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q='+encodeURIComponent(q),{headers:{'Accept-Language':navigator.language||'en'}});
    const a=await r.json();
    if(!Array.isArray(a)||!a.length)throw new Error('Place not found');
    box.innerHTML='';
    a.forEach(item=>{
      const b=document.createElement('button');
      b.className='location-choice';
      const title=(item.name||item.display_name.split(',')[0]||q);
      b.innerHTML='<b>'+title.replace(/[<>&]/g,'')+'</b><span>'+item.display_name.replace(/[<>&]/g,'')+'</span>';
      b.onclick=()=>setLocation(+item.lat,+item.lon,item.display_name);
      box.appendChild(b);
    });
    box.classList.add('show');
  }catch(e){
    box.innerHTML='<button class="location-choice"><b>Location search failed</b><span>'+e.message+'</span></button>';
    box.classList.add('show');
  }
}
function geolocate(){navigator.geolocation.getCurrentPosition(p=>setLocation(p.coords.latitude,p.coords.longitude,'Current location'),e=>status('Location unavailable','Allow precise location or type a place.','warn'),{enableHighAccuracy:true,timeout:12000,maximumAge:180000})}
function satelliteRole(s){
  if(s.layer==='starlink')return 'Broadband communications';
  if(s.layer==='oneweb')return 'Broadband communications';
  if(s.layer==='station'){
    if((s.name||'').toUpperCase().includes('ISS'))return 'Crewed research station';
    if((s.name||'').toUpperCase().includes('TIANGONG')||(s.name||'').toUpperCase().includes('CSS'))return 'Crewed research station';
    return 'Space station';
  }
  if(s.layer==='science')return 'Space telescope / science';
  return 'Artificial satellite';
}
function serviceYear(s){
  const id=String(s.objectId||'');
  const m=id.match(/^(\d{4})-/);
  return m?m[1]:'Unknown';
}
function epochAgeText(s){
  if(!s.epoch)return 'Unknown';
  const t=new Date(s.epoch).getTime();
  if(!Number.isFinite(t))return 'Unknown';
  const h=Math.max(0,(viewTime().getTime()-t)/3600000);
  if(h<1)return Math.round(h*60)+' min';
  if(h<48)return h.toFixed(1)+' h';
  return (h/24).toFixed(1)+' d';
}
function satClick(e){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=250;for(const p of state.points){const d=(p.x-x)**2+(p.y-y)**2;if(d<bd){best=p;bd=d}}if(!best)return;state.selected=best;state.selectedTrack=[];worker.postMessage({type:'track',id:best.id,time:viewTime().getTime(),lat:state.lat,lon:state.lon,seconds:180,step:5});$('satName').textContent=best.name;$('satEl').textContent=(best.apparentEl??best.el).toFixed(1)+'° apparent';$('satAz').textContent=best.az.toFixed(1)+'° '+cardinal(best.az);$('satAlt').textContent=Math.round(best.alt)+' km';
$('satRange').textContent=Math.round(best.range)+' km';
$('satSpeed').textContent=best.speed?best.speed.toFixed(2)+' km/s':'—';
$('satPeriod').textContent=best.period?best.period.toFixed(1)+' min':'—';
$('satInclination').textContent=Number.isFinite(best.inclination)?best.inclination.toFixed(1)+'°':'—';
$('satMag').textContent=best.sunlit?(best.mag.toFixed(1)+' est.'):'shadow';
$('satLight').textContent=(best.sunlit?'Sunlit':'Earth shadow')+' • '+(best.visibility==='likely'?'likely visible':best.visibility==='possible'?'possibly visible':best.visibility==='dim'?'too faint':'not illuminated');
$('satRole').textContent=satelliteRole(best);
$('satService').textContent=serviceYear(best);
$('satEpochAge').textContent=epochAgeText(best);
$('satSheet').style.display='block'}
async function enableCompass(){if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted')throw new Error('Sensor permission denied')}state.compass=true;state.heading=correctedHeading();$('compassToggle').classList.add('on');updateOrientationPill();updateCompassInfo();populateCalibrationStars();if(state.fov<180)$('fovHint').textContent='Focused '+state.fov+'° zenith cone rotates with the phone compass.';}
window.addEventListener('deviceorientation',e=>{
  if(typeof e.webkitCompassHeading==='number'){
    state.rawHeading=norm(e.webkitCompassHeading);
    state.headingSource='webkit';
  }else if(e.alpha!=null){
    state.rawHeading=norm(360-e.alpha);
    state.headingSource='alpha';
  }
  if(typeof e.webkitCompassAccuracy==='number')state.compassAccuracy=e.webkitCompassAccuracy;
  state.heading=correctedHeading();
  if(state.compass){
    updateOrientationPill();
    updateCompassInfo();
  }
});
canvas.addEventListener('pointerdown',e=>{state.drag=true;state.startX=state.lastX=e.clientX;state.startY=state.lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{
  if(!state.drag)return;
  const dx=e.clientX-state.lastX;
  state.lastX=e.clientX;state.lastY=e.clientY;
  if(state.fov>=180){
    if(!state.compass)state.rot+=dx*.35;
  }else if(!state.compass){
    const scale=state.fov/Math.min(canvas.clientWidth,canvas.clientHeight*.9);
    state.centerAz=norm(state.centerAz-dx*scale);
    updateOrientationPill();
  }
});canvas.addEventListener('pointerup',e=>{const moved=Math.hypot(e.clientX-state.startX,e.clientY-state.startY);state.drag=false;if(moved<7)satClick(e)});
$('timeline').addEventListener('input',e=>{state.offset=+e.target.value;$('liveButton').classList.toggle('active',state.offset===0);$('timeLabel').textContent=state.offset===0?'Now':(state.offset>0?'+'+state.offset+' min':state.offset+' min');$('localTimeLabel').textContent=viewTime().toLocaleString([],{weekday:'short',hour:'2-digit',minute:'2-digit'});requestPositions(true)});
$('liveButton').onclick=()=>{$('timeline').value=0;state.offset=0;$('liveButton').classList.add('active');$('timeLabel').textContent='Now';$('localTimeLabel').textContent='Live sky';requestPositions(true)};
function setFov(v){
  state.fov=+v;
  state.centerEl=90;
  if(state.compass)state.centerAz=norm(state.heading);
  document.querySelectorAll('.fov-chip').forEach(b=>b.classList.toggle('on',+b.dataset.fov===state.fov));
  updateOrientationPill();
  if(state.fov>=180){
    $('fovHint').textContent='All-sky zenith view. Compass alignment rotates the map to match the phone heading.';
  }else if(state.compass){
    $('fovHint').textContent=state.fov+'° cone centred directly overhead. Turn the phone and the map rotates like a compass.';
  }else{
    $('fovHint').textContent=state.fov+'° cone centred directly overhead. Enable compass alignment for live heading rotation.';
  }
}
document.querySelectorAll('.fov-chip').forEach(b=>b.onclick=()=>setFov(+b.dataset.fov));
document.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{const l=b.dataset.layer;state.layers[l]=!state.layers[l];b.classList.toggle('on',state.layers[l]);requestPositions(true);requestPasses(true)});
$('find').onclick=findPlace;$('place').addEventListener('keydown',e=>{if(e.key==='Enter')findPlace()});$('geo').onclick=geolocate;$('closeSheet').onclick=()=>{$('satSheet').style.display='none'};$('centerSelected').onclick=()=>{if(!state.selected)return;state.centerAz=state.selected.az;state.centerEl=90;if(state.fov>=180)setFov(30);else updateOrientationPill();$('satSheet').style.display='none'};
$('compassToggle').onclick=async()=>{if(state.compass){state.compass=false;$('compassToggle').classList.remove('on');updateOrientationPill();updateCompassInfo();if(state.fov<180)$('fovHint').textContent='Focused '+state.fov+'° zenith cone. Enable compass alignment to match the phone heading.';}else try{await enableCompass()}catch(e){status('Compass unavailable',e.message,'warn')}};
function toggle(id,key){$(id).onclick=()=>{state[key]=!state[key];$(id).classList.toggle('on',state[key])}}toggle('constToggle','constellations');toggle('milkyToggle','milky');toggle('labelsToggle','labels');toggle('brightnessToggle','brightness');toggle('stationAlert','stationAlert');toggle('trainAlert','trainAlert');
$('notifyButton').onclick=async()=>{
  state.alertsArmed=true;
  $('notifyButton').textContent='Alerts armed ✓';
  if(!('Notification'in window)){
    $('alertStatus').textContent='In-app alerts are armed. This Safari view does not expose iOS system notifications; alerts will appear inside StarWatcher while it is open.';
    fireAlert('StarWatcher alerts armed','In-app alerts will appear here while StarWatcher is open.');
    return;
  }
  try{
    const p=await Notification.requestPermission();
    if(p==='granted'){
      $('alertStatus').textContent='In-app alerts and iOS notifications are enabled.';
      fireAlert('StarWatcher alerts armed','ISS/station and Starlink train alerts are active.');
    }else{
      $('alertStatus').textContent='In-app alerts are armed. iOS system notification permission was not granted.';
      fireAlert('In-app alerts armed','StarWatcher will alert you while this page is open.');
    }
  }catch(e){
    $('alertStatus').textContent='In-app alerts are armed. System notifications are unavailable in this browser mode.';
    fireAlert('In-app alerts armed','StarWatcher will alert you while this page is open.');
  }
};
$('dismissAlert').onclick=()=>{$('alertBanner').classList.remove('show')};
$('calibrateStar').onclick=calibrateCompassToStar;$('resetCompassCorrection').onclick=resetCompassCorrection;
$('refreshData').onclick=()=>loadCatalogue(true);
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.nav button').forEach(n=>n.classList.remove('active'));$(b.dataset.page+'Page').classList.add('active');b.classList.add('active')});
try{const l=JSON.parse(safeGet('sw3_loc'));if(l)setLocation(l.lat,l.lon,l.name)}catch(e){}


async function rezeroView(){
  try{if(!state.compass)await enableCompass()}catch(e){}
  state.centerEl=90;
  state.centerAz=state.compass?state.heading:0;
  state.rot=0;
  updateOrientationPill();
  updateCompassInfo();
  if(state.fov<180){
    $('fovHint').textContent=state.compass
      ? 'Zenith re-zeroed. Turn the phone: the compass ring and sky rotate together.'
      : 'Zenith re-zeroed. Enable compass alignment to rotate the map with the phone.';
  }
  const b=$('rezeroSky');
  if(b){const old=b.textContent;b.textContent='✓';setTimeout(()=>b.textContent=old,700)}
}

let skyFullscreen=false;
const rezeroButton=$('rezeroSky');
if(rezeroButton)rezeroButton.onclick=rezeroView;
const fullscreenButton=$('fullscreenSky');
if(fullscreenButton){
  fullscreenButton.onclick=async()=>{
    skyFullscreen=!skyFullscreen;
    const card=document.querySelector('.sky-card');
    card.classList.toggle('sky-fullscreen',skyFullscreen);
    fullscreenButton.textContent=skyFullscreen?'×':'⛶';
    document.body.style.overflow=skyFullscreen?'hidden':'';
    setTimeout(resize,60);
    if(skyFullscreen && document.documentElement.requestFullscreen){
      try{await document.documentElement.requestFullscreen()}catch(e){}
    }else if(!skyFullscreen && document.fullscreenElement && document.exitFullscreen){
      try{await document.exitFullscreen()}catch(e){}
    }
  };
}
document.addEventListener('fullscreenchange',()=>{
  if(!document.fullscreenElement && skyFullscreen){
    skyFullscreen=false;
    document.querySelector('.sky-card').classList.remove('sky-fullscreen');
    if(fullscreenButton)fullscreenButton.textContent='⛶';
    document.body.style.overflow='';
    setTimeout(resize,60);
  }
});

window.addEventListener('resize',resize);resize();populateCalibrationStars();setInterval(populateCalibrationStars,60000);requestAnimationFrame(draw);loadCatalogue();

// v4.5.1 recovery: StarWatcher intentionally runs without a service worker.
// Remove older cached workers so GitHub Pages always serves the current files.
if('serviceWorker' in navigator){
  navigator.serviceWorker.getRegistrations()
    .then(regs=>Promise.all(regs.map(r=>r.unregister())))
    .catch(()=>{});
}
if('caches' in window){
  caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k.startsWith('starwatcher-')).map(k=>caches.delete(k))
  )).catch(()=>{});
}
