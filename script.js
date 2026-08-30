const STORAGE_KEY = "backlogTrackerDataV1";
let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const $ = id => document.getElementById(id);
const trackerList = $("trackerList"), emptyState = $("emptyState");

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

function render(){
  trackerList.innerHTML = "";
  let lectures=0, done=0;
  data.forEach((item,index)=>{
    lectures += item.total;
    done += item.done.filter(Boolean).length;
    const card=document.createElement("article");
    card.className="chapter-card";
    const boxes = item.done.map((v,i)=>`<button class="lecture-check ${v?'done':''}" data-i="${index}" data-l="${i}" title="Lecture ${i+1}"><span>${i+1}</span></button>`).join("");
    card.innerHTML=`
      <div class="chapter-top">
        <div>
          <div class="subject-tag">${escapeHTML(item.subject)}</div>
          <h3 class="chapter-name">${escapeHTML(item.chapter)}</h3>
          <div class="lecture-meta">${item.done.filter(Boolean).length} / ${item.total} lectures completed</div>
        </div>
        <button class="delete-btn" data-delete="${index}">Delete</button>
      </div>
      <div class="check-grid">${boxes}</div>`;
    trackerList.appendChild(card);
  });
  emptyState.style.display=data.length?"none":"block";
  const subjects=new Set(data.map(x=>x.subject.trim().toLowerCase())).size;
  $("subjectCount").textContent=subjects;
  $("chapterCount").textContent=data.length;
  $("lectureCount").textContent=lectures;
  $("pendingCount").textContent=lectures-done;
  $("doneCount").textContent=done;
}
function escapeHTML(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML;}

$("chapterForm").addEventListener("submit",e=>{
  e.preventDefault();
  const subject=$("subject").value.trim(), chapter=$("chapter").value.trim(), total=parseInt($("lectures").value);
  if(!subject||!chapter||!total||total<1)return;
  data.push({id:Date.now(),subject,chapter,total,done:Array(total).fill(false)});
  save(); render(); e.target.reset(); toast("Chapter added successfully");
});

trackerList.addEventListener("click",e=>{
  const b=e.target.closest(".lecture-check");
  const del=e.target.closest("[data-delete]");
  if(b){ const i=+b.dataset.i,l=+b.dataset.l; data[i].done[l]=!data[i].done[l]; save(); render(); }
  if(del){ const i=+del.dataset.delete; if(confirm("Delete this chapter?")){data.splice(i,1);save();render();toast("Chapter deleted");} }
});

$("scrollAdd").onclick=()=>$("addSection").scrollIntoView({behavior:"smooth"});
$("menuBtn").onclick=()=>{$("sideMenu").classList.add("open");$("overlay").classList.add("show");};
$("closeMenu").onclick=closeMenu;$("overlay").onclick=closeMenu;
function closeMenu(){$("sideMenu").classList.remove("open");$("overlay").classList.remove("show");}

$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify({app:"Backlog Tracker",version:1,data},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="backlog-tracker-backup.json";a.click();URL.revokeObjectURL(a.href);toast("Backup exported");
};
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").addEventListener("change",e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(reader.result);
      const incoming=Array.isArray(parsed)?parsed:parsed.data;
      if(!Array.isArray(incoming))throw new Error();
      data=incoming.map(x=>({id:x.id||Date.now()+Math.random(),subject:String(x.subject||"Subject"),chapter:String(x.chapter||"Chapter"),total:Number(x.total)||0,done:Array.isArray(x.done)?x.done:Array(Number(x.total)||0).fill(false)})).filter(x=>x.total>0);
      save();render();toast("Data imported successfully");
    }catch{toast("Invalid backup file");}
  };reader.readAsText(file);e.target.value="";
});
$("clearBtn").onclick=()=>{if(confirm("Delete all backlog data?")){data=[];save();render();closeMenu();toast("All data cleared");}};

async function downloadPDF(){
  if(!data.length){toast("Add at least one chapter first");return;}
  if(!window.jspdf){toast("PDF library failed to load. Check internet.");return;}
  const { jsPDF }=window.jspdf;
  const doc=new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const margin=14, width=210-margin*2;
  let y=18;
  doc.setFillColor(99,89,202);doc.roundedRect(margin,y-8,width,22,5,5,"F");
  doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(20);doc.text("BACKLOG TRACKER",margin+7,y+1);
  doc.setFontSize(8);doc.setFont("helvetica","normal");doc.text("PRINTABLE STUDY CHECKLIST",margin+7,y+8);
  y+=28;
  const total=data.reduce((s,x)=>s+x.total,0), completed=data.reduce((s,x)=>s+x.done.filter(Boolean).length,0);
  doc.setTextColor(50,54,70);doc.setFontSize(9);doc.text(`Total Chapters: ${data.length}    Total Lectures: ${total}    Completed: ${completed}`,margin,y);y+=8;

  data.forEach((item,idx)=>{
    const rows=Math.ceil(item.total/8), block=25+rows*11;
    if(y+block>282){doc.addPage();y=18;}
    doc.setFillColor(246,246,250);doc.roundedRect(margin,y,width,block,4,4,"F");
    doc.setTextColor(92,84,184);doc.setFont("helvetica","bold");doc.setFontSize(8);doc.text(item.subject.toUpperCase(),margin+5,y+7);
    doc.setTextColor(35,39,55);doc.setFontSize(14);doc.text(item.chapter,margin+5,y+14);
    doc.setFont("helvetica","normal");doc.setFontSize(8);doc.setTextColor(100,105,120);doc.text(`Total Lectures: ${item.total}`,margin+5,y+20);
    let bx=margin+5, by=y+26;
    for(let i=0;i<item.total;i++){
      if(i>0 && i%8===0){bx=margin+5;by+=10;}
      doc.setDrawColor(110,112,125);doc.rect(bx,by,5,5);
      doc.setTextColor(60,64,78);doc.setFontSize(7);doc.text(String(i+1),bx+7,by+4);
      bx+=20;
    }
    y+=block+6;
  });
  const pages=doc.internal.getNumberOfPages();
  for(let p=1;p<=pages;p++){doc.setPage(p);doc.setFontSize(7);doc.setTextColor(130,132,145);doc.text(`Backlog Tracker • Page ${p} of ${pages}`,105,290,{align:"center"});}
  doc.save("backlog-tracker.pdf");
  toast("PDF downloaded");
}
$("pdfBtn").onclick=downloadPDF;$("pdfBtn2").onclick=downloadPDF;
render();
