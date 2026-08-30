(() => {
"use strict";

const KEY="jee_syllabus_tracker_v2";
const COLS=[
 ["number","Number"],["lectures","Lecture Tracker"],["mains","Mains Level"],
 ["advanced","Advanced Level"],["notes","Short Notes"],["dpp","DPP"],
 ["hw","Homework"],["module","Module"],["pyq","PYQ"],["test","Test"],
 ["r1","Revision 1"],["r2","Revision 2"],["r3","Revision 3"]
];

let state=load();

function load(){
 try{
  const x=JSON.parse(localStorage.getItem(KEY));
  if(x) return x;
 }catch(e){}
 return {
  title:"JEE SYLLABUS TRACKER",
  subject:"PHYSICS",
  selected:COLS.map(x=>x[0]),
  chapters:[]
 };
}

function esc(s){
 return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}

function renderColumns(){
 document.getElementById("columns").innerHTML=COLS.map(([k,n])=>`
  <label class="col">
   <input type="checkbox" data-col="${k}" ${state.selected.includes(k)?"checked":""}>
   <span>${n}</span>
  </label>`).join("");
 document.querySelectorAll("[data-col]").forEach(x=>x.onchange=()=>{
  state.selected=[...document.querySelectorAll("[data-col]:checked")].map(x=>x.dataset.col);
  renderPreview();
 });
}

function renderChapters(){
 const box=document.getElementById("chapters");
 if(!state.chapters.length){
  box.innerHTML='<p class="muted" style="padding:18px 0">No chapters added yet.</p>';
  return;
 }
 box.innerHTML=state.chapters.map((c,i)=>`
  <div class="chapter">
   <div><small>CHAPTER ${i+1}</small>
    <input data-name="${i}" value="${esc(c.name)}" placeholder="Chapter name">
   </div>
   <div><label>Total Lec</label>
    <input type="number" min="1" max="200" data-lec="${i}" value="${Math.max(1,Number(c.lectures)||1)}">
   </div>
   <button class="danger remove" data-remove="${i}">×</button>
  </div>`).join("");

 document.querySelectorAll("[data-name]").forEach(x=>x.oninput=()=>{
  state.chapters[+x.dataset.name].name=x.value; renderPreview();
 });
 document.querySelectorAll("[data-lec]").forEach(x=>x.oninput=()=>{
  state.chapters[+x.dataset.lec].lectures=Math.max(1,Math.min(200,+x.value||1)); renderPreview();
 });
 document.querySelectorAll("[data-remove]").forEach(x=>x.onclick=()=>{
  state.chapters.splice(+x.dataset.remove,1); renderChapters(); renderPreview();
 });
}

function renderPreview(){
 const selected=COLS.filter(x=>state.selected.includes(x[0]));
 let html="<table><thead><tr><th>Chapter Name</th>";
 selected.forEach(x=>html+=`<th>${x[1]}</th>`);
 html+="</tr></thead><tbody>";

 state.chapters.forEach((c,i)=>{
  html+=`<tr><td class="chapter-name">${esc(c.name)}</td>`;
  selected.forEach(([k])=>{
   if(k==="number") html+=`<td>${i+1}</td>`;
   else if(k==="lectures"){
    html+="<td style='text-align:left'>";
    for(let n=1;n<=Math.max(1,+c.lectures||1);n++)
      html+=`<span class="lecture"><span class="box"></span>Lec ${n}</span>`;
    html+="</td>";
   }else html+='<td><span class="box"></span></td>';
  });
  html+="</tr>";
 });
 if(!state.chapters.length) html+=`<tr><td colspan="${selected.length+1}">Add chapters to see the preview.</td></tr>`;
 html+="</tbody></table>";
 document.getElementById("preview").innerHTML=html;
}

function save(){
 state.title=document.getElementById("title").value.trim()||"JEE SYLLABUS TRACKER";
 state.subject=document.getElementById("subject").value;
 state.selected=[...document.querySelectorAll("[data-col]:checked")].map(x=>x.dataset.col);
 localStorage.setItem(KEY,JSON.stringify(state));
 toast("Tracker saved");
}

function toast(s){
 const t=document.getElementById("toast"); t.textContent=s; t.classList.add("show");
 setTimeout(()=>t.classList.remove("show"),1600);
}

document.getElementById("title").value=state.title;
document.getElementById("subject").value=state.subject;
renderColumns(); renderChapters(); renderPreview();

document.getElementById("addChapter").onclick=()=>{
 state.chapters.push({name:"",lectures:1}); renderChapters(); renderPreview();
 const a=document.querySelectorAll("[data-name]"); a[a.length-1]?.focus();
};
document.getElementById("save").onclick=save;
document.getElementById("clear").onclick=()=>{
 if(confirm("Delete all chapters?")){
  state.chapters=[]; localStorage.setItem(KEY,JSON.stringify(state)); renderChapters(); renderPreview();
 }
};
document.getElementById("download").onclick=makePDF;

async function getJsPDF(){
 if(window.jspdf?.jsPDF) return window.jspdf.jsPDF;
 await new Promise((resolve,reject)=>{
  const s=document.createElement("script");
  s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  s.onload=resolve; s.onerror=reject; document.head.appendChild(s);
 });
 return window.jspdf.jsPDF;
}

async function makePDF(){
 save();
 if(!state.chapters.length){alert("Add at least one chapter.");return}
 if(!state.selected.length){alert("Select at least one column.");return}

 try{
  const JsPDF=await getJsPDF();
  const doc=new JsPDF({orientation:"landscape",unit:"mm",format:"a4",compress:true});
  const W=297,H=210,M=8;
  const selected=COLS.filter(x=>state.selected.includes(x[0]));
  const cols=[["chapter","Chapter Name"],...selected];

  const base={
   chapter:48,number:10,lectures:64,mains:17,advanced:20,notes:18,
   dpp:13,hw:14,module:16,pyq:13,test:13,r1:13,r2:13,r3:13
  };
  let widths=cols.map(x=>base[x[0]]||14);
  let total=widths.reduce((a,b)=>a+b,0);

  if(total>W-2*M){
   const scale=(W-2*M)/total;
   widths=widths.map((v,i)=>{
    const k=cols[i][0], min=k==="chapter"?35:k==="lectures"?45:8.5;
    return Math.max(min,v*scale);
   });
   let over=widths.reduce((a,b)=>a+b,0)-(W-2*M);
   for(let i=0;i<widths.length&&over>0;i++){
    if(cols[i][0]==="chapter"||cols[i][0]==="lectures") continue;
    const cut=Math.min(over,Math.max(0,widths[i]-8.5));
    widths[i]-=cut; over-=cut;
   }
  }

  let y=M;

  function title(){
   doc.setFont("helvetica","bold");doc.setFontSize(15);
   doc.text(state.title||"JEE SYLLABUS TRACKER",M,y+5);
   doc.setFontSize(9);doc.text(state.subject,M,y+11);y+=15;
  }

  function tableHead(){
   const hh=16;let x=M;
   doc.setFont("helvetica","bold");doc.setFontSize(6.5);
   cols.forEach(([k,n],i)=>{
    doc.setFillColor(238,239,244);doc.rect(x,y,widths[i],hh,"FD");
    const lines=doc.splitTextToSize(n,widths[i]-2);
    doc.text(lines,x+widths[i]/2,y+5,{align:"center"});
    x+=widths[i];
   });
   y+=hh;
  }

  function page(){
   doc.addPage();y=M;title();tableHead();
  }

  title();tableHead();

  state.chapters.forEach((c,idx)=>{
   const totalL=Math.max(1,Math.min(200,+c.lectures||1));
   const li=cols.findIndex(x=>x[0]==="lectures");
   let lectureLines=[];
   if(li>=0){
    const font=totalL>30?5.8:totalL>18?6.3:7;
    doc.setFontSize(font);
    let line="";
    for(let n=1;n<=totalL;n++){
     const item=`□ Lec ${n}`;
     const test=line?line+"   "+item:item;
     if(doc.getTextWidth(test)>widths[li]-3){lectureLines.push(line);line=item}
     else line=test;
    }
    if(line)lectureLines.push(line);
   }
   const rowH=Math.max(17,li>=0?7+lectureLines.length*4.5:17);
   if(y+rowH>H-10) page();

   let x=M;
   cols.forEach(([k],i)=>{
    doc.setFillColor(255,255,255);doc.rect(x,y,widths[i],rowH,"S");
    if(k==="chapter"){
     doc.setFont("helvetica","bold");doc.setFontSize(8.2);
     const lines=doc.splitTextToSize(c.name||`Chapter ${idx+1}`,widths[i]-4);
     doc.text(lines,x+2,y+rowH/2-(lines.length-1)*2);
    }else if(k==="number"){
     doc.setFont("helvetica","normal");doc.setFontSize(8);
     doc.text(String(idx+1),x+widths[i]/2,y+rowH/2+2.5,{align:"center"});
    }else if(k==="lectures"){
     doc.setFont("helvetica","normal");doc.setFontSize(totalL>30?5.8:totalL>18?6.3:7);
     lectureLines.forEach((line,j)=>doc.text(line,x+2,y+5+j*4.5));
    }else{
     const b=Math.min(5.5,widths[i]-4,rowH-6);
     doc.rect(x+(widths[i]-b)/2,y+(rowH-b)/2,b,b);
    }
    x+=widths[i];
   });
   y+=rowH;
  });

  const pages=doc.getNumberOfPages();
  for(let p=1;p<=pages;p++){
   doc.setPage(p);doc.setFont("helvetica","normal");doc.setFontSize(6.5);
   doc.text(`JEE Syllabus Tracker • ${state.subject} • Page ${p}/${pages}`,W-M,H-4,{align:"right"});
  }

  const name=(state.subject||"JEE").replace(/[^a-z0-9]+/gi,"_");
  doc.save(`${name}_Syllabus_Tracker.pdf`);
  toast("PDF downloaded");
 }catch(e){
  console.error(e);
  alert("PDF library load नहीं हो पाई. Internet on करके फिर try करो.");
 }
}
})();