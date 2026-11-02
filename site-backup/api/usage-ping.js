import { db } from 'hatchable';
export const access='public';
export const methods=['POST'];
export default async function(req,res){
 const deviceId=typeof req.body?.deviceId==='string'?req.body.deviceId:'';
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(deviceId))
  return res.status(400).json({error:'Identificador inválido.'});
 await db.query('INSERT INTO app_presence(device_id) VALUES($1) ON CONFLICT(device_id) DO UPDATE SET last_seen=now()',[deviceId]);
 await db.query("INSERT INTO app_daily_devices(day,device_id) VALUES((now() AT TIME ZONE 'America/Sao_Paulo')::date,$1) ON CONFLICT DO NOTHING",[deviceId]);
 res.setHeader('Cache-Control','no-store');
 return res.json({ok:true});
}