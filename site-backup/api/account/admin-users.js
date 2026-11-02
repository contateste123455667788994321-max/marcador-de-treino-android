import { db } from 'hatchable';
export const access='user';
export const methods=['GET','POST'];
async function ensureOwner(req,res){
 const {rows}=await db.query('SELECT app_user_id FROM app_owner_link WHERE slot=1');
 if(!rows.length||String(rows[0].app_user_id)!==String(req.user.id)){
  res.status(403).json({error:'Acesso reservado ao proprietário.'});
  return false;
 }
 return true;
}
export default async function(req,res){
 if(!(await ensureOwner(req,res)))return;
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){
  const query=typeof req.query?.q==='string'?req.query.q.trim().slice(0,120):'';
  const online=req.query?.online==='1';
  const params=query?['%'+query+'%']:[];
  let where=query?'WHERE (u.email ILIKE $1 OR u.name ILIKE $1)':'';
  if(online)where+=(where?' AND ':'WHERE ')+"p.last_seen>now()-interval '3 minutes'";
  const {rows}=await db.query(
   `SELECT u.id,u.email,u.name,COALESCE(m.banned,false) AS banned,m.reason,p.last_seen AS "lastSeen",
   (p.last_seen>now()-interval '3 minutes') AS "online"
   FROM users u LEFT JOIN app_moderation m ON m.user_id=u.id
   LEFT JOIN LATERAL (SELECT MAX(last_seen) AS last_seen FROM app_presence WHERE user_id=u.id) p ON TRUE
   ${where} ORDER BY p.last_seen DESC NULLS LAST,u.created_at DESC LIMIT 150`,params);
  return res.json({users:rows,onlineOnly:online});
 }
 const userId=typeof req.body?.userId==='string'?req.body.userId:'';
 if(!userId||userId.length>120)return res.status(400).json({error:'Conta inválida.'});
 if(userId===String(req.user.id))return res.status(403).json({error:'Não é possível bloquear a própria conta de dono.'});
 const {rows:target}=await db.query('SELECT id FROM users WHERE id=$1',[userId]);
 if(!target.length)return res.status(404).json({error:'Usuário não encontrado.'});
 const action=req.body?.action;
 if(!['ban','unban'].includes(action))return res.status(400).json({error:'Ação inválida.'});
 const reason=typeof req.body?.reason==='string'?req.body.reason.trim().slice(0,200):'';
 const {rows}=await db.query(
  'INSERT INTO app_moderation(user_id,banned,reason) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET banned=EXCLUDED.banned,reason=EXCLUDED.reason,updated_at=now() RETURNING banned',
  [userId,action==='ban',reason]);
 return res.json({ok:true,banned:rows[0].banned});
}