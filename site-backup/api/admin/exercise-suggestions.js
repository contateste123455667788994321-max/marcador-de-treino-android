import { db } from 'hatchable';
export const access='admin';
export const methods=['GET','POST'];
export default async function(req,res){
 if(req.member?.role!=='owner'&&req.member?.handle!=='brunoaltamirodasilvadejesus')
  return res.status(403).json({error:'Somente o proprietário pode consultar as sugestões.'});
 if(req.method==='GET'){
  const {rows}=await db.query(
   'SELECT s.id,s.exercise_name AS "exerciseName",s.comment,s.status,s.created_at AS "createdAt",u.email AS "userEmail" FROM exercise_suggestions s LEFT JOIN users u ON u.id=s.user_id ORDER BY CASE WHEN s.status=$1 THEN 0 ELSE 1 END,s.created_at DESC LIMIT 300',['pending']);
  return res.json({suggestions:rows});
 }
 const data=req.body||{};
 if(data.operation==='delete'){
  const id=Number(data.id);
  if(!Number.isSafeInteger(id)||id<1)return res.status(400).json({error:'Sugestão inválida.'});
  const {rows}=await db.query('DELETE FROM exercise_suggestions WHERE id=$1 RETURNING id',[id]);
  return rows.length?res.json({ok:true}):res.status(404).json({error:'Sugestão não encontrada.'});
 }
 if(data.operation==='clear'){
  const {rows}=await db.query('DELETE FROM exercise_suggestions RETURNING id');
  return res.json({ok:true,deleted:rows.length});
 }
 const id=Number(data.id),status=data.status;
 if(!Number.isSafeInteger(id)||id<1||!['pending','reviewed','added'].includes(status))
  return res.status(400).json({error:'Atualização inválida.'});
 const {rows}=await db.query('UPDATE exercise_suggestions SET status=$1,updated_at=now() WHERE id=$2 RETURNING id,status',[status,id]);
 return rows.length?res.json({ok:true,suggestion:rows[0]}):res.status(404).json({error:'Sugestão não encontrada.'});
}