const menuToggle=document.getElementById("menuToggle"),navLinks=document.getElementById("navLinks");
menuToggle?.addEventListener("click",()=>navLinks.classList.toggle("open"));
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("open")));

const filters=document.querySelectorAll(".filter"),cards=document.querySelectorAll(".website-card"),search=document.getElementById("searchInput");
let activeFilter="all";
function filterCards(){const q=(search?.value||"").toLowerCase();cards.forEach(card=>{const okCat=activeFilter==="all"||card.dataset.cat===activeFilter;const okSearch=card.dataset.name.includes(q);card.style.display=okCat&&okSearch?"block":"none"})}
filters.forEach(f=>f.addEventListener("click",()=>{filters.forEach(x=>x.classList.remove("active"));f.classList.add("active");activeFilter=f.dataset.filter;filterCards()}));
search?.addEventListener("input",filterCards);

const modal=document.getElementById("briefModal"),toast=document.getElementById("toast"),success=document.getElementById("successMessage"),form=document.getElementById("briefForm");
function openModal(){modal.classList.add("show");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden"}
function closeModal(){modal.classList.remove("show");modal.setAttribute("aria-hidden","true");document.body.style.overflow=""}
["projectBtn","briefBtn","finalBrief"].forEach(id=>document.getElementById(id)?.addEventListener("click",openModal));
document.getElementById("modalClose")?.addEventListener("click",closeModal);
document.querySelector(".modal-backdrop")?.addEventListener("click",closeModal);
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal()});
form?.addEventListener("submit",e=>{e.preventDefault();success.style.display="block";form.reset();setTimeout(closeModal,2200)});

function showToast(msg){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2600)}
document.querySelectorAll(".view-btn,.login-btn,.signup-btn,.dev-card .btn,.faq-grid .btn").forEach(btn=>btn.addEventListener("click",e=>{
  if(btn.closest(".website-card")) showToast("Website details page is ready to connect to your product database.");
  else if(btn.classList.contains("login-btn")) showToast("Login screen can be connected to your authentication system.");
  else if(btn.classList.contains("signup-btn")) openModal();
  else showToast("This demo action is ready to connect to your backend.");
}));
document.querySelector(".announcement-close")?.addEventListener("click",e=>e.currentTarget.parentElement.remove());
