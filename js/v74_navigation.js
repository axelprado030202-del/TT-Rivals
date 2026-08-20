/*
  TT Rivals P7.4 — navegación móvil por gesto.
  El gesto opera sólo sobre el área principal y nunca dentro de controles o modales.
*/
const DEFAULT_TABS=['home','ranking','play','training','tournaments','history','profile'];
const IGNORE_SELECTOR=[
  'input','textarea','select','button','a','label',
  '.modal','.horizontal-scroll','.tabs','.chip-row',
  '[contenteditable="true"]','[data-no-swipe]','[role="slider"]'
].join(',');

export function installSwipeNavigationV74({
  root=document.querySelector('.main-app'),
  getActiveTab=()=>document.body.dataset.activeTabV101||'home',
  activateTab,
  tabs=DEFAULT_TABS,
  threshold=64
}={}){
  if(!root||typeof activateTab!=='function')return()=>{};
  if(root.dataset.swipeNavigationV74==='1')return()=>{};
  root.dataset.swipeNavigationV74='1';

  let gesture=null;
  const isMobile=()=>window.matchMedia('(max-width: 899px)').matches;
  const modalOpen=()=>[...document.querySelectorAll('.modal')].some(el=>!el.classList.contains('hidden'));

  function down(event){
    if(!isMobile()||event.pointerType!=='touch'||!event.isPrimary||modalOpen())return;
    if(event.target.closest(IGNORE_SELECTOR))return;
    gesture={id:event.pointerId,x:event.clientX,y:event.clientY,at:performance.now(),cancelled:false};
  }

  function move(event){
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x;
    const dy=event.clientY-gesture.y;
    if(Math.abs(dy)>18&&Math.abs(dy)>Math.abs(dx)*.85)gesture.cancelled=true;
  }

  function end(event){
    if(!gesture||event.pointerId!==gesture.id)return;
    const current=gesture;
    gesture=null;
    if(current.cancelled||modalOpen())return;

    const dx=event.clientX-current.x;
    const dy=event.clientY-current.y;
    const elapsed=performance.now()-current.at;
    if(elapsed>800||Math.abs(dx)<threshold||Math.abs(dx)<Math.abs(dy)*1.35)return;

    const active=getActiveTab();
    const index=tabs.indexOf(active);
    if(index<0)return;
    const nextIndex=dx<0?index+1:index-1;
    if(nextIndex<0||nextIndex>=tabs.length)return;

    activateTab(tabs[nextIndex],{source:'swipe'});
    navigator.vibrate?.(8);
  }

  function cancel(){gesture=null}

  root.addEventListener('pointerdown',down,{passive:true});
  root.addEventListener('pointermove',move,{passive:true});
  root.addEventListener('pointerup',end,{passive:true});
  root.addEventListener('pointercancel',cancel,{passive:true});

  return ()=>{
    delete root.dataset.swipeNavigationV74;
    root.removeEventListener('pointerdown',down);
    root.removeEventListener('pointermove',move);
    root.removeEventListener('pointerup',end);
    root.removeEventListener('pointercancel',cancel);
  };
}
