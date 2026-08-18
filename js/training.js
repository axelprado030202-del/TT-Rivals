/*
  TT RIVALS V53 — CRONÓMETRO DE ENTRENAMIENTO
  - Tiempo configurable en minutos.
  - Cantidad total de ciclos configurable.
  - Al llegar a 00:00 emite pitido y reinicia automáticamente.
  - Play inicia; Stop detiene y reinicia.
  - Usa Date.now() para no acumular deriva por setInterval.
*/

let audioContextV53=null;

function clamp(value,min,max,fallback){
  const n=Number(value);
  if(!Number.isFinite(n))return fallback;
  return Math.max(min,Math.min(max,n));
}

function formatClock(totalSeconds){
  const seconds=Math.max(0,Math.floor(totalSeconds));
  const mm=Math.floor(seconds/60);
  const ss=seconds%60;
  return `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
}

async function ensureAudioV53(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return null;
  if(!audioContextV53)audioContextV53=new AudioCtx();
  if(audioContextV53.state==='suspended'){
    try{await audioContextV53.resume()}catch{}
  }
  return audioContextV53;
}

function toneV53(frequency=880,duration=.14,delay=0,volume=.17){
  const ctx=audioContextV53;
  if(!ctx)return;

  const start=ctx.currentTime+delay;
  const oscillator=ctx.createOscillator();
  const gain=ctx.createGain();

  oscillator.type='sine';
  oscillator.frequency.setValueAtTime(frequency,start);

  gain.gain.setValueAtTime(0.0001,start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),start+.012);
  gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start+duration+.03);
}

function beepCycleV53(finalCycle=false){
  if(!audioContextV53)return;
  if(finalCycle){
    toneV53(740,.13,0,.16);
    toneV53(940,.13,.18,.18);
    toneV53(1180,.20,.36,.20);
  }else{
    toneV53(860,.13,0,.16);
    toneV53(1080,.16,.18,.18);
  }
}

export function setupTrainingTimerV53(){
  const root=document.querySelector('#tab-training');
  if(!root)return ()=>{};

  const clock=root.querySelector('#trainingClockV53');
  const minutesInput=root.querySelector('#trainingMinutesV53');
  const cyclesInput=root.querySelector('#trainingCyclesV53');
  const cycleNow=root.querySelector('#trainingCycleNowV53');
  const cycleTotal=root.querySelector('#trainingCycleTotalV53');
  const status=root.querySelector('#trainingStatusV53');
  const play=root.querySelector('#trainingPlayV53');
  const stop=root.querySelector('#trainingStopV53');
  const progress=root.querySelector('#trainingProgressV53');
  const minuteMinus=root.querySelector('[data-training-minutes="-1"]');
  const minutePlus=root.querySelector('[data-training-minutes="1"]');
  const cycleMinus=root.querySelector('[data-training-cycles="-1"]');
  const cyclePlus=root.querySelector('[data-training-cycles="1"]');

  if(!clock||!minutesInput||!cyclesInput||!play||!stop)return ()=>{};

  let running=false;
  let timerId=null;
  let cycle=1;
  let durationSeconds=240;
  let remainingSeconds=240;
  let endAt=0;
  let completing=false;

  function readConfig(){
    const mins=clamp(minutesInput.value,1,180,4);
    const cycles=Math.round(clamp(cyclesInput.value,1,99,5));
    minutesInput.value=String(Math.round(mins));
    cyclesInput.value=String(cycles);
    return {
      minutes:Math.round(mins),
      cycles,
      durationSeconds:Math.round(mins*60)
    };
  }

  function setControlsLocked(locked){
    [minutesInput,cyclesInput,minuteMinus,minutePlus,cycleMinus,cyclePlus].forEach(el=>{
      if(el)el.disabled=locked;
    });
  }

  function render(){
    const config=readConfig();
    if(!running)durationSeconds=config.durationSeconds;

    clock.textContent=formatClock(remainingSeconds);
    if(cycleNow)cycleNow.textContent=String(cycle);
    if(cycleTotal)cycleTotal.textContent=String(config.cycles);

    const elapsed=Math.max(0,durationSeconds-remainingSeconds);
    const pct=durationSeconds?Math.max(0,Math.min(100,(elapsed/durationSeconds)*100)):0;
    if(progress)progress.style.width=`${pct}%`;

    root.classList.toggle('is-running',running);
    play.disabled=running;
    stop.disabled=!running && remainingSeconds===durationSeconds && cycle===1;
  }

  function reset(message='Listo para entrenar.'){
    const config=readConfig();
    running=false;
    completing=false;
    if(timerId){
      clearInterval(timerId);
      timerId=null;
    }
    durationSeconds=config.durationSeconds;
    remainingSeconds=durationSeconds;
    cycle=1;
    endAt=0;
    setControlsLocked(false);
    if(status)status.textContent=message;
    render();
  }

  function completeCycle(){
    if(completing||!running)return;
    completing=true;

    const config=readConfig();
    const finalCycle=cycle>=config.cycles;
    beepCycleV53(finalCycle);

    if(finalCycle){
      running=false;
      if(timerId){
        clearInterval(timerId);
        timerId=null;
      }
      setControlsLocked(false);

      // Al completar la serie volvemos al tiempo elegido, pero no iniciamos
      // un ciclo adicional.
      remainingSeconds=config.durationSeconds;
      durationSeconds=config.durationSeconds;
      cycle=1;
      endAt=0;
      if(status)status.textContent=`Entrenamiento completado · ${config.cycles} ciclo${config.cycles===1?'':'s'}.`;
      render();
      completing=false;
      return;
    }

    cycle+=1;
    durationSeconds=config.durationSeconds;
    remainingSeconds=durationSeconds;
    // Reinicio automático inmediato.
    endAt=Date.now()+durationSeconds*1000;
    if(status)status.textContent=`Ciclo ${cycle} de ${config.cycles} en marcha.`;
    render();
    completing=false;
  }

  function tick(){
    if(!running)return;
    const msLeft=endAt-Date.now();

    if(msLeft<=0){
      remainingSeconds=0;
      render();
      completeCycle();
      return;
    }

    remainingSeconds=Math.ceil(msLeft/1000);
    render();
  }

  async function start(){
    if(running)return;

    const config=readConfig();
    await ensureAudioV53();

    durationSeconds=config.durationSeconds;
    // Play siempre comienza desde el tiempo completo si el reloj estaba parado.
    remainingSeconds=durationSeconds;
    cycle=1;
    endAt=Date.now()+durationSeconds*1000;
    running=true;
    setControlsLocked(true);
    if(status)status.textContent=`Ciclo 1 de ${config.cycles} en marcha.`;
    render();

    timerId=setInterval(tick,200);
  }

  function adjust(input,delta,min,max){
    if(running)return;
    const next=Math.round(clamp(Number(input.value)+delta,min,max,min));
    input.value=String(next);
    reset();
  }

  play.addEventListener('click',start);
  stop.addEventListener('click',()=>reset('Cronómetro detenido.'));

  minuteMinus?.addEventListener('click',()=>adjust(minutesInput,-1,1,180));
  minutePlus?.addEventListener('click',()=>adjust(minutesInput,1,1,180));
  cycleMinus?.addEventListener('click',()=>adjust(cyclesInput,-1,1,99));
  cyclePlus?.addEventListener('click',()=>adjust(cyclesInput,1,1,99));

  minutesInput.addEventListener('change',()=>reset());
  cyclesInput.addEventListener('change',()=>reset());

  // Al volver a la app, actualiza contra el reloj real.
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'&&running)tick();
  });

  reset();

  return ()=>{
    if(timerId)clearInterval(timerId);
    timerId=null;
    running=false;
  };
}
