(function(){
'use strict';
if(window.__mtLibraryConsultInstalled)return;window.__mtLibraryConsultInstalled=true;
const $=id=>document.getElementById(id);
let browsing=false,scheduled=false;
const dumbbell='<svg class="mt-library-halter" viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#a6ff00" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12h12M4 9v6M7 7v10M17 7v10M20 9v6"/></svg>';
const st=document.createElement('style');st.id='mt-library-consult-css';st.textContent="\n#header-profile{width:34px!important;height:34px!important;min-width:34px!important;min-height:34px!important;overflow:hidden!important;position:relative!important;display:grid!important;place-items:center!important;padding:0!important;box-sizing:border-box!important;border-radius:50%!important;border:1px solid #83b84a!important;background:#192419!important;line-height:0!important}\n#header-profile>img,#header-profile .profile-thumb,#header-profile .profile-image{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;min-width:100%!important;min-height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;object-position:center center!important;display:block!important;margin:0!important;padding:0!important;border:0!important;border-radius:50%!important;box-sizing:border-box!important;transform:none!important}\n#header-profile>.native-avatar,#header-profile>.anonymous-avatar{position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;width:100%!important;height:100%!important;border:0!important;border-radius:50%!important;overflow:hidden!important;box-shadow:none!important;box-sizing:border-box!important}\nbody.mt-library-consult .exercise-tile .plus-btn,body.mt-library-consult #screen [data-add],body.mt-library-consult #screen .detail-cta{display:none!important}\n#mt-library-consult-banner{background:linear-gradient(110deg,#243c1b,#101b11);border:1px solid #507538;border-radius:14px;padding:12px 14px;margin:10px 0 14px;color:#e9ffdd}\n#mt-library-consult-banner strong{font-size:14px;display:block}\n#mt-library-consult-banner p{font-size:11px;color:#bad4b1;line-height:1.5;margin:5px 0 0}\n#mt-library-suggest{margin:15px 0 17px;padding:15px;border:1px solid #517039;border-radius:17px;background:linear-gradient(145deg,#1d2d19,#111b11)}\n#mt-library-suggest h3{font-size:16px;margin:0 0 7px;font-weight:900;color:#f1ffe8}\n#mt-library-suggest p{font-size:11px;line-height:1.5;color:#b8d1af;margin:0 0 13px}\n#mt-library-suggest label{display:block;font-size:11px;font-weight:750;color:#ddffd0;margin:10px 0 6px}\n#mt-library-suggest input,#mt-library-suggest textarea{width:100%;padding:11px 12px;background:#0b130d;color:#f5ffee;border:1px solid #4d6742;border-radius:11px;box-sizing:border-box;outline:none;font:inherit;font-size:13px}\n#mt-library-suggest textarea{min-height:84px;resize:vertical}\n#mt-library-suggest input:focus,#mt-library-suggest textarea:focus{border-color:#a6ff00}\n#mt-library-suggest button{width:100%;border:0;border-radius:12px;background:#a6ff00;color:#162706;font-weight:900;min-height:45px;margin-top:12px}\n#mt-library-suggest button:disabled{opacity:.55}\n#mt-library-suggest .suggest-status{min-height:15px;font-size:11px;color:#c1ff8b;line-height:1.5;margin-top:9px}\n";document.head.appendChild(st);
function page(){return $('header-text')?.textContent?.trim()}
function syncBrowse(){document.body.classList.toggle('mt-library-consult',browsing)}
function fixLibraryIcon(){
 const home=$('screen')?.querySelector('.home-secondary button:first-child');if(!home)return;
 const icon=home.querySelector('svg');
 if(icon&&!home.querySelector('.mt-library-halter'))icon.outerHTML=dumbbell;
}
function showReadOnly(){
 if(!browsing)return;
 const scr=$('screen');if(!scr)return;
 if(page()==='Meus Exercícios'){
  if(!$('mt-library-consult-banner')){
   const notice=document.createElement('div');notice.id='mt-library-consult-banner';
   notice.innerHTML='<strong>Biblioteca para consulta</strong><p>Veja os exercícios com calma. Lembrou de algum que falta? Envie uma sugestão ao criador do app no formulário abaixo.</p>';
   const input=$('ex-search');
   if(input)input.insertAdjacentElement('beforebegin',notice);
   else scr.prepend(notice);
  }
  if(!$('mt-library-suggest')){
   const form=document.createElement('form');form.id='mt-library-suggest';
   form.innerHTML='<h3>💚 Sugerir exercício</h3><p>Não encontrou um movimento na biblioteca? Escreva o nome e uma observação. A sugestão será enviada em privado para o dono do aplicativo analisar.</p>'+
     '<label for="mt-suggest-name">Nome do exercício</label><input id="mt-suggest-name" required minlength="3" maxlength="100" placeholder="Ex.: desenvolvimento Arnold com halteres">'+
     '<label for="mt-suggest-comment">Comentário (opcional)</label><textarea id="mt-suggest-comment" maxlength="500" placeholder="Como é o movimento ou qual equipamento usa?"></textarea>'+
     '<input name="website" aria-hidden="true" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;width:1px" value="">'+
     '<button type="submit">Enviar sugestão ao criador</button><div class="suggest-status" role="status" aria-live="polite"></div>';
   scr.append(form);
   form.addEventListener('submit',async event=>{
    event.preventDefault();
    const button=form.querySelector('button[type="submit"]'),msg=form.querySelector('.suggest-status');
    const exerciseName=form.querySelector('#mt-suggest-name')?.value.trim()||'';
    const comment=form.querySelector('#mt-suggest-comment')?.value.trim()||'';
    if(exerciseName.length<3)return;
    button.disabled=true;msg.textContent='Enviando sugestão...';
    try{
     const response=await fetch('/api/exercise-suggestions',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({exerciseName,comment,website:form.querySelector('[name="website"]')?.value||''})});
     const body=await response.json().catch(()=>({}));
     if(!response.ok)throw Error(body.error||'Não foi possível enviar.');
     msg.textContent='Sugestão enviada! Só o dono poderá ver e avaliar. 💚';
     form.querySelector('#mt-suggest-name').value='';
     form.querySelector('#mt-suggest-comment').value='';
    }catch(error){msg.textContent=error.message||'Erro de conexão. Tente novamente.'}
    finally{button.disabled=false}
   });
  }
 }
}
function decorate(){scheduled=false;fixLibraryIcon();syncBrowse();showReadOnly()}
function schedule(){if(scheduled)return;scheduled=true;setTimeout(decorate,60)}
document.addEventListener('click',e=>{
 const btn=e.target.closest?.('button');if(!btn)return;
 const go=btn.dataset.go||btn.dataset.nav||'';
 if(btn.closest('.home-secondary')&&go==='exercises'){
  browsing=true;syncBrowse();schedule();
  return;
 }
 if(go==='workout'||go==='home'||go==='diet'||go==='music'||go==='progress'||go==='profile'||go==='steps-history'){
  browsing=false;syncBrowse();
 }
 if(browsing&&btn.dataset.add!==undefined){
  e.preventDefault();e.stopImmediatePropagation();
 }
},true);
const screen=$('screen');
if(screen)new MutationObserver(schedule).observe(screen,{childList:true,subtree:false});
setInterval(()=>{if(!document.hidden)decorate()},2500);
decorate();
})();