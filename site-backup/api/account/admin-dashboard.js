import { db } from 'hatchable';
export const access='user';
export const methods=['GET','POST'];
export default async function(req,res){
 const {rows:ownerRows}=await db.query('SELECT app_user_id FROM app_owner_link WHERE slot=1 LIMIT 1');
 if(!ownerRows.length||String(ownerRows[0].app_user_id)!==String(req.user.id))
  return res.status(403).json({error:'Acesso restrito ao proprietário do aplicativo.'});
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){
  const [stats,week,suggestions,announcements]=await Promise.all([
   db.query(`SELECT
     (SELECT COUNT(*)::int FROM users) AS "registered",
     (SELECT COUNT(*)::int FROM app_presence WHERE last_seen > now()-interval '3 minutes') AS "online",
     (SELECT COUNT(*)::int FROM app_daily_devices WHERE day=(now() AT TIME ZONE 'America/Sao_Paulo')::date) AS "today",
     (SELECT COUNT(*)::int FROM app_presence) AS "ever",
     (SELECT COUNT(*)::int FROM run_sessions) AS "runs",
     (SELECT COUNT(*)::int FROM exercise_suggestions WHERE status='pending') AS "pending",
     (SELECT COUNT(*)::int FROM app_announcements WHERE active) AS "notices"`),
   db.query("SELECT day::text AS day,COUNT(*)::int AS devices FROM app_daily_devices WHERE day>=(now() AT TIME ZONE 'America/Sao_Paulo')::date-6 GROUP BY day ORDER BY day"),
   db.query('SELECT s.id,s.exercise_name AS "exerciseName",s.comment,s.status,s.created_at AS "createdAt",s.user_id AS "userId",u.email AS "userEmail" FROM exercise_suggestions s LEFT JOIN users u ON u.id=s.user_id ORDER BY CASE WHEN s.status=$1 THEN 0 ELSE 1 END,s.created_at DESC LIMIT 80',['pending']),
   db.query('SELECT id,title,body,active,created_at AS "createdAt" FROM app_announcements ORDER BY created_at DESC LIMIT 40')
  ]);
  return res.json({stats:stats.rows[0],week:week.rows,suggestions:suggestions.rows,announcements:announcements.rows});
 }
 const data=req.body||{};
 if(data.action==='publish'){
  const title=typeof data.title==='string'?data.title.trim():'';
  const message=typeof data.message==='string'?data.message.trim():'';
  if(title.length<3||title.length>100||message.length<3||message.length>1500)
   return res.status(400).json({error:'Título: 3–100 caracteres. Aviso: 3–1500.'});
  const {rows}=await db.query('INSERT INTO app_announcements(title,body) VALUES($1,$2) RETURNING id',[title,message]);
  return res.status(201).json({ok:true,id:rows[0].id});
 }
 if(data.action==='hide'||data.action==='show'){
  const id=Number(data.id);
  if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Aviso inválido.'});
  const {rows}=await db.query('UPDATE app_announcements SET active=$1,updated_at=now() WHERE id=$2 RETURNING id',[data.action==='show',id]);
  return rows.length?res.json({ok:true}):res.status(404).json({error:'Aviso inexistente.'});
 }
 if(data.action==='deleteSuggestion'||data.action==='clearSuggestions'){
  if(data.action==='clearSuggestions'){
   const {rows}=await db.query('DELETE FROM exercise_suggestions RETURNING id');
   return res.json({ok:true,deleted:rows.length});
  }
  const id=Number(data.id);
  if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Sugestão inválida.'});
  const {rows}=await db.query('DELETE FROM exercise_suggestions WHERE id=$1 RETURNING id',[id]);
  return rows.length?res.json({ok:true}):res.status(404).json({error:'Sugestão não encontrada.'});
 }
 if(data.action==='suggestion'){
  const id=Number(data.id);
  if(!Number.isSafeInteger(id)||id<1||!['pending','reviewed','added'].includes(data.status))
   return res.status(400).json({error:'Sugestão inválida.'});
  const {rows}=await db.query('UPDATE exercise_suggestions SET status=$1,updated_at=now() WHERE id=$2 RETURNING id',[data.status,id]);
  return rows.length?res.json({ok:true}):res.status(404).json({error:'Sugestão inexistente.'});
 }
 return res.status(400).json({error:'Operação inválida.'});
}