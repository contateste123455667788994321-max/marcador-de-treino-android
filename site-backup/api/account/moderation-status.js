import { db } from 'hatchable';
export const access='user';
export const methods=['GET'];
export default async function(req,res){
 const {rows}=await db.query('SELECT banned,reason FROM app_moderation WHERE user_id=$1',[String(req.user.id)]);
 res.setHeader('Cache-Control','no-store');
 return res.json({banned:!!rows[0]?.banned,reason:rows[0]?.banned?(rows[0].reason||'Violação das regras de uso.'):''});
}