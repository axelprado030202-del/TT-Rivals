/*
  TT RIVALS V54 — CRONÓMETRO DE ENTRENAMIENTO

  CAMBIOS V54
  - STOP = PAUSA. No reinicia.
  - PLAY = inicia o REANUDA desde donde quedó.
  - RESET = reinicia tiempo + ciclo y deja detenido.
  - Minutos y segundos configurables.
  - Pitido más fuerte y demandante.
  - Repetición automática de ciclos preservada.
*/

let audioContextV53=null;
let masterGainV54=null;
let compressorV54=null;

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

async function ensureAudioV54(){
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  if(!AudioCtx)return null;

  if(!audioContextV53){
    audioContextV53=new AudioCtx();

    compressorV54=audioContextV53.createDynamicsCompressor();
    compressorV54.threshold.value=-14;
    compressorV54.knee.value=10;
    compressorV54.ratio.value=8;
    compressorV54.attack.value=.003;
    compressorV54.release.value=.16;

    masterGainV54=audioContextV53.createGain();
    masterGainV54.gain.value=.92;

    masterGainV54.connect(compressorV54);
    compressorV54.connect(audioContextV53.destination);
  }

  if(audioContextV53.state==='suspended'){
    try{await audioContextV53.resume()}catch{}
  }

  return audioContextV53;
}

function alarmToneV54({
  frequency=900,
  frequency2=null,
  duration=.22,
  delay=0,
  volume=.38,
  type='square'
}={}){
  const ctx=audioContextV53;
  if(!ctx||!masterGainV54)return;

  const start=ctx.currentTime+delay;
  const stop=start+duration;

  const osc=ctx.createOscillator();
  const gain=ctx.createGain();

  osc.type=type;
  osc.frequency.setValueAtTime(frequency,start);

  gain.gain.setValueAtTime(.0001,start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),start+.012);
  gain.gain.setValueAtTime(Math.max(.001,volume),Math.max(start+.013,stop-.055));
  gain.gain.exponentialRampToValueAtTime(.0001,stop);

  osc.connect(gain);
  gain.connect(masterGainV54);
  osc.start(start);
  osc.stop(stop+.02);

  // Segunda frecuencia simultánea para que la señal corte mejor en ambientes ruidosos.
  if(frequency2){
    const osc2=ctx.createOscillator();
    const gain2=ctx.createGain();

    osc2.type='sawtooth';
    osc2.frequency.setValueAtTime(frequency2,start);
    gain2.gain.setValueAtTime(.0001,start);
    gain2.gain.exponentialRampToValueAtTime(Math.max(.001,volume*.52),start+.012);
    gain2.gain.setValueAtTime(Math.max(.001,volume*.52),Math.max(start+.013,stop-.055));
    gain2.gain.exponentialRampToValueAtTime(.0001,stop);

    osc2.connect(gain2);
    gain2.connect(masterGainV54);
    osc2.start(start);
    osc2.stop(stop+.02);
  }
}

function beepCycleV54(finalCycle=false){
  if(!audioContextV53)return;

  if(finalCycle){
    // Fin de toda la serie: patrón más largo y contundente.
    alarmToneV54({frequency:720,frequency2:1080,duration:.24,delay:0,volume:.42});
    alarmToneV54({frequency:720,frequency2:1080,duration:.24,delay:.31,volume:.42});
    alarmToneV54({frequency:980,frequency2:1470,duration:.42,delay:.62,volume:.46});
  }else{
    // Fin de un ciclo: dos golpes claros.
    alarmToneV54({frequency:760,frequency2:1140,duration:.25,delay:0,volume:.42});
    alarmToneV54({frequency:980,frequency2:1470,duration:.30,delay:.32,volume:.44});
  }
}

export function setupTrainingTimerV53(){
  const root=document.querySelector('#tab-training');
  if(!root)return ()=>{};

  const clock=root.querySelector('#trainingClockV53');
  const minutesInput=root.querySelector('#trainingMinutesV53');
  const secondsInput=root.querySelector('#trainingSecondsV54');
  const cyclesInput=root.querySelector('#trainingCyclesV53');
  const cycleNow=root.querySelector('#trainingCycleNowV53');
  const cycleTotal=root.querySelector('#trainingCycleTotalV53');
  const status=root.querySelector('#trainingStatusV53');
  const play=root.querySelector('#trainingPlayV53');
  const stop=root.querySelector('#trainingStopV53');
  const resetButton=root.querySelector('#trainingResetV54');
  const progress=root.querySelector('#trainingProgressV53');
  const minuteMinus=root.querySelector('[data-training-minutes="-1"]');
  const minutePlus=root.querySelector('[data-training-minutes="1"]');
  const secondMinus=root.querySelector('[data-training-seconds="-5"]');
  const secondPlus=root.querySelector('[data-training-seconds="5"]');
  const cycleMinus=root.querySelector('[data-training-cycles="-1"]');
  const cyclePlus=root.querySelector('[data-training-cycles="1"]');

  if(
    !clock||!minutesInput||!secondsInput||!cyclesInput||
    !play||!stop||!resetButton
  ) return ()=>{};

  let running=false;
  let paused=false;
  let sessionStarted=false;
  let timerId=null;
  let cycle=1;
  let durationSeconds=60;
  let remainingSeconds=60;
  let endAt=0;
  let completing=false;

  function readConfig(){
    const minutes=Math.round(clamp(minutesInput.value,0,180,1));
    const seconds=Math.round(clamp(secondsInput.value,0,59,0));
    const cycles=Math.round(clamp(cyclesInput.value,1,99,2));

    minutesInput.value=String(minutes);
    secondsInput.value=String(seconds);
    cyclesInput.value=String(cycles);

    let total=minutes*60+seconds;
    if(total<1){
      total=1;
      minutesInput.value='0';
      secondsInput.value='1';
    }

    return {
      minutes,
      seconds,
      cycles,
      durationSeconds:total
    };
  }

  function setConfigLocked(locked){
    [
      minutesInput,secondsInput,cyclesInput,
      minuteMinus,minutePlus,secondMinus,secondPlus,cycleMinus,cyclePlus
    ].forEach(el=>{
      if(el)el.disabled=locked;
    });
  }

  function clearTicker(){
    if(timerId){
      clearInterval(timerId);
      timerId=null;
    }
  }

  function updateRemainingFromClock(){
    if(!running)return;
    const msLeft=endAt-Date.now();
    remainingSeconds=Math.max(0,Math.ceil(msLeft/1000));
  }

  function progressPct(){
    if(durationSeconds<=0)return 0;
    const elapsed=Math.max(0,durationSeconds-remainingSeconds);
    return Math.max(0,Math.min(100,(elapsed/durationSeconds)*100));
  }

  function render(){
    const config=readConfig();

    clock.textContent=formatClock(remainingSeconds);
    if(cycleNow)cycleNow.textContent=String(cycle);
    if(cycleTotal)cycleTotal.textContent=String(config.cycles);
    if(progress)progress.style.width=`${progressPct()}%`;

    root.classList.toggle('is-running',running);
    root.classList.toggle('is-paused',paused&&!running&&sessionStarted);

    play.disabled=running;
    stop.disabled=!running;

    // Reset siempre puede tocarse cuando hay una sesión iniciada o pausada.
    resetButton.disabled=!sessionStarted && !running && !paused;
  }

  function reset(message='Cronómetro reiniciado.'){
    const config=readConfig();

    clearTicker();
    running=false;
    paused=false;
    sessionStarted=false;
    completing=false;
    cycle=1;
    durationSeconds=config.durationSeconds;
    remainingSeconds=durationSeconds;
    endAt=0;
    setConfigLocked(false);

    if(status)status.textContent=message;
    render();
  }

  function pause(){
    if(!running)return;

    updateRemainingFromClock();
    clearTicker();

    running=false;
    paused=true;
    sessionStarted=true;
    endAt=0;

    if(status)status.textContent=`Pausado en ${formatClock(remainingSeconds)} · ciclo ${cycle}.`;
    render();
  }

  async function playOrResume(){
    if(running)return;

    const config=readConfig();
    await ensureAudioV54();

    if(!sessionStarted){
      durationSeconds=config.durationSeconds;
      remainingSeconds=durationSeconds;
      cycle=1;
      sessionStarted=true;
      paused=false;
      setConfigLocked(true);
    }else{
      // Reanuda exactamente desde donde quedó.
      paused=false;
    }

    running=true;
    endAt=Date.now()+remainingSeconds*1000;

    if(status){
      status.textContent=`Ciclo ${cycle} de ${config.cycles} en marcha · ${formatClock(remainingSeconds)} restantes.`;
    }

    render();
    clearTicker();
    timerId=setInterval(tick,150);
  }

  function completeCycle(){
    if(completing||!running)return;
    completing=true;

    const config=readConfig();
    const finalCycle=cycle>=config.cycles;

    remainingSeconds=0;
    render();
    beepCycleV54(finalCycle);

    if(finalCycle){
      clearTicker();
      running=false;
      paused=false;
      sessionStarted=false;
      cycle=1;
      durationSeconds=config.durationSeconds;
      remainingSeconds=durationSeconds;
      endAt=0;
      setConfigLocked(false);

      if(status){
        status.textContent=`Entrenamiento completado · ${config.cycles} ciclo${config.cycles===1?'':'s'}.`;
      }

      render();
      completing=false;
      return;
    }

    cycle+=1;
    durationSeconds=config.durationSeconds;
    remainingSeconds=durationSeconds;
    endAt=Date.now()+durationSeconds*1000;

    if(status){
      status.textContent=`Ciclo ${cycle} de ${config.cycles} en marcha.`;
    }

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

  function adjust(input,delta,min,max){
    if(sessionStarted||running||paused)return;

    const next=Math.round(clamp(Number(input.value)+delta,min,max,min));
    input.value=String(next);

    const config=readConfig();
    durationSeconds=config.durationSeconds;
    remainingSeconds=durationSeconds;
    cycle=1;

    if(status)status.textContent='Listo para entrenar.';
    render();
  }

  play.addEventListener('click',playOrResume);
  stop.addEventListener('click',pause);
  resetButton.addEventListener('click',()=>reset());

  minuteMinus?.addEventListener('click',()=>adjust(minutesInput,-1,0,180));
  minutePlus?.addEventListener('click',()=>adjust(minutesInput,1,0,180));
  secondMinus?.addEventListener('click',()=>adjust(secondsInput,-5,0,59));
  secondPlus?.addEventListener('click',()=>adjust(secondsInput,5,0,59));
  cycleMinus?.addEventListener('click',()=>adjust(cyclesInput,-1,1,99));
  cyclePlus?.addEventListener('click',()=>adjust(cyclesInput,1,1,99));

  minutesInput.addEventListener('change',()=>{
    if(sessionStarted||running||paused)return;
    const config=readConfig();
    durationSeconds=config.durationSeconds;
    remainingSeconds=durationSeconds;
    render();
  });

  secondsInput.addEventListener('change',()=>{
    if(sessionStarted||running||paused)return;
    const config=readConfig();
    durationSeconds=config.durationSeconds;
    remainingSeconds=durationSeconds;
    render();
  });

  cyclesInput.addEventListener('change',()=>{
    if(sessionStarted||running||paused)return;
    readConfig();
    render();
  });

  // Si el navegador suspende timers en segundo plano, al volver se corrige
  // usando la hora real del dispositivo.
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible'&&running)tick();
  });

  const initial=readConfig();
  durationSeconds=initial.durationSeconds;
  remainingSeconds=durationSeconds;
  cycle=1;
  setConfigLocked(false);
  if(status)status.textContent='Listo para entrenar.';
  render();

  return ()=>{
    clearTicker();
    running=false;
    paused=false;
    sessionStarted=false;
  };
}
