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

  if (!data || !data.player) return;

  const activeItem = data.player.activeItem;
  document.getElementById('title').innerHTML = activeItem.artist.toUpperCase();
  document.getElementById('artist').innerHTML = activeItem.title.toUpperCase();

  const current = parseSeconds(activeItem.position);
  const length = parseSeconds(activeItem.duration);
  const state = data.player.playbackState;

  document.getElementById('length').innerHTML = prettyPrintTime(length);
  if (state === 'playing') {
    document.getElementById('current').innerHTML = prettyPrintTime(current);
    calculateProgress(length.raw, current.raw);
  } else {
    document.getElementById('current').innerHTML = prettyPrintTime(current);
    document.getElementById('progress').style.strokeDasharray = `${circumference * (current.raw / length.raw)} ${circumference}`;
  }
  if (data.muted) {
    document.getElementById('progress').style.stroke = 'white';
  } else {
    document.getElementById('progress').style.stroke = 'red';
  }
};

const parseSeconds = (seconds) => {
  let min = Math.floor(seconds / 60);
  let sec = Math.floor(seconds % 60);
  return { min: min, sec: sec, raw: seconds };
}

const circumference = 1961;

const calculateProgress = (length, current) => {
  const progress = circumference * (current / length);
  document.getElementById('progress').style.strokeDasharray = `${progress} ${circumference}`;
};

const prettyPrintTime = (time) => {
  return (time.min < 10 ? '0' + time.min : time.min) + ':' + (time.sec < 10 ? '0' + time.sec : time.sec);
}