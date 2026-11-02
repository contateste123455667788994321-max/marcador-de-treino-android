import { db } from 'hatchable';
export const access = 'user';
export const methods = ['GET','POST','DELETE'];
const MAX_POINTS = 8000;
const asNum = (v, fallback=0) => Number.isFinite(Number(v)) ? Number(v) : fallback;
const reasonable = (n,min,max)=>Number.isFinite(n)&&n>=min&&n<=max;
function validateRun(data){
 if (!data||typeof data!=='object') return null;
 const started=asNum(data.startWall,-1), ended=asNum(data.endedAt,-1);
 const duration=asNum(data.durationMs,-1), distance=asNum(data.distanceMeters,-1);
 const weight=asNum(data.weight,70), pace=asNum(data.paceSecKm,0);
 const route=Array.isArray(data.route)?data.route:[];
 if(!reasonable(started,1e12,5e12)||!reasonable(ended,started,5e12)
 ||!reasonable(duration,0,604800000)||!reasonable(distance,0,1000000)
 ||!reasonable(weight,30,300)||!reasonable(pace,0,30000)
 ||route.length>MAX_POINTS)return null;
 const cleaned=[];
 for (const p of route){
   if(!Array.isArray(p)||p.length<2||p.length>4)return null;
   const lat=Number(p[0]),lon=Number(p[1]);
   const at=p.length>=3?Number(p[2]):0;
   const acc=p.length>=4?Number(p[3]):0;
   if(!reasonable(lat,-90,90)||!reasonable(lon,-180,180)
    ||!reasonable(at,0,5e12)||!reasonable(acc,0,300))return null;
   cleaned.push([Math.round(lat*1e6)/1e6,Math.round(lon*1e6)/1e6,at,acc]);
 }
 return {started:Math.trunc(started),ended:Math.trunc(ended),duration:Math.trunc(duration),
    distance:Math.round(distance*10)/10,calories:Math.round(Math.max(0,asNum(data.calories,0))),
    pace:Math.trunc(pace),weight,route:cleaned};
}
export default async function(req,res){
 const userId=String(req.user.id);
 if(req.method==='GET'){
   const start=Number(req.query?.startWall);
   if(Number.isSafeInteger(start)&&start>0){
     const {rows}=await db.query(
      'SELECT started_at_ms AS "startWall", ended_at_ms AS "endedAt", duration_ms AS "durationMs", distance_meters AS "distanceMeters", calories_est AS "calories", pace_sec_km AS "paceSecKm", weight_kg AS "weight", route FROM run_sessions WHERE user_id=$1 AND started_at_ms=$2 LIMIT 1',[userId,start]);
     return rows.length?res.json({run:rows[0]}):res.status(404).json({error:'Corrida não encontrada'});
   }
   const {rows}=await db.query(
     'SELECT started_at_ms AS "startWall", ended_at_ms AS "endedAt", duration_ms AS "durationMs", distance_meters AS "distanceMeters", calories_est AS "calories", pace_sec_km AS "paceSecKm", point_count AS "points" FROM run_sessions WHERE user_id=$1 ORDER BY started_at_ms DESC LIMIT 200',[userId]);
   return res.json({runs:rows});
 }
 if(req.method==='DELETE'){
   const start=Number(req.query?.startWall);
   if(!Number.isSafeInteger(start)||start<=0)return res.status(400).json({error:'Corrida inválida'});
   await db.query('DELETE FROM run_sessions WHERE user_id=$1 AND started_at_ms=$2',[userId,start]);
   return res.json({ok:true});
 }
 const run=validateRun(req.body);
 if(!run)return res.status(400).json({error:'Dados da corrida inválidos ou grandes demais'});
 const {rows}=await db.query(
  `INSERT INTO run_sessions(user_id,started_at_ms,ended_at_ms,duration_ms,distance_meters,calories_est,pace_sec_km,weight_kg,route,point_count)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)
   ON CONFLICT(user_id,started_at_ms) DO UPDATE SET
   ended_at_ms=excluded.ended_at_ms,duration_ms=excluded.duration_ms,
   distance_meters=excluded.distance_meters,calories_est=excluded.calories_est,
   pace_sec_km=excluded.pace_sec_km,weight_kg=excluded.weight_kg,
   route=excluded.route,point_count=excluded.point_count,updated_at=now()
   RETURNING id`,
  [userId,run.started,run.ended,run.duration,run.distance,run.calories,run.pace,run.weight,JSON.stringify(run.route),run.route.length]);
 return res.status(201).json({ok:true,id:rows[0]?.id});
}