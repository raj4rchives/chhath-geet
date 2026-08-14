const songs=[
{t:"Uga Hai Suraj Dev",a:"Anuradha Paudwal",c:"Paramparik Geet",v:"8MzoVsjL4QU"},
{t:"Rovele Banjhiniya",a:"Akshara Singh",c:"New Chhath Geet",v:"REPLACE_ID_2"},
{t:"Jode Jode Falwa",a:"Pawan Singh",c:"New Chhath Geet",v:"REPLACE_ID_3"},
{t:"Chhath Ghate Chali",a:"Khesari Lal Yadav & Antra Singh Priyanka",c:"New Chhath Geet",v:"REPLACE_ID_4"},
{t:"Chahi Na Ann Dhan Khajanwa",a:"Arvind Akela Kallu",c:"Paramparik Geet",v:"REPLACE_ID_5"},
{t:"Chhath Mai Ke Baratiya",a:"Khesari Lal Yadav",c:"New Chhath Geet",v:"REPLACE_ID_6"},
{t:"Kaanch Hi Baans Ke Bahangiya",a:"Anuradha Paudwal",c:"Paramparik Geet",v:"REPLACE_ID_7"},
{t:"Kelwa Ke Paat Par",a:"Sharda Sinha",c:"Argh Songs",v:"REPLACE_ID_8"}];
let cat="All",cur=-1,player=null,ready=false,shuffle=false,repeat=false;
const list=document.querySelector("#songs"),$=id=>document.querySelector(id);
function render(){let q=$("#search").value.toLowerCase();let x=songs.filter(s=>(cat==="All"||s.c===cat)&&(`${s.t} ${s.a}`.toLowerCase().includes(q)));list.innerHTML=x.map(s=>{let i=songs.indexOf(s);let img=s.v.startsWith("REPLACE_")?"":`https://i.ytimg.com/vi/${s.v}/hqdefault.jpg`;return `<div class="song ${i==cur?"selected":""}"><span>${String(i+1).padStart(2,"0")}</span>${img?`<img class="cover" src="${img}">`:`<div class="cover" style="display:grid;place-items:center;font-size:28px">☀</div>`}<div class="info"><b>${s.t}</b><small>${s.a}</small></div><button class="heart">♡</button><button class="play" data-i="${i}">▶</button></div>`}).join("")||"<p>No geet found</p>"}
function fmt(sec){sec=Math.max(0,Math.floor(sec||0));return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`}
function initPlayer(){if(player)return;player=new YT.Player("yt",{height:"1",width:"1",playerVars:{autoplay:0,controls:0,rel:0,playsinline:1,modestbranding:1},events:{onReady:()=>{ready=true;player.setVolume(80)},onStateChange:onState}})}
function loadSong(i,autoplay=true){const s=songs[i];if(!s||s.v.startsWith("REPLACE_")){alert("Is song ka YouTube Video ID abhi add nahi hua.");return}cur=i;$("#title").firstChild.textContent=s.t;$("#artist").textContent=s.a;$("#coverIcon").style.backgroundImage=`url("https://i.ytimg.com/vi/${s.v}/hqdefault.jpg")`;$("#coverIcon").textContent="";render();if(ready){player.loadVideoById(s.v);if(!autoplay)player.pauseVideo()}$("#playPause").textContent=autoplay?"❚❚":"▶"}
function play(i){if(!ready){cur=i;return}loadSong(i,true)}
function onState(e){if(e.data===YT.PlayerState.PLAYING)$("#playPause").textContent="❚❚";if(e.data===YT.PlayerState.PAUSED)$("#playPause").textContent="▶";if(e.data===YT.PlayerState.ENDED){if(repeat){player.seekTo(0,true);player.playVideo()}else nextSong()}}
function nextSong(){let i=shuffle?Math.floor(Math.random()*songs.length):(cur+1)%songs.length;for(let n=0;n<songs.length&&songs[i].v.startsWith("REPLACE_");n++)i=(i+1)%songs.length;loadSong(i,true)}
function prevSong(){let i=(cur-1+songs.length)%songs.length;for(let n=0;n<songs.length&&songs[i].v.startsWith("REPLACE_");n++)i=(i-1+songs.length)%songs.length;loadSong(i,true)}
list.addEventListener("click",e=>{let b=e.target.closest(".play");if(b)play(+b.dataset.i)});
$("#search").oninput=render;document.querySelectorAll(".filters button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filters button").forEach(x=>x.classList.remove("active"));b.classList.add("active");cat=b.dataset.c;render()});
$("#open").onclick=()=>document.querySelector(".playlist").scrollIntoView({behavior:"smooth"});
$("#close").onclick=()=>{if(player)player.pauseVideo();document.querySelector(".player").classList.add("closed")};
$("#playPause").onclick=()=>{if(!ready)return;if(player.getPlayerState()===YT.PlayerState.PLAYING)player.pauseVideo();else{if(cur<0)loadSong(0,true);else player.playVideo()}};
$("#next").onclick=nextSong;$("#prev").onclick=prevSong;$("#shuffle").onclick=()=>{shuffle=!shuffle;$("#shuffle").classList.toggle("active",shuffle)};$("#repeat").onclick=()=>{repeat=!repeat;$("#repeat").classList.toggle("active",repeat)};
$("#mute").onclick=()=>{if(player.isMuted()){player.unMute();$("#mute").textContent="🔊"}else{player.mute();$("#mute").textContent="🔇"}};$("#volume").oninput=e=>{if(ready)player.setVolume(+e.target.value)};$("#seek").oninput=e=>{if(ready&&player.getDuration())player.seekTo(player.getDuration()*(+e.target.value/100),true)};
setInterval(()=>{if(!ready||!player||!player.getDuration())return;let d=player.getDuration(),t=player.getCurrentTime();$("#currentTime").textContent=fmt(t);$("#duration").textContent=fmt(d);$("#seek").value=t/d*100},500);
render();
const tag=document.createElement("script");tag.src="https://www.youtube.com/iframe_api";document.head.appendChild(tag);window.onYouTubeIframeAPIReady=initPlayer;