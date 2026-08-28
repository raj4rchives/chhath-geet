function toggleMenu(){document.getElementById("nav").classList.toggle("open")}
function updatePlan(){
  const n=Number(document.getElementById("orders").value);
  let name="PLAN A", price=9;
  if(n>25000){name="PLAN B";price=19}
  if(n>50000){name="PLAN C";price=35}
  if(n>100000){name="PLAN D";price=49}
  if(n>175000){name="PLAN E";price=65}
  if(n>225000){name="PLAN F";price=75}
  document.getElementById("planName").textContent=name;
  document.getElementById("price").textContent=price;
  document.getElementById("ordersText").textContent=n.toLocaleString();
}
function submitForm(e){
  e.preventDefault();
  alert("Thanks! Your enquiry has been received. Connect this form to your email/WhatsApp backend before going live.");
}
updatePlan();
