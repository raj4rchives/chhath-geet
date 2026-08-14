const audio=document.getElementById("audio");
const playBtn=document.getElementById("playBtn");
const mini=document.getElementById("miniPlayer");
const miniPlay=document.getElementById("miniPlay");
const miniTitle=document.getElementById("miniTitle");
const currentTitle=document.getElementById("currentTitle");
const continueCard=document.getElementById("continueCard");
let currentSrc="";

function toggle(){
  if(!currentSrc){
    const first=document.querySelector(".song");
    loadSong(first);
  } else if(audio.paused){
    audio.play().catch(()=>{});
  } else audio.pause();
}
function loadSong(card){
  currentSrc=card.dataset.song;
  audio.src=currentSrc;
  const title=card.dataset.title;
  currentTitle.textContent=title;
  miniTitle.textContent=title;
  mini.classList.add("show");
  audio.play().catch(()=>{});
}
document.querySelectorAll(".song").forEach(card=>{
  card.querySelector(".song-play").addEventListener("click",()=>loadSong(card));
});
playBtn.addEventListener("click",toggle);
miniPlay.addEventListener("click",toggle);
document.getElementById("closeContinue").addEventListener("click",()=>continueCard.style.display="none");
audio.addEventListener("play",()=>{
  playBtn.innerHTML="<span>Ⅱ</span> Playing";
  miniPlay.textContent="Ⅱ";
});
audio.addEventListener("pause",()=>{
  playBtn.innerHTML="<span>▶</span> Play";
  miniPlay.textContent="▶";
});
audio.addEventListener("ended",()=>{miniPlay.textContent="▶";});

document.querySelectorAll(".filter").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active-filter"));
    btn.classList.add("active-filter");
  });
});
document.getElementById("menuBtn").addEventListener("click",()=>alert("Menu coming soon"));
