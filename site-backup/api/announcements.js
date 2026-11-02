import { db } from 'hatchable';
export const access = 'public';
export const methods = ['GET'];
export default async function(req,res){
 const {rows}=await db.query(
  'SELECT id,title,body,created_at AS "createdAt" FROM app_announcements WHERE active=true ORDER BY created_at DESC,id DESC LIMIT 60'
 );
 res.setHeader('Cache-Control','no-store');
 return res.json({announcements:rows});
}