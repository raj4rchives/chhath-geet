const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const trackName = document.getElementById("trackName");
const artistName = document.getElementById("artistName");
const volume = document.getElementById("volume");
const toast = document.getElementById("toast");
const songs = [...document.querySelectorAll(".song-card")];
let index = 0;
let muted = false;

function msg(text){
  toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>toast.classList.remove("show"),1800);
}
function fmt(sec){
  if(!Number.isFinite(sec)) return "0:00";
  return Math.floor(sec/60)+":"+String(Math.floor(sec%60)).padStart(2,"0");
}
function loadSong(i, auto=false){
  index = (i+songs.length)%songs.length;
  const card = songs[index];
  audio.src = card.dataset.src;
  trackName.textContent = card.dataset.title;
  artistName.textContent = card.dataset.artist;
  songs.forEach(x=>x.classList.remove("selected"));
  card.classList.add("selected");
  progress.value = 0;
  if(auto) audio.play().catch(()=>msg("Play button dabakar song start karein"));
}
function togglePlay(){
  if(!audio.src) loadSong(0);
  if(audio.paused) audio.play().catch(()=>msg("Song file nahi mili ya browser ne play block kiya"));
  else audio.pause();
}
playBtn.onclick = togglePlay;
document.getElementById("prevBtn").onclick = ()=>{loadSong(index-1,true)};
document.getElementById("nextBtn").onclick = ()=>{loadSong(index+1,true)};
songs.forEach((card,i)=>card.onclick=()=>loadSong(i,true));

audio.addEventListener("loadedmetadata",()=>{
  duration.textContent=fmt(audio.duration);
});
audio.addEventListener("timeupdate",()=>{
  currentTime.textContent=fmt(audio.currentTime);
  progress.value=audio.duration ? (audio.currentTime/audio.duration)*100 : 0;
});
progress.oninput=()=>{
  if(audio.duration) audio.currentTime=(progress.value/100)*audio.duration;
};
volume.oninput=()=>audio.volume=volume.value;
document.getElementById("volumeBtn").onclick=()=>{
  muted=!muted; audio.muted=muted;
  document.getElementById("volumeBtn").textContent=muted?"🔇":"🔊";
};
document.getElementById("muteBtn").onclick=()=>{
  muted=!muted; audio.muted=muted;
  document.getElementById("muteBtn").textContent=muted?"🔇":"🔊";
};
audio.addEventListener("play",()=>playBtn.textContent="Ⅱ");
audio.addEventListener("pause",()=>playBtn.textContent="▶");
audio.addEventListener("ended",()=>loadSong(index+1,true));

document.querySelectorAll(".mode").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll(".mode").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    msg(btn.textContent+" geet selected");
  };
});
document.getElementById("langBtn").onclick=()=>msg("Hindi / English mode");
document.getElementById("menuBtn").onclick=()=>msg("Menu");
document.getElementById("closeBtn").onclick=()=>document.getElementById("player").style.opacity=".65";
async function share(){
  const data={title:"Chhath Geet",text:"Chhath Geet — Songs of the Sun",url:location.href};
  if(navigator.share){try{await navigator.share(data)}catch(e){}}
  else{await navigator.clipboard?.writeText(location.href);msg("Website link copied");}
}
document.getElementById("shareBtn").onclick=share;
document.getElementById("sharePlayer").onclick=share;

loadSong(0,false);
audio.volume=.85;
