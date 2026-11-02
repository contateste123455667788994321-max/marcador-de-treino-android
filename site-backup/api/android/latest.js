// Consulta a última release oficial do GitHub; não exige login do aluno.
export const access='public';
export const methods=['GET'];
const RELEASES='https://api.github.com/repos/contateste123455667788994321-max/marcador-de-treino-android/releases/latest';
let cached=null,expires=0;
export default async function(req,res){
 res.setHeader('Cache-Control','public,max-age=300');
 const now=Date.now();
 if(cached&&now<expires)return res.json(cached);
 try{
  const response=await fetch(RELEASES,{headers:{Accept:'application/vnd.github+json','User-Agent':'Marcador-de-Treino-App'}});
  if(!response.ok)throw Error('GitHub '+response.status);
  const release=await response.json();
  const tag=String(release.tag_name||'');
  const match=/^v(\d+\.\d+\.\d+)$/.exec(tag);
  if(!match||release.draft||release.prerelease)throw Error('Release inválida');
  const versionName=match[1],expected='Marcador_de_Treino_Android_'+versionName.replace(/\./g,'_')+'.apk';
  const asset=(Array.isArray(release.assets)?release.assets:[]).find(a=>a.name===expected&&Number(a.size)>0);
  const url=asset?.browser_download_url||'';
  const expectedPrefix='https://github.com/contateste123455667788994321-max/marcador-de-treino-android/releases/download/'+tag+'/';
  if(!url.startsWith(expectedPrefix))throw Error('APK oficial indisponível');
  cached={available:true,versionName,downloadUrl:url,sha256:String(asset.digest||''),publishedAt:release.published_at||null};
  expires=now+5*60*1000;
  return res.json(cached);
 }catch(e){
  res.setHeader('Cache-Control','no-store');
  return res.json({available:false,reason:'Verificação temporariamente indisponível'});
 }
}