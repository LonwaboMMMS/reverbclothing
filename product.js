(() => {
"use strict";
const $=s=>document.querySelector(s),money=n=>"R"+Number(n).toLocaleString("en-ZA");
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const seed=[{id:1,name:"Reverb Essential Tee",type:"T-shirts",price:399,description:"A heavyweight everyday tee with a relaxed silhouette.",colors:[{name:"Black",hex:"#202020",sizes:{XS:0,S:4,M:8,L:7,XL:3,XXL:1}},{name:"Bone",hex:"#e7e0d2",sizes:{XS:1,S:3,M:6,L:5,XL:2,XXL:0}}]},{id:2,name:"Studio Hoodie",type:"Hoodies",price:899,description:"Comfort-first layering, built for cooler days.",colors:[{name:"Charcoal",hex:"#414141",sizes:{XS:0,S:2,M:4,L:4,XL:2,XXL:1}},{name:"Olive",hex:"#69705a",sizes:{XS:1,S:2,M:3,L:2,XL:0,XXL:0}}]},{id:3,name:"Utility Cargo",type:"Pants",price:749,description:"Utility pockets, clean lines and a comfortable fit.",colors:[{name:"Sand",hex:"#b9a68a",sizes:{XS:0,S:1,M:4,L:3,XL:2,XXL:0}}]},{id:4,name:"Everyday Cap",type:"Accessories",price:299,description:"A low-profile cap for daily wear.",colors:[{name:"Black",hex:"#202020",sizes:{XS:0,S:0,M:0,L:0,XL:0,XXL:0}}]}];
let products;try{products=JSON.parse(localStorage.getItem("reverbProducts"))||seed;}catch(e){products=seed;}
const p=products.find(x=>Number(x.id)===Number(new URLSearchParams(location.search).get("id")));
let colourIndex=0,size="",galleryIndex=0,cart=[];try{cart=JSON.parse(localStorage.getItem("reverbBag"))||[];}catch(e){cart=[];}
function saveCart(){localStorage.setItem("reverbBag",JSON.stringify(cart));$("#cartCount").textContent=cart.length;}
function renderBag(){
 const panel=$("#bagPanel"),content=$("#bagContent");
 if(!cart.length){content.innerHTML='<h2>Your bag is empty.</h2><p>Find something you love in the collection.</p>';}
 else{
  content.innerHTML='<h2>Your bag</h2>'+cart.map((item,i)=>'<div class="admin-row"><div class="bag-line"><span>'+esc(item.product.name)+' · '+esc(item.colour)+' · '+esc(item.size)+'</span><b>'+money(item.product.price)+'</b></div><button type="button" class="bag-remove" data-remove="'+i+'">Remove</button></div>').join("")+'<h3 class="bag-total">Total '+money(cart.reduce((sum,item)=>sum+Number(item.product.price||0),0))+'</h3><button class="action" id="bagCheckout" type="button">CHECKOUT</button>';
  content.querySelectorAll("[data-remove]").forEach(button=>button.addEventListener("click",()=>{cart.splice(Number(button.dataset.remove),1);saveCart();renderBag();}));
  $("#bagCheckout").addEventListener("click",()=>alert("Checkout/payment integration will be added later."));
 }
 panel.classList.add("open");panel.setAttribute("aria-hidden","false");
}
function closeBag(){const panel=$("#bagPanel");panel.classList.remove("open");panel.setAttribute("aria-hidden","true");}
function showToast(message){let toast=$("#siteToast");if(!toast){toast=document.createElement("div");toast.id="siteToast";toast.className="site-toast";toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");document.body.appendChild(toast);}toast.textContent=message;toast.classList.remove("visible");void toast.offsetWidth;toast.classList.add("visible");window.clearTimeout(showToast.timer);showToast.timer=window.setTimeout(()=>toast.classList.remove("visible"),2000);}
function render(){
 if(!p){$("#productRoot").innerHTML="<h1>Product not found</h1><p>This product may have been removed.</p>";return;}
 $("#crumbName").textContent=p.name.toUpperCase();
 const colours=p.colors||p.colours||[],imgs=p.images?.length?p.images:(p.image?[p.image]:[]);
 const gallery=imgs.length?'<img id="mainImage" src="'+esc(imgs[0])+'" alt="'+esc(p.name)+'">':'<div class="gallery-placeholder">R</div>';
 $("#productRoot").innerHTML='<div class="product-layout"><section><div class="gallery-main" id="galleryMain">'+gallery+'</div><div class="gallery-thumbs" id="galleryThumbs">'+imgs.map((src,i)=>'<button type="button" data-image="'+i+'" class="'+(i===0?'active':'')+'"><img src="'+esc(src)+'" alt="'+esc(p.name)+' image '+(i+1)+'"></button>').join("")+'</div></section><section class="product-details"><p class="eyebrow">'+esc(p.type)+'</p><h1>'+esc(p.name)+'</h1><div class="product-price">'+money(p.price)+'</div><p class="product-description">'+esc(p.description)+'</p><p>Colour</p><div class="detail-colors">'+colours.map((c,i)=>'<button type="button" data-colour="'+i+'" class="'+(i===0?'selected':'')+'"><span class="swatch" style="display:inline-block;background:'+esc(c.hex)+';vertical-align:middle"></span> '+esc(c.name)+'</button>').join("")+'</div><p>Size</p><div class="size-stock" id="sizes"></div><div id="purchaseArea"></div></section></div>';
 $("#galleryThumbs").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>setGallery(Number(b.dataset.image))));
 $("#galleryMain").addEventListener("touchstart",e=>{galleryTouchStart=e.touches[0].clientX;},{passive:true});
 $("#galleryMain").addEventListener("touchend",e=>{if(galleryTouchStart==null||imgs.length<2)return;const dx=e.changedTouches[0].clientX-galleryTouchStart;if(Math.abs(dx)>45)setGallery((galleryIndex+(dx<0?1:imgs.length-1))%imgs.length);galleryTouchStart=null;},{passive:true});
 document.querySelectorAll("[data-colour]").forEach(b=>b.addEventListener("click",()=>{colourIndex=Number(b.dataset.colour);size="";document.querySelectorAll("[data-colour]").forEach(x=>x.classList.toggle("selected",x===b));renderSizes();}));
 $("#cartCount").textContent=cart.length;renderSizes();$("#cartBtn").addEventListener("click",renderBag);$("#closeBag").addEventListener("click",closeBag);$("#bagPanel").addEventListener("click",e=>{if(e.target===$("#bagPanel"))closeBag();});
}
let galleryTouchStart=null;
function setGallery(index){const imgs=p.images?.length?p.images:(p.image?[p.image]:[]);if(!imgs.length)return;galleryIndex=index;$("#galleryMain").innerHTML='<img src="'+esc(imgs[index])+'" alt="'+esc(p.name)+'">';$("#galleryThumbs").querySelectorAll("button").forEach((b,i)=>b.classList.toggle("active",i===index));}
function renderSizes(){
 const colours=p.colors||p.colours||[],c=colours[colourIndex];$("#sizes").innerHTML=Object.keys(c?.sizes||{}).map(s=>'<button type="button" data-size="'+s+'" class="'+(size===s?'selected':'')+'">'+s+(Number(c.sizes[s])<1?' · Sold out':'')+'</button>').join("");
 $("#sizes").querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>{size=b.dataset.size;renderSizes();if(Number(c.sizes[size]||0)<1)showNotify(c,size);else{ $("#purchaseArea").innerHTML='<button class="action" id="addCart" type="button">ADD TO BAG</button>';$("#addCart").addEventListener("click",()=>{cart.push({product:{id:p.id,name:p.name,price:p.price},colour:c.name,size});saveCart();showToast("Added to bag");});}}));
}
function showNotify(c,s){$("#purchaseArea").innerHTML='<div class="notify-panel"><h3>Get notified when it is back</h3><p>'+esc(c.name)+' / '+esc(s)+' is sold out. Leave your details and we will notify you.</p><form id="restockForm"><input name="name" placeholder="Your name" required maxlength="100"><input name="contact" placeholder="Email address or mobile number" required maxlength="160"><button class="action" type="submit">NOTIFY ME</button><p id="notifyMessage" class="eyebrow" role="status"></p></form></div>';$("#restockForm").addEventListener("submit",async e=>{e.preventDefault();const fd=new FormData(e.target),msg=$("#notifyMessage"),btn=e.target.querySelector("button");btn.disabled=true;msg.textContent="Submitting…";try{const r=await fetch("/api/restock-requests",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId:p.id,productName:p.name,colour:c.name,size:s,name:String(fd.get("name")).trim(),contact:String(fd.get("contact")).trim()})});if(!r.ok)throw new Error();msg.textContent="Restock notifications are not active yet. Your details have not been saved.";btn.disabled=false;}catch(e){msg.textContent="Restock notifications are not active yet. Your details have not been saved.";btn.disabled=false;}});}
render();
})();