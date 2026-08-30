(() => {
"use strict";
const KEY="jeetrack_syllabus_theme_v1";
const COLS=[
["number","Number"],["lectures","Lecture Tracker"],["total","Total Lec"],
["mains","Mains Level"],["advanced","Advanced Level"],["notes","Short Notes"],
["dpp","DPP"],["hw","Homework"],["module","Module"],["pyq","PYQ"],["test","Test"],
["r1","Revision 1"],["r2","Revision 2"],["r3","Revision 3"]
];
let state=JSON.parse(localStorage.getItem(KEY)||"null")||{selected:COLS.map(x=>x[0]),chapters:[]};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function persist(){localStorage.setItem(KEY,JSON.stringify(state))}
function toast(x){let t=$("toast");if(!t){t=document.createElement("div");t.id="toast";document.body.appendChild(t)}t.textContent=x;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1500)}
function columns(){
 $("columns").innerHTML=COLS.map(([k,n])=>`<label class="col"><input type="checkbox" data-col="${k}" ${state.selected.includes(k)?"checked":""}>${n}</label>`).join("");
 document.querySelectorAll("[data-col]").forEach(x=>x.onchange=()=>{state.selected=[...document.querySelectorAll("[data-col]:checked")].map(x=>x.dataset.col);persist();preview()});
}
function list(){
 let out="";
 ["Physics","Chemistry","Mathematics"].forEach(s=>{
  let a=state.chapters.filter(c=>c.subject===s);if(!a.length)return;
  out+=`<div class="subject-card"><h3>${s}</h3><div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Chapter Name</th><th>Total Lectures</th><th>Action</th></tr></thead><tbody>`;
  a.forEach((c,i)=>out+=`<tr><td>${i+1}</td><td>${esc(c.name)}</td><td>${c.total}</td><td><button class="delete" data-del="${c.id}">Delete</button></td></tr>`);
  out+="</tbody></table></div></div>";
 });
 $("chapterList").innerHTML=out||'<div class="panel" style="text-align:center;color:#777">No chapters added yet.</div>';
 document.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{state.chapters=state.chapters.filter(c=>c.id!==b.dataset.del);persist();list();preview();stats()});
}
function preview(){
 let selected=COLS.filter(c=>state.selected.includes(c[0]));
 let h="<table class='preview-table'><thead><tr><th>Chapter Name</th>"+selected.map(c=>`<th>${c[1]}</th>`).join("")+"</tr></thead><tbody>";
 state.chapters.forEach((c,i)=>{
  h+=`<tr><td>${esc(c.name)}</td>`;
  selected.forEach(([k])=>{
   if(k==="number")h+=`<td>${i+1}</td>`;
   else if(k==="total")h+=`<td>${c.total}</td>`;
   else if(k==="lectures"){let s="<td style='text-align:left'>";for(let n=1;n<=c.total;n++)s+=`<span class='lec'><span class='box'></span>Lec ${n}</span>`;h+=s+"</td>"}
   else h+="<td><span class='box'></span></td>";
  });h+="</tr>";
 });
 if(!state.chapters.length)h+=`<tr><td colspan='${selected.length+1}'>Add chapters to preview.</td></tr>`;
 $("preview").innerHTML=h+"</tbody></table>";
}
function stats(){
 $("chapterStat").textContent=state.chapters.length;
 $("lectureStat").textContent=state.chapters.reduce((n,c)=>n+c.total,0);
}
$("add").onclick=()=>{
 let subject=$("subject").value,name=$("chapter").value.trim(),total=+$("lectures").value;
 if(!name||!Number.isInteger(total)||total<1){alert("Chapter name और Total Lectures भरो.");return}
 state.chapters.push({id:"c_"+Date.now()+"_"+Math.random().toString(36).slice(2),subject,name,total});
 $("chapter").value="";$("lectures").value="";persist();list();preview();stats();$("chapter").focus();
};
$("save").onclick=()=>{persist();toast("Tracker saved")};
$("clear").onclick=()=>{if(confirm("Clear complete syllabus?")){state.chapters=[];persist();list();preview();stats()}};
$("allCols").onclick=()=>{state.selected=COLS.map(x=>x[0]);columns();persist();preview()};
$("chapter").onkeydown=e=>{if(e.key==="Enter")$("add").click()};
columns();list();preview();stats();

async function pdf(){
 if(!state.chapters.length){alert("Add at least one chapter.");return}
 if(!state.selected.length){alert("Select at least one column.");return}
 const JsPDF=window.jspdf?.jsPDF;if(!JsPDF){alert("PDF library load नहीं हुई.");return}
 const doc=new JsPDF({orientation:"landscape",unit:"mm",format:"a4",compress:true});
 const W=297,H=210,M=7;
 const cols=[["chapter","Chapter Name"],...COLS.filter(c=>state.selected.includes(c[0]))];
 const base={chapter:43,number:9,lectures:68,total:13,mains:16,advanced:18,notes:18,dpp:12,hw:12,module:15,pyq:12,test:12,r1:12,r2:12,r3:12};
 let widths=cols.map(c=>base[c[0]]||13), max=W-2*M, sum=widths.reduce((a,b)=>a+b,0);
 if(sum>max){let sc=max/sum;widths=widths.map(w=>w*sc)}
 let y=M;
 function header(subject){
  doc.setFont("helvetica","bold");doc.setFontSize(15);doc.text("JEE SYLLABUS TRACKER",M,y+5);
  doc.setFontSize(9);doc.text(subject.toUpperCase(),M,y+11);y+=15;
  let x=M;doc.setFontSize(6.3);
  cols.forEach(([k,n],i)=>{doc.setFillColor(238,239,244);doc.rect(x,y,widths[i],16,"FD");doc.text(doc.splitTextToSize(n,widths[i]-2),x+widths[i]/2,y+5,{align:"center"});x+=widths[i]});y+=16;
 }
 function newPage(subject){doc.addPage();y=M;header(subject)}
 function rows(chapters,start){
  for(let r=0;r<chapters.length;r++){
   let c=chapters[r],li=cols.findIndex(x=>x[0]==="lectures"), lines=Math.ceil(c.total/5),rh=Math.max(17,lines*7+2);
   if(y+rh>H-10)newPage(c.subject);
   let x=M;
   cols.forEach(([k],i)=>{
    doc.setFillColor(255,255,255);doc.rect(x,y,widths[i],rh,"S");
    if(k==="chapter"){doc.setFont("helvetica","bold");doc.setFontSize(8.5);doc.text(doc.splitTextToSize(c.name,widths[i]-4),x+2,y+rh/2)}
    else if(k==="number"){doc.setFontSize(8);doc.text(String(start+r+1),x+widths[i]/2,y+rh/2+2,{align:"center"})}
    else if(k==="total"){doc.setFontSize(8);doc.text(String(c.total),x+widths[i]/2,y+rh/2+2,{align:"center"})}
    else if(k==="lectures"){
      doc.setFont("helvetica","normal");doc.setFontSize(c.total>30?5.2:6);
      let step=Math.min(13,(widths[i]-3)/5),b=4;
      for(let n=0;n<c.total;n++){let row=Math.floor(n/5),pos=n%5,xx=x+1.5+pos*step,yy=y+1+row*7;doc.rect(xx,yy,b,b);doc.text("Lec "+(n+1),xx+4.7,yy+3)}
    }else{let b=4.8;doc.rect(x+(widths[i]-b)/2,y+(rh-b)/2,b,b)}
    x+=widths[i];
   });y+=rh;
  }
 }
 let first=true;
 ["Physics","Chemistry","Mathematics"].forEach(subject=>{
  let a=state.chapters.filter(c=>c.subject===subject);if(!a.length)return;
  if(!first)newPage(subject);else{header(subject);first=false}
  rows(a,0);
 });
 for(let p=1;p<=doc.getNumberOfPages();p++){doc.setPage(p);doc.setFontSize(6.5);doc.text(`JEETrack • Page ${p}/${doc.getNumberOfPages()}`,W-M,H-4,{align:"right"})}
 doc.save("JEETrack-Syllabus-A4.pdf");toast("PDF downloaded");
}
$("pdf").onclick=pdf;
})();