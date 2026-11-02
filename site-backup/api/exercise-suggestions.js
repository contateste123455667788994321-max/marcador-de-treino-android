import { db } from 'hatchable';
export const access='user';
export const methods=['POST'];
export default async function(req,res){
 const ownerId=String(req.user.id);
 const {rows:block}=await db.query('SELECT banned FROM app_moderation WHERE user_id=$1',[ownerId]);
 if(block[0]?.banned)return res.status(403).json({error:'Esta conta está temporariamente impedida de enviar sugestões.'});
 const body=req.body||{};
 const exerciseName=typeof body.exerciseName==='string'?body.exerciseName.trim().replace(/\s+/g,' '):'';
 const comment=typeof body.comment==='string'?body.comment.trim().replace(/\s+/g,' '):'';
 if(typeof body.website==='string'&&body.website)return res.status(202).json({ok:true});
 if(exerciseName.length<3||exerciseName.length>100||comment.length>500)
  return res.status(400).json({error:'Nome do exercício: 3–100 caracteres. Comentário: até 500.'});
 const {rows:recent}=await db.query(
  "SELECT COUNT(*)::int AS amount FROM exercise_suggestions WHERE user_id=$1 AND created_at>now()-interval '1 hour'",
  [ownerId]);
 if(Number(recent[0]?.amount)>=6)return res.status(429).json({error:'Limite de 6 sugestões por hora nesta conta.'});
 const {rows:duplicates}=await db.query(
  "SELECT COUNT(*)::int AS amount FROM exercise_suggestions WHERE lower(exercise_name)=lower($1) AND created_at > now()-interval '12 hours'",
  [exerciseName]);
 if(Number(duplicates[0]?.amount)>4)return res.status(429).json({error:'Este exercício já foi sugerido recentemente.'});
 const {rows}=await db.query(
  'INSERT INTO exercise_suggestions(exercise_name,comment,user_id) VALUES($1,$2,$3) RETURNING id',
  [exerciseName,comment,ownerId]);
 return res.status(201).json({ok:true,id:rows[0].id});
}