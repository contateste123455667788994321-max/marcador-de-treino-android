import { db } from 'hatchable';
export const access='admin';
export const methods=['GET','POST'];
export default async function(req,res){
 // The PLATFORM project owner is the only account permitted to assign the app owner.
 if(req.member?.role!=='owner'&&req.member?.handle!=='brunoaltamirodasilvadejesus')return res.status(403).json({error:'Apenas o proprietário original do projeto pode vincular a conta.'});
 if(req.method==='GET'){
  const {rows}=await db.query('SELECT u.email,b.linked_at AS "linkedAt" FROM app_owner_link b LEFT JOIN users u ON u.id=b.app_user_id WHERE b.slot=1');
  return res.json({linked:rows.length>0,email:rows[0]?.email||'',linkedAt:rows[0]?.linkedAt||null});
 }
 const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)
  return res.status(400).json({error:'Digite o e-mail usado no aplicativo.'});
 const {rows}=await db.query('SELECT id,email,email_verified_at FROM users WHERE lower(email)=$1 LIMIT 1',[email]);
 if(!rows.length||!rows[0].email_verified_at)
  return res.status(404).json({error:'Conta não encontrada ou e-mail ainda não verificado. Entre no aplicativo com o código enviado por e-mail antes de vincular.'});
 await db.query('INSERT INTO app_owner_link(slot,app_user_id) VALUES(1,$1) ON CONFLICT(slot) DO UPDATE SET app_user_id=excluded.app_user_id,linked_at=now()',[String(rows[0].id)]);
 return res.json({ok:true,linked:true,email:rows[0].email});
}