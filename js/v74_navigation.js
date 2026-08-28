/*
  TT Rivals P7.4.3 — navegación móvil progresiva.
  La pantalla sigue el dedo y completa o cancela el gesto con transform/opacity.
*/
const DEFAULT_TABS=['ranking','play','training','history','profile'];
const TAB_LABELS={
  ranking:'Ranking',play:'Jugar',
  training:'Entrenar',history:'Historial',profile:'Perfil'
};
const IGNORE_SELECTOR=[
  'input','textarea','select','button','a','label',
  '.modal','.horizontal-scroll','.tabs','.chip-row',
  '[contenteditable="true"]','[data-no-swipe]','[role="slider"]'
].join(',');

export function installSwipeNavigationV74({
  root=document.querySelector('.main-app'),
  getActiveTab=()=>document.body.dataset.activeTabV101||'play',
  activateTab,
  tabs=DEFAULT_TABS,
  threshold=64
}={}){
  if(!root||typeof activateTab!=='function')return()=>{};
  if(root.dataset.swipeNavigationV74==='1')return()=>{};
  root.dataset.swipeNavigationV74='1';

  let gesture=null;
  let animating=false;
  const isMobile=()=>window.matchMedia('(max-width: 899px)').matches;
  const modalOpen=()=>[...document.querySelectorAll('.modal')].some(el=>!el.classList.contains('hidden'));
  const pageFor=tab=>document.querySelector(`#tab-${tab}`);

  function clearVisual(page){
    if(page){
      page.classList.remove('v743-swipe-dragging','v743-swipe-cancel','v743-swipe-commit');
      page.style.removeProperty('--v743-swipe-x');
      page.style.removeProperty('opacity');
    }
    root.style.removeProperty('--v743-swipe-progress');
    delete root.dataset.swipeTargetV743;
    root.classList.remove('v743-swiping');
  }

  function targetFor(index,dx){
    const targetIndex=dx<0?index+1:index-1;
    return targetIndex>=0&&targetIndex<tabs.length?{index:targetIndex,tab:tabs[targetIndex]}:null;
  }

  function down(event){
    if(animating||!isMobile()||event.pointerType!=='touch'||!event.isPrimary||modalOpen())return;
    if(event.target.closest(IGNORE_SELECTOR))return;
    const tab=getActiveTab();
    const index=tabs.indexOf(tab);
    const page=pageFor(tab);
    if(index<0||!page)return;
    gesture={
      id:event.pointerId,x:event.clientX,y:event.clientY,at:performance.now(),
      width:Math.max(280,root.clientWidth||window.innerWidth),
      index,page,dragging:false,cancelled:false,lastX:event.clientX
    };
  }

  function move(event){
    if(!gesture||event.pointerId!==gesture.id)return;
    const dx=event.clientX-gesture.x;
    const dy=event.clientY-gesture.y;
    gesture.lastX=event.clientX;

    if(Math.abs(dy)>18&&Math.abs(dy)>Math.abs(dx)*.85){
      gesture.cancelled=true;
      if(gesture.dragging)cancelGesture();
      return;
    }
    if(Math.abs(dx)<7)return;

    const target=targetFor(gesture.index,dx);
    const resistance=target?1:.18;
    const max=gesture.width*.42;
    const translated=Math.max(-max,Math.min(max,dx*resistance));
    const progress=Math.min(1,Math.abs(translated)/(gesture.width*.32));

    gesture.dragging=true;
    gesture.page.classList.add('v743-swipe-dragging');
    gesture.page.style.setProperty('--v743-swipe-x',`${translated}px`);
    gesture.page.style.opacity=String(1-progress*.18);
    root.style.setProperty('--v743-swipe-progress',String(progress));
    root.classList.add('v743-swiping');

    if(target)root.dataset.swipeTargetV743=TAB_LABELS[target.tab]||target.tab;
    else delete root.dataset.swipeTargetV743;
  }

  function cancelGesture(){
    const current=gesture;
    gesture=null;
    if(!current?.page)return;
    const page=current.page;
    page.classList.add('v743-swipe-cancel');
    requestAnimationFrame(()=>{
      page.style.setProperty('--v743-swipe-x','0px');
      page.style.opacity='1';
    });
    setTimeout(()=>clearVisual(page),180);
  }

  function end(event){
    if(!gesture||event.pointerId!==gesture.id)return;
    const current=gesture;
    const dx=event.clientX-current.x;
    const dy=event.clientY-current.y;
    const elapsed=performance.now()-current.at;
    const target=targetFor(current.index,dx);
    const velocity=Math.abs(dx)/Math.max(1,elapsed);
    const commit=!current.cancelled&&target&&
      Math.abs(dx)>=threshold&&Math.abs(dx)>=Math.abs(dy)*1.35&&
      (elapsed<=900||velocity>.45);

    if(!commit){
      cancelGesture();
      return;
    }

    gesture=null;
    animating=true;
    const outgoing=current.page;
    const forward=dx<0;
    outgoing.classList.add('v743-swipe-commit');
    root.dataset.swipeTargetV743=TAB_LABELS[target.tab]||target.tab;
    root.style.setProperty('--v743-swipe-progress','1');

    requestAnimationFrame(()=>{
      outgoing.style.setProperty('--v743-swipe-x',forward?'-34vw':'34vw');
      outgoing.style.opacity='0';
    });

    setTimeout(()=>{
      clearVisual(outgoing);
      activateTab(target.tab,{source:'swipe'});
      const incoming=pageFor(target.tab);
      if(incoming){
        incoming.classList.add(forward?'v743-arrive-from-right':'v743-arrive-from-left');
        setTimeout(()=>incoming.classList.remove('v743-arrive-from-right','v743-arrive-from-left'),260);
      }
      navigator.vibrate?.(8);
      setTimeout(()=>{animating=false},240);
    },135);
  }

  function cancel(){
    if(gesture?.dragging)cancelGesture();
    else gesture=null;
  }

  root.addEventListener('pointerdown',down,{passive:true});
  root.addEventListener('pointermove',move,{passive:true});
  root.addEventListener('pointerup',end,{passive:true});
  root.addEventListener('pointercancel',cancel,{passive:true});

  return ()=>{
    cancel();
    delete root.dataset.swipeNavigationV74;
    root.removeEventListener('pointerdown',down);
    root.removeEventListener('pointermove',move);
    root.removeEventListener('pointerup',end);
    root.removeEventListener('pointercancel',cancel);
  };
}
