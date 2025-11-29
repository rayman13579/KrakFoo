window.nzxt = {
  v1: {
    onMonitoringDataUpdate: data => {
      const { cpus, gpus } = data;
      update_cpu(cpus[0]);
      if (gpus.length > 1) {
        update_gpu(gpus[1]);
      } else {
        update_gpu(gpus[0]);
      }
    },
  },
};

const update_cpu = cpu => {
  document.getElementById('cpu_temp').innerHTML = `${Math.round(cpu.temperature)}°C`;
  const load = Math.round(cpu.load * 100);
  document.getElementById('cpu_load').innerHTML = `${(load < 10 ? '0' + load : load)}%`;
}

const update_gpu = gpu => {
  document.getElementById('gpu_temp').innerHTML = `${Math.round(gpu.temperature)}°C`;
  const load = Math.round(gpu.load * 100);
  document.getElementById('gpu_load').innerHTML = `${(load < 10 ? '0' + load : load)}%`;
}

const foobarEvents = new EventSource('http://localhost:8880/foobar2000');

foobarEvents.onmessage = event => {
  const data = JSON.parse(event.data);

  if (data && data.player) {
    document.getElementById('title').innerHTML = data.player.activeItem.artist.toUpperCase();
    document.getElementById('artist').innerHTML = data.player.activeItem.title.toUpperCase();
    const current = parseSeconds(data.player.activeItem.position);
    const length = parseSeconds(data.player.activeItem.duration);
    document.getElementById('length').innerHTML = prettyPrintTime(length);
    const state = data.player.playbackState;
    document.getElementById('playing').innerHTML = state.toUpperCase();
    document.getElementById('muted').innerHTML = data.muted ? 'MUTED' : 'NOT MUTED';

    if (state === 'playing') {
      startTimer(current, length);
    } else {
      document.getElementById('current').innerHTML = prettyPrintTime(current);
      document.getElementById('progress').style.strokeDasharray = `${circumference * (current.raw / length.raw)} ${circumference}`;
      document.getElementById('progress').style.stroke = 'white';
      animation?.cancel();
      stopTimer();
    }
  }
};

const parseSeconds = (seconds) => {
  let min = Math.floor(seconds / 60);
  let sec = Math.floor(seconds % 60);
  return { min: min, sec: sec, raw: seconds };
}

let timer;
let currentRaw = 0;
let progress = 0;
let oldProgress = 0;
let animation;

const stopTimer = () => {
  clearInterval(timer);
  timer = null;
  currentRaw = 0;
}

const startTimer = (current, length) => {
  stopTimer();
  document.getElementById('progress').style.stroke = 'red';
  document.getElementById('progress').style.animationPlayState = 'running';
  currentRaw = current.raw;
  timer = setInterval(() => {
    currentRaw += 1;
    current.sec += 1;
    if (current.sec >= 60) {
      current.min += 1;
      current.sec = 0;
    }
    document.getElementById('current').innerHTML = prettyPrintTime(current);
    calculateProgress(length);
  }, 1000);
}

const circumference = 1961;

const calculateProgress = (length) => {
  oldProgress = progress;
  progress = circumference * (currentRaw / length.raw);
  animation?.cancel();
  animation = document.getElementById('progress').animate(
    [
      { strokeDasharray: `${oldProgress} ${circumference}` },
      { strokeDasharray: `${progress} ${circumference}` }
    ],
    {
      duration: 1000,
      iterations: Infinity,
      easing: 'linear',
    }
  );
}

const prettyPrintTime = (time) => {
  return (time.min < 10 ? '0' + time.min : time.min) + ':' + (time.sec < 10 ? '0' + time.sec : time.sec);
}