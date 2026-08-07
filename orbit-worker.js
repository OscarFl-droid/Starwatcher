importScripts("https://cdnjs.cloudflare.com/ajax/libs/satellite.js/6.0.1/satellite.min.js");
const R=Math.PI/180,D=180/Math.PI,norm=x=>(x%360+360)%360;
let records=[];
function sunVector(date){const jd=date/86400000+2440587.5,n=jd-2451545,L=norm(280.460+.9856474*n)*R,g=norm(357.528+.9856003*n)*R,lam=L+(1.915*Math.sin(g)+.020*Math.sin(2*g))*R,eps=(23.439-.0000004*n)*R,AU=149597870.7;return{x:AU*Math.cos(lam),y:AU*Math.cos(eps)*Math.sin(lam),z:AU*Math.sin(eps)*Math.sin(lam)}}
function lighting(p,date){const s=sunVector(date),sl=Math.hypot(s.x,s.y,s.z),su={x:s.x/sl,y:s.y/sl,z:s.z/sl},pl=Math.hypot(p.x,p.y,p.z),pu={x:p.x/pl,y:p.y/pl,z:p.z/pl};const phase=Math.acos(Math.max(-1,Math.min(1,-(pu.x*su.x+pu.y*su.y+pu.z*su.z))));const along=p.x*su.x+p.y*su.y+p.z*su.z;let sunlit=true;if(along<0){const x=p.x-along*su.x,y=p.y-along*su.y,z=p.z-along*su.z;sunlit=Math.hypot(x,y,z)>6378.137}return{sunlit,phase}}
function magEstimate(layer,range,phase,sunlit){if(!sunlit)return 99;const base={station:-1.3,science:1.8,starlink:4.5,oneweb:5.5}[layer]??5.5;const phi=Math.max(.025,(Math.sin(phase)+(Math.PI-phase)*Math.cos(phase))/Math.PI);return base+5*Math.log10(Math.max(range,100)/1000)-2.5*Math.log10(phi)}
function calc(t,lat,lon,layers){const date=new Date(t),gmst=satellite.gstime(date),obs={longitude:lon*R,latitude:lat*R,height:.05},out=[];for(const r of records){if(!layers[r.layer])continue;try{const pv=satellite.propagate(r.satrec,date);if(!pv.position)continue;const ecf=satellite.eciToEcf(pv.position,gmst),look=satellite.ecfToLookAngles(obs,ecf),el=look.elevation*D;if(el<0)continue;const gd=satellite.eciToGeodetic(pv.position,gmst),li=lighting(pv.position,date),mag=magEstimate(r.layer,look.rangeSat,li.phase,li.sunlit);const speed=pv.velocity?Math.hypot(pv.velocity.x,pv.velocity.y,pv.velocity.z):null;
      const period=r.meanMotion>0?1440/r.meanMotion:null;
      out.push({
        id:r.id,name:r.name,layer:r.layer,az:norm(look.azimuth*D),el,alt:gd.height,range:look.rangeSat,
        sunlit:li.sunlit,phase:li.phase*D,mag,speed,period,inclination:r.inclination,
        objectId:r.objectId,epoch:r.epoch
      })}catch(e){}}return out}
self.onmessage=e=>{const m=e.data;if(m.type==='catalogue'){records=[];for(const o of m.objects||[]){try{const sr=satellite.json2satrec(o);if(sr&&!sr.error)records.push({
  satrec:sr,
  id:o.NORAD_CAT_ID,
  name:o.OBJECT_NAME||String(o.NORAD_CAT_ID),
  layer:o._layer||'starlink',
  objectId:o.OBJECT_ID||'',
  epoch:o.EPOCH||'',
  inclination:Number(o.INCLINATION ?? (sr.inclo*D)),
  meanMotion:Number(o.MEAN_MOTION||0)
})}catch(e){}}self.postMessage({type:'ready',count:records.length});return}if(m.type==='calc'){self.postMessage({type:'positions',requestId:m.requestId,time:m.time,positions:calc(m.time,m.lat,m.lon,m.layers)})}if(m.type==='passes'){const now=m.time,passes=[],active=new Map();for(let min=0;min<=m.minutes;min+=m.step){const arr=calc(now+min*60000,m.lat,m.lon,m.layers).filter(s=>s.el>=m.minEl&&s.sunlit&&s.mag<=m.maxMag),ids=new Set(arr.map(x=>String(x.id)));for(const s of arr){const k=String(s.id);let a=active.get(k);if(!a){a={...s,start:min,startAz:s.az,last:min,max:s.el,minMag:s.mag};active.set(k,a)}if(s.el>a.max)a.max=s.el;if(s.mag<a.minMag)a.minMag=s.mag;a.last=min;a.endAz=s.az}for(const [k,a] of [...active])if(!ids.has(k)&&min-a.last>=m.step){passes.push(a);active.delete(k)}}passes.push(...active.values());passes.sort((a,b)=>a.start-b.start||a.minMag-b.minMag);self.postMessage({type:'passes',passes:passes.slice(0,30),time:now})}}
