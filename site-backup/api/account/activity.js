import { db } from 'hatchable';
export const access='user';
export const methods=['POST'];
export default async function(req,res){
 const userId=String(req.user.id);
 const deviceId=typeof req.body?.deviceId==='string'?req.body.deviceId:'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deviceId))
  return res.status(400).json({error:'Identificador inválido.'});
 const {rows:banned}=await db.query('SELECT banned FROM app_moderation WHERE user_id=$1',[userId]);
 if(banned[0]?.banned)return res.status(403).json({error:'Conta bloqueada.'});
 await db.query('INSERT INTO app_presence(device_id,user_id) VALUES($1,$2) ON CONFLICT(device_id) DO UPDATE SET user_id=excluded.user_id,last_seen=now()',[deviceId,userId]);
 await db.query("INSERT INTO app_daily_devices(day,device_id) VALUES((now() AT TIME ZONE 'America/Sao_Paulo')::date,$1) ON CONFLICT DO NOTHING",[deviceId]);
 res.setHeader('Cache-Control','no-store');
 return res.json({ok:true});
}