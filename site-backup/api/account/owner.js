import { db } from 'hatchable';
export const access='user';
export const methods=['GET'];
export default async function(req,res){
 const {rows}=await db.query('SELECT 1 FROM app_owner_link WHERE slot=1 AND app_user_id=$1 LIMIT 1',[String(req.user.id)]);
 res.setHeader('Cache-Control','no-store');
 return res.json({owner:rows.length>0});
}