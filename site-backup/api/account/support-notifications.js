import { db } from 'hatchable';
export const access='user';
export const methods=['GET'];
export default async function(req,res){
 const {rows}=await db.query(
  'SELECT m.id,m.body,m.created_at AS "createdAt" FROM app_support_messages m JOIN app_support_threads t ON t.id=m.thread_id WHERE t.user_id=$1 AND m.sender_role=$2 ORDER BY m.id DESC LIMIT 1',
  [String(req.user.id),'owner']);
 res.setHeader('Cache-Control','no-store');
 return res.json({lastReply:rows[0]||null});
}