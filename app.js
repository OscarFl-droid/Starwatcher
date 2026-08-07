const $=id=>document.getElementById(id),R=Math.PI/180,D=180/Math.PI,norm=x=>(x%360+360)%360;
const state={lat:48.7219,lon:1.3696,name:'Vernouillet, France',offset:0,layers:{starlink:true,oneweb:true,station:true,science:true},target:[],display:new Map(),points:[],rot:0,drag:false,startX:0,startY:0,lastX:0,lastY:0,compass:false,heading:0,constellations:true,milky:true,labels:true,brightness:true,selected:null,workerReady:false,requestId:0,lastWorker:0,lastPasses:0,notified:new Set(),stationAlert:true,trainAlert:true,alertsArmed:true,latestPasses:[],catalogueMeta:null,fov:180,centerAz:180,centerEl:55,transitionStart:0,transitionDuration:1000};
const canvas=$('sky'),ctx=canvas.getContext('2d'),worker=new Worker('./orbit-worker.js?v=45');
const stars={
 Polaris:[37.95,89.26,1.98],Dubhe:[165.93,61.75,1.79],Merak:[165.46,56.38,2.37],Phecda:[178.46,53.69,2.44],Megrez:[183.86,57.03,3.31],Alioth:[193.51,55.96,1.76],Mizar:[200.98,54.93,2.23],Alkaid:[206.89,49.31,1.85],
 Caph:[2.29,59.15,2.28],Schedar:[10.13,56.54,2.24],Navi:[14.18,60.72,2.15],Ruchbah:[21.45,60.24,2.68],Segin:[28.60,63.67,3.35],
 Betelgeuse:[88.79,7.41,.42],Bellatrix:[81.28,6.35,1.64],Alnilam:[84.05,-1.20,1.69],Alnitak:[85.19,-1.94,1.74],Mintaka:[83.00,-.30,2.25],Saiph:[86.94,-9.67,2.07],Rigel:[78.63,-8.20,.13],
 Vega:[279.23,38.78,.03],Sheliak:[282.52,33.36,3.45],Sulafat:[284.74,32.69,3.25],
 Deneb:[310.36,45.28,1.25],Sadr:[305.56,40.26,2.23],Gienah:[292.68,33.97,2.46],Albireo:[292.68,27.96,3.05],
 Altair:[297.70,8.87,.77],Tarazed:[296.56,10.61,2.72],Alshain:[298.83,6.41,3.71],
 Regulus:[152.09,11.97,1.35],Denebola:[177.26,14.57,2.14],Algieba:[154.99,19.84,2.08],Zosma:[168.53,20.52,2.56],
 Aldebaran:[68.98,16.51,.85],Elnath:[81.57,28.61,1.65],
 Capella:[79.17,46.00,.08],Pollux:[116.33,28.03,1.14],Castor:[113.65,31.89,1.58],Procyon:[114.83,5.23,.34],Sirius:[101.29,-16.72,-1.46],
 Arcturus:[213.92,19.18,-.05],Spica:[201.30,-11.16,.98],Antares:[247.35,-26.43,.96]
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
function altaz(ra,dec,date){const H=norm(gmst(date)+state.lon-ra)*R,ph=state.lat*R,de=dec*R,el=Math.asin(Math.sin(ph)*Math.sin(de)+Math.cos(ph)*Math.cos(de)*Math.cos(H)),az=Math.atan2(-Math.sin(H)*Math.cos(de),Math.sin(de)*Math.cos(ph)-Math.cos(de)*Math.sin(ph)*Math.cos(H));return{az:norm(az*D),el:el*D}}
function galToEq(l,b=0){const lr=l*R,br=b*R;const x=Math.cos(br)*Math.cos(lr),y=Math.cos(br)*Math.sin(lr),z=Math.sin(br);const ex=-.0548755604*x+.4941094279*y-.8676661490*z,ey=-.8734370902*x-.4448296300*y-.1980763734*z,ez=-.4838350155*x+.7469822445*y+.4559837762*z;return{ra:norm(Math.atan2(ey,ex)*D),dec:Math.asin(ez)*D}}
function viewTime(){return new Date(Date.now()+state.offset*60000)}
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
function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0)}
function drawMilky(date,w,h){if(!state.milky)return;const tracks=[-8,0,8];for(const b of tracks){ctx.beginPath();let started=false;for(let l=0;l<=360;l+=3){const e=galToEq(l,b),q=altaz(e.ra,e.dec,date);if(q.el<0){started=false;continue}const p=project(q.az,q.el,w,h);if(!p.visible){started=false;continue}if(!started){ctx.moveTo(p.x,p.y);started=true}else ctx.lineTo(p.x,p.y)}ctx.strokeStyle=b===0?'rgba(124,151,220,.13)':'rgba(124,151,220,.055)';ctx.lineWidth=b===0?20:12;ctx.stroke()}}
function drawStars(date,w,h){const pos={};for(const [name,s] of Object.entries(stars)){const q=altaz(s[0],s[1],date);if(q.el<0)continue;const pp=project(q.az,q.el,w,h);if(pp.visible)pos[name]=pp}if(state.constellations){ctx.lineWidth=.8;ctx.strokeStyle='rgba(126,151,205,.28)';for(const item of lines){const seqs=Array.isArray(item[1][0])?item.slice(1):[item[1]];for(const seq of seqs){ctx.beginPath();let begun=false;for(const n of seq){if(!pos[n]){begun=false;continue}if(!begun){ctx.moveTo(pos[n].x,pos[n].y);begun=true}else ctx.lineTo(pos[n].x,pos[n].y)}ctx.stroke()}}}
 for(const [name,s] of Object.entries(stars)){const p=pos[name];if(!p)continue;const size=Math.max(1.25,3.6-s[2]);ctx.beginPath();ctx.fillStyle=s[2]<.5?'#ffd977':'#edf2ff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=s[2]<1?6:2;ctx.arc(p.x,p.y,size,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(s[2]<2.6){ctx.fillStyle='#aeb9d5';ctx.font='9px -apple-system';ctx.fillText(name,p.x+5,p.y-4)}}}
function interpAngle(a,b,k){let d=((b-a+540)%360)-180;return norm(a+d*k)}
function updateDisplay(){const k=Math.max(0,Math.min(1,(performance.now()-state.transitionStart)/state.transitionDuration));const seen=new Set();for(const s of state.target){const id=String(s.id);seen.add(id);let d=state.display.get(id);if(!d){d={...s,fromAz:s.az,fromEl:s.el,toAz:s.az,toEl:s.el};state.display.set(id,d)}d.az=interpAngle(d.fromAz??d.az,d.toAz??d.az,k);d.el=(d.fromEl??d.el)+((d.toEl??d.el)-(d.fromEl??d.el))*k;d.alt=s.alt;d.range=s.range;d.sunlit=s.sunlit;d.mag=s.mag;d.layer=s.layer;d.name=s.name;d.phase=s.phase}for(const[id,d]of state.display){if(!seen.has(id)&&d.el<-2)state.display.delete(id)}}
function beginTransition(next){const cur=new Map();for(const[id,d]of state.display)cur.set(id,{az:d.az,el:d.el});state.target=next;for(const s of next){const id=String(s.id);let d=state.display.get(id);if(!d){d={...s,fromAz:s.az,fromEl:s.el,toAz:s.az,toEl:s.el};state.display.set(id,d)}else{const c=cur.get(id)||{az:d.az,el:d.el};d.fromAz=c.az;d.fromEl=c.el;d.toAz=s.az;d.toEl=s.el}}state.transitionStart=performance.now();state.transitionDuration=1000}
function satColor(layer,sunlit){if(layer==='station')return'#ffd56e';if(layer==='science')return'#ffa76b';if(layer==='oneweb')return sunlit?'#c69cff':'#6f6788';return sunlit?'#62e3ff':'#647494'}
function drawSatellites(w,h){updateDisplay();state.points=[];let arr=[...state.display.values()].filter(s=>s.el>=0&&state.layers[s.layer]);arr.sort((a,b)=>a.mag-b.mag);for(const s of arr){const p=project(s.az,s.el,w,h);if(!p.visible)continue;const c=satColor(s.layer,s.sunlit),size=s.layer==='station'?5:s.mag<3?4:2.7;ctx.beginPath();ctx.fillStyle=c;ctx.shadowColor=c;ctx.shadowBlur=s.sunlit?9:2;ctx.arc(p.x,p.y,size,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;if(state.labels&&(s.layer==='station'||s.layer==='science'||s.mag<3.5)){ctx.fillStyle='#d9e1f5';ctx.font='9px -apple-system';ctx.fillText(s.name.replace('STARLINK-','SL-'),p.x+6,p.y-4)}if(state.selected&&String(state.selected.id)===String(s.id)){ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,size+7,0,Math.PI*2);ctx.stroke();}state.points.push({...s,x:p.x,y:p.y})}
 $('above').textContent=arr.length;$('sunlit').textContent=arr.filter(x=>x.sunlit).length;$('bright').textContent=arr.filter(x=>x.sunlit&&x.mag<=4).length;
 const count=l=>arr.filter(x=>x.layer===l).length;$('countStarlink').textContent=count('starlink');$('countOneweb').textContent=count('oneweb');$('countStation').textContent=count('station');$('countScience').textContent=count('science')}
function draw(){requestAnimationFrame(draw);const r=canvas.getBoundingClientRect(),w=r.width,h=r.height,date=viewTime();ctx.clearRect(0,0,w,h);const g=ctx.createRadialGradient(w/2,h*.52,20,w/2,h*.52,Math.max(w,h)*.65);g.addColorStop(0,'#152142');g.addColorStop(1,'#020510');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);drawMilky(date,w,h);ctx.lineWidth=1;ctx.strokeStyle='#33405e';ctx.fillStyle='#96a3c0';ctx.font='11px -apple-system';if(state.fov>=180){const p0=project(0,0,w,h),rad=p0.rad,cx=w/2,cy=h*.54;for(const el of[0,30,60]){ctx.beginPath();ctx.arc(cx,cy,(90-el)/90*rad,0,Math.PI*2);ctx.stroke()}for(let a=0;a<360;a+=45){const p=project(a,0,w,h);ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(p.x,p.y);ctx.stroke()}for(const[t,a]of[['N',0],['E',90],['S',180],['W',270]]){const p=project(a,-5,w,h);ctx.fillText(t,p.x-4,p.y+4)}}else{const cx=w/2,cy=h*.52,rad=Math.min(w,h*.9)/2;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-rad,cy);ctx.lineTo(cx+rad,cy);ctx.moveTo(cx,cy-rad);ctx.lineTo(cx,cy+rad);ctx.stroke();ctx.fillText(cardinal(state.centerAz)+' '+Math.round(state.centerAz)+'°',cx-25,cy-rad+16);ctx.fillText(Math.round(state.centerEl)+'° elev.',cx-22,cy+rad-10)}drawStars(date,w,h);drawSatellites(w,h);$('utc').textContent='UTC '+date.toISOString().slice(11,19)}
function requestPositions(force=false){if(!state.workerReady)return;const now=performance.now();if(!force&&now-state.lastWorker<950)return;state.lastWorker=now;worker.postMessage({type:'calc',requestId:++state.requestId,time:viewTime().getTime(),lat:state.lat,lon:state.lon,layers:state.layers})}
setInterval(()=>requestPositions(),1000);
worker.onmessage=e=>{const m=e.data;if(m.type==='ready'){state.workerReady=true;status('Live orbital engine ready',m.count.toLocaleString()+' objects loaded','good');requestPositions(true);requestPasses(true)}if(m.type==='positions'){beginTransition(m.positions);checkAlerts(m.positions)}if(m.type==='passes'){renderPasses(m.passes)}};
async function loadCatalogue(force=false){status('Loading orbital catalogue…','Starlink, OneWeb, stations and Hubble');try{let r=await fetch('./data/catalogue.json?'+(force?Date.now():'v=4'),{cache:force?'no-store':'default'});if(!r.ok)throw new Error('HTTP '+r.status);const p=await r.json();if(!p.objects||p.objects.length<100)throw new Error('Catalogue has not been populated yet');state.catalogueMeta=p.meta||{};worker.postMessage({type:'catalogue',objects:p.objects});const dt=p.meta&&p.meta.fetched_at?new Date(p.meta.fetched_at):null;if(dt){const age=(Date.now()-dt)/3600000;$('catalogueAge').textContent=age<1?Math.round(age*60)+' min old':age.toFixed(1)+' h old'}$('catalogueInfo').textContent=(p.meta.count||p.objects.length).toLocaleString()+' orbital records • '+(dt?'updated '+dt.toLocaleString():'update time unknown')}catch(e){status('Orbital catalogue unavailable',e.message+'. Run the GitHub “Update orbital catalogue” workflow once.','warn')}}
function requestPasses(force=false){if(!state.workerReady)return;if(!force&&Date.now()-state.lastPasses<60000)return;state.lastPasses=Date.now();worker.postMessage({type:'passes',time:Date.now(),lat:state.lat,lon:state.lon,layers:state.layers,minutes:360,step:2,minEl:20,maxMag:5})}
function cardinal(a){return['N','NE','E','SE','S','SW','W','NW'][Math.round(norm(a)/45)%8]}
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
      const bucket=Math.floor((Date.now()+p.start*60000)/600000);
      const key='station-upcoming-'+p.id+'-'+bucket;
      if(!state.notified.has(key)){
        state.notified.add(key);
        fireAlert(p.name+' pass in '+Math.max(1,Math.round(p.start))+' min',
          'Look '+cardinal(p.startAz)+' → '+cardinal(p.endAz)+' • peak '+Math.round(p.max)+'° • estimated mag '+p.minMag.toFixed(1));
      }
    }
  }
}
function checkAlerts(arr){if(state.offset!==0)return;const now=Date.now();if(state.stationAlert){for(const s of arr.filter(x=>x.layer==='station'&&x.sunlit&&x.el>10&&x.mag<2)){const key='station-'+s.id+'-'+new Date().toDateString();if(!state.notified.has(key)){state.notified.add(key);fireAlert(s.name+' is visible now',Math.round(s.el)+'° high toward '+cardinal(s.az)+' • estimated mag '+s.mag.toFixed(1))}}}
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
  requestPasses(true);
  $('alertStatus').textContent='Location updated to '+name+'. Pass alerts and predictions have been recalculated.';
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
function satClick(e){const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=250;for(const p of state.points){const d=(p.x-x)**2+(p.y-y)**2;if(d<bd){best=p;bd=d}}if(!best)return;state.selected=best;$('satName').textContent=best.name;$('satEl').textContent=best.el.toFixed(1)+'°';$('satAz').textContent=best.az.toFixed(1)+'° '+cardinal(best.az);$('satAlt').textContent=Math.round(best.alt)+' km';
$('satRange').textContent=Math.round(best.range)+' km';
$('satSpeed').textContent=best.speed?best.speed.toFixed(2)+' km/s':'—';
$('satPeriod').textContent=best.period?best.period.toFixed(1)+' min':'—';
$('satInclination').textContent=Number.isFinite(best.inclination)?best.inclination.toFixed(1)+'°':'—';
$('satMag').textContent=best.sunlit?(best.mag.toFixed(1)+' est.'):'shadow';
$('satLight').textContent=best.sunlit?'Sunlit':'Earth shadow';
$('satRole').textContent=satelliteRole(best);
$('satService').textContent=serviceYear(best);
$('satEpochAge').textContent=epochAgeText(best);
$('satSheet').style.display='block'}
async function enableCompass(){if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){const p=await DeviceOrientationEvent.requestPermission();if(p!=='granted')throw new Error('Sensor permission denied')}state.compass=true;$('compassToggle').classList.add('on');updateOrientationPill();if(state.fov<180)$('fovHint').textContent='Focused '+state.fov+'° zenith cone rotates with the phone compass.';}
window.addEventListener('deviceorientation',e=>{
  const h=typeof e.webkitCompassHeading==='number'
    ? e.webkitCompassHeading
    : (e.alpha==null?state.heading:360-e.alpha);
  state.heading=norm(h);
  if(state.compass)updateOrientationPill();
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
$('compassToggle').onclick=async()=>{if(state.compass){state.compass=false;$('compassToggle').classList.remove('on');updateOrientationPill();if(state.fov<180)$('fovHint').textContent='Focused '+state.fov+'° zenith cone. Enable compass alignment to match the phone heading.';}else try{await enableCompass()}catch(e){status('Compass unavailable',e.message,'warn')}};
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
$('refreshData').onclick=()=>loadCatalogue(true);
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.nav button').forEach(n=>n.classList.remove('active'));$(b.dataset.page+'Page').classList.add('active');b.classList.add('active')});
try{const l=JSON.parse(safeGet('sw3_loc'));if(l)setLocation(l.lat,l.lon,l.name)}catch(e){}


function rezeroView(){
  state.centerEl=90;
  state.centerAz=state.compass?norm(state.heading):0;
  state.rot=0;
  updateOrientationPill();
  if(state.fov<180){
    $('fovHint').textContent=state.compass
      ? 'Re-zeroed to the zenith. The map rotates with the phone compass.'
      : 'Re-zeroed to the zenith. Enable compass alignment to rotate the map with the phone.';
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

window.addEventListener('resize',resize);resize();requestAnimationFrame(draw);loadCatalogue();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js?v=45').catch(()=>{}));
