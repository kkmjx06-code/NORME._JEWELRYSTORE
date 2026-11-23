// NORME. storefront — member authentication and profile are managed by Supabase.
const products = [
 {id:1,name:"FORM RING",category:"Ring",price:189000,stock:30,description:"유기적인 곡선과 볼륨감이 조화를 이루는 조형적인 실버 링.",material:"925 Sterling Silver",image:"img/product-1.jpg"},
 {id:2,name:"LINE RING",category:"Ring",price:139000,stock:25,description:"서로 교차하는 라인이 손끝에 섬세한 균형을 더합니다.",material:"925 Sterling Silver",image:"img/product-2.jpg"},
 {id:3,name:"SIGNET RING",category:"Ring",price:199000,stock:20,description:"절제된 원형 플레이트와 매끈한 밴드가 돋보이는 시그넷 링.",material:"925 Sterling Silver",image:"img/product-3.jpg"},
 {id:4,name:"AXIS NECKLACE",category:"Necklace",price:179000,stock:15,description:"수직으로 떨어지는 펜던트가 목선을 간결하게 완성합니다.",material:"925 Sterling Silver",image:"img/product-4.jpg"},
 {id:5,name:"LINK NECKLACE",category:"Necklace",price:249000,stock:18,description:"리듬감 있는 링크 체인으로 완성한 존재감 있는 네크리스.",material:"925 Sterling Silver",image:"img/product-5.jpg"},
 {id:6,name:"TRACE BRACELET",category:"Bracelet",price:149000,stock:25,description:"가벼운 링크 실루엣으로 매일 착용하기 좋은 브레이슬릿.",material:"925 Sterling Silver",image:"img/product-6.jpg"},
 {id:7,name:"CURVE CUFF",category:"Bracelet",price:229000,stock:12,description:"부드러운 물결 곡선이 손목에 조형적인 포인트를 더합니다.",material:"925 Sterling Silver",image:"img/product-7.jpg"},
 {id:8,name:"OBJECT BRACELET",category:"Bracelet",price:159000,stock:20,description:"중앙 오브제와 섬세한 체인이 조화를 이루는 디자인.",material:"925 Sterling Silver",image:"img/product-8.jpg"}
];
const $ = s => document.querySelector(s);
const money = n => "₩"+Number(n||0).toLocaleString("ko-KR");
const readCart = () => { try { return JSON.parse(localStorage.getItem("norme_cart")||"[]"); } catch { return []; } };
const writeCart = () => localStorage.setItem("norme_cart",JSON.stringify(cart));
let currentUser=null, profile=null, cart=readCart();
let activeCategory="All", activeSlide=0, slideTimer;

function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2600)}
function authErrorMessage(error){
 const m=(error?.message||"").toLowerCase();
 if(m.includes("already registered")||m.includes("user already registered")) return "이미 가입된 이메일입니다. 로그인해 주세요.";
 if(m.includes("invalid login credentials")) return "이메일 또는 비밀번호가 올바르지 않습니다.";
 if(m.includes("email not confirmed")) return "이메일 인증을 완료한 뒤 로그인해 주세요.";
 if(m.includes("password")&&(m.includes("6")||m.includes("characters"))) return "비밀번호는 6자 이상 입력해 주세요.";
 if(m.includes("rate limit")) return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
 if(m.includes("failed to fetch")) return "서버에 연결할 수 없습니다. 인터넷과 Supabase 설정을 확인해 주세요.";
 return error?.message || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
function updateMemberMenu(){
 const el=$("#memberMenu"); if(!el)return;
 el.textContent=currentUser ? `${profile?.name || currentUser.email} 님 · 로그아웃` : "로그인 · 회원가입";
}
async function loadProfile(){
 if(!currentUser){profile=null;updateMemberMenu();return null}
 const {data,error}=await db.from("shop_profiles")
   .select("id,email,name,phone,grade,points,role,created_at")
   .eq("id",currentUser.id).single();
 if(error){console.error(error.message);toast("회원 정보를 불러오지 못했습니다: "+error.message);profile=null}
 else profile=data;
 updateMemberMenu(); return profile;
}
async function initializeAuth(){
 const {data,error}=await db.auth.getSession();
 if(error){console.error(error.message);toast(authErrorMessage(error));return}
 currentUser=data.session?.user||null;
 if(currentUser) await loadProfile(); else {profile=null;updateMemberMenu()}
}
function renderProducts(){
 const q=$("#searchInput").value.trim().toLowerCase(),sort=$("#sortSelect").value;
 let list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&p.name.toLowerCase().includes(q));
 if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);
 $("#productGrid").innerHTML=list.map(p=>`<article class="product-card" data-id="${p.id}"><div class="product-image"><img loading="lazy" src="${p.image}" alt="${p.name} 착용 및 제품 사진"><span class="product-tag">925 SILVER</span></div><div class="product-info"><h3>${p.name}</h3><p>${money(p.price)}</p></div></article>`).join("")||"<p>상품이 없습니다.</p>";
}
function setSlide(n){const slides=[...document.querySelectorAll(".hero-slide")],dots=[...document.querySelectorAll("#heroDots button")];activeSlide=n%slides.length;slides.forEach((s,i)=>s.classList.toggle("active",i===activeSlide));dots.forEach((d,i)=>d.classList.toggle("active",i===activeSlide));$(".hero-bottom span").textContent=String(activeSlide+1).padStart(2,"0")+" / 04"}
function startSlides(){clearInterval(slideTimer);slideTimer=setInterval(()=>setSlide(activeSlide+1),6000)}
function showOverlay(){$("#overlay").classList.add("show")}
function closeAll(){document.querySelectorAll(".drawer.open,.modal.open").forEach(x=>x.classList.remove("open"));$("#overlay").classList.remove("show")}
function openModal(id){showOverlay();$(id).classList.add("open")}
function addToCart(id){let p=products.find(x=>x.id===id),item=cart.find(x=>x.id===id);if(!p||p.stock<1)return toast("품절 상품입니다.");if(item){if(item.qty>=p.stock)return toast("재고 수량을 초과할 수 없습니다.");item.qty++}else cart.push({id,qty:1});writeCart();renderCart();toast("장바구니에 담았습니다.")}
function renderCart(){
 $("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
 $("#cartItems").innerHTML=cart.length?cart.map(c=>{let p=products.find(x=>x.id===c.id);if(!p)return "";return `<div class="cart-row"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${money(p.price)}</p><div class="qty-control"><button data-qty="${p.id}" data-delta="-1">−</button><span>${c.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove-btn" data-remove="${p.id}">삭제</button></div>`}).join(""):"<p class='fine-print'>장바구니가 비어 있습니다.</p>";
 $("#cartTotal").textContent=money(cart.reduce((s,c)=>s+(products.find(p=>p.id===c.id)?.price||0)*c.qty,0));
}
function openProduct(id){let p=products.find(x=>x.id===id);if(!p)return;$("#productDetail").innerHTML=`<div class="detail-layout"><img src="${p.image}" alt="${p.name} 모델 착용 및 제품 디테일"><div class="detail-copy"><p class="eyebrow">${p.category.toUpperCase()} / COLLECTION 001</p><h2>${p.name}</h2><p class="price">${money(p.price)}</p><p>${p.description}</p><p>${p.material}</p><p class="fine-print">이미지는 브랜드 콘셉트 시안이며, 실제 판매 시 제품 사양과 소재를 확인해 주세요.</p><label for="detailQty">수량</label><select id="detailQty"><option>1</option><option>2</option><option>3</option></select><button class="primary-btn" id="detailAdd" data-id="${id}">ADD TO BAG</button></div></div>`;openModal("#productModal")}
function accountView(mode="login"){
 if(currentUser&&profile){
  $("#accountContent").innerHTML=`<div class="form-panel"><p class="eyebrow">MY NORME.</p><h2>MY ACCOUNT</h2>
  <div class="member-summary">${profile.name||"회원"}님, 반갑습니다.<br>EMAIL : <b>${profile.email}</b><br>GRADE : <b>${profile.grade}</b><br>POINT : <b>${Number(profile.points).toLocaleString()} P</b></div>
  <div class="order-history"><h3>MY ORDERS</h3><div id="myOrders"><p class="fine-print">주문 내역을 불러오는 중입니다.</p></div></div>
  <h3>PROFILE EDIT</h3><form id="profileForm"><div class="form-field"><label>이름</label><input name="name" value="${escapeHtml(profile.name||"")}" required></div><div class="form-field"><label>연락처</label><input name="phone" value="${escapeHtml(profile.phone||"")}" placeholder="연락처"></div><button class="primary-btn">회원 정보 저장</button></form>
  <button class="form-switch" id="logoutBtn">로그아웃</button></div>`;
  return;
 }
 $("#accountContent").innerHTML=mode==="signup"
 ? `<div class="form-panel"><p class="eyebrow">JOIN NORME.</p><h2>CREATE ACCOUNT</h2><p>가입 축하 포인트 3,000P를 드립니다.</p><form id="signupForm"><div class="form-field"><label>이름</label><input name="name" autocomplete="name" required></div><div class="form-field"><label>연락처</label><input name="phone" type="tel" autocomplete="tel" required></div><div class="form-field"><label>이메일</label><input name="email" type="email" autocomplete="email" required></div><div class="form-field"><label>비밀번호 (6자 이상)</label><input name="password" type="password" minlength="6" autocomplete="new-password" required></div><button class="primary-btn">회원가입</button></form><button class="form-switch" id="toLogin">이미 회원이신가요? 로그인</button></div>`
 : `<div class="form-panel"><p class="eyebrow">WELCOME BACK</p><h2>LOGIN</h2><form id="loginForm"><div class="form-field"><label>이메일</label><input name="email" type="email" autocomplete="email" required></div><div class="form-field"><label>비밀번호</label><input name="password" type="password" autocomplete="current-password" required></div><button class="primary-btn">로그인</button></form><button class="form-switch" id="toSignup">처음 방문하셨나요? 회원가입</button></div>`;
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
async function loadMyOrders(){
 const target=$("#myOrders");if(!target||!currentUser)return;
 const {data:orders,error}=await db.from("shop_orders")
  .select("id,total,status,created_at").eq("user_id",currentUser.id)
  .order("created_at",{ascending:false});
 if(error){target.innerHTML=`<p class="fine-print">주문 내역을 불러오지 못했습니다: ${escapeHtml(error.message)}</p>`;return}
 if(!orders?.length){target.innerHTML="<p class='fine-print'>아직 주문 내역이 없습니다.</p>";return}
 const ids=orders.map(o=>o.id);
 const {data:allItems,error:itemError}=await db.from("shop_order_items")
  .select("order_id,product_id,qty,unit_price").in("order_id",ids);
 if(itemError){target.innerHTML=`<p class="fine-print">주문 상품을 불러오지 못했습니다: ${escapeHtml(itemError.message)}</p>`;return}
 const productIds=[...new Set((allItems||[]).map(i=>i.product_id))];
 const {data:dbProducts,error:productsError}=productIds.length
  ? await db.from("shop_products").select("id,name").in("id",productIds)
  : {data:[],error:null};
 if(productsError){target.innerHTML=`<p class="fine-print">상품명을 불러오지 못했습니다: ${escapeHtml(productsError.message)}</p>`;return}
 const names=new Map((dbProducts||[]).map(p=>[p.id,p.name]));
 target.innerHTML=orders.map(o=>{
  const items=(allItems||[]).filter(i=>i.order_id===o.id);
  const date=o.created_at?new Date(o.created_at).toLocaleString("ko-KR"):"-";
  const itemHtml=items.map(i=>`<li>${escapeHtml(names.get(i.product_id)||"상품")} × ${i.qty}개</li>`).join("");
  return `<article class="order-card"><div><b>주문 번호 #${o.id}</b><span>${escapeHtml(date)}</span></div><p>합계 <b>${money(o.total)}</b> · 상태 <b>${escapeHtml(o.status||"")}</b></p><ul>${itemHtml||"<li>주문 상품 정보 없음</li>"}</ul></article>`;
 }).join("");
}
async function showAccount(mode="login"){
 if(currentUser) await loadProfile();
 if(currentUser&&!profile){toast("회원 정보를 확인할 수 없습니다.");return}
 accountView(mode);openModal("#accountModal");
 if(currentUser) await loadMyOrders();
}
async function checkout(){
 if(!currentUser){
  closeAll();await showAccount("login");toast("체험 결제 전 로그인이 필요합니다.");return;
 }
 if(!cart.length)return toast("장바구니가 비어 있습니다.");

 // Merge duplicate cart entries before calculating and inserting order lines.
 const merged=new Map();
 for(const item of cart){
  const id=Number(item.id),qty=Number(item.qty)||0;
  if(qty>0)merged.set(id,(merged.get(id)||0)+qty);
 }
 const lines=[...merged.entries()].map(([id,qty])=>({product:products.find(p=>p.id===id),qty}));
 if(lines.some(x=>!x.product))return toast("장바구니에 확인할 수 없는 상품이 있습니다.");
 // Resolve actual identity IDs and authoritative prices from shop_products;
 // local display IDs/prices are not used as database identifiers or order prices.
 const names=lines.map(x=>x.product.name);
 const {data:dbProducts,error:productError}=await db.from("shop_products")
  .select("id,name,price").in("name",names).eq("is_active",true);
 if(productError)return toast("상품 정보를 확인하지 못했습니다: "+productError.message);
 const productByName=new Map((dbProducts||[]).map(p=>[p.name,p]));
 if(lines.some(x=>!productByName.has(x.product.name)))
  return toast("주문할 상품이 상품 테이블에 없습니다. shop_products 상품 등록을 확인해 주세요.");
 const total=lines.reduce((sum,x)=>sum+Number(productByName.get(x.product.name).price)*x.qty,0);
 const pointsEarn=Math.floor(total*0.01);

 const {data:order,error:orderError}=await db.from("shop_orders")
  .insert({total}).select().single();
 if(orderError)return toast("주문 저장에 실패했습니다: "+orderError.message);

 const orderItems=lines.map(x=>({
  order_id:order.id,
  product_id:productByName.get(x.product.name).id,
  qty:x.qty,
  unit_price:Number(productByName.get(x.product.name).price)
 }));
 const {error:itemError}=await db.from("shop_order_items").insert(orderItems);
 if(itemError){
  // Keep the cart untouched; the order header may remain because the schema has no transaction RPC.
  return toast("주문 상세 저장에 실패했습니다: "+itemError.message+" (장바구니는 유지했습니다.)");
 }

 cart=[];writeCart();renderCart();closeAll();
 $("#accountContent").innerHTML=`<div class="form-panel order-complete"><p class="eyebrow">ORDER COMPLETE</p><h2>주문이 완료되었습니다.</h2><p>주문 번호 <b>#${order.id}</b></p><p>결제 합계 <b>${money(total)}</b></p><p>적립 예정 <b>${pointsEarn.toLocaleString()}P</b></p><p class="fine-print">체험 결제이며 실제 결제 및 포인트 적립은 진행되지 않았습니다.</p><button class="primary-btn" id="showMyOrders">마이페이지 주문 내역</button></div>`;
 openModal("#accountModal");
}
async function handleSignup(form){
 const f=new FormData(form),name=String(f.get("name")).trim(),phone=String(f.get("phone")).trim(),email=String(f.get("email")).trim(),password=String(f.get("password"));
 if(password.length<6)return toast("비밀번호는 6자 이상 입력해 주세요.");
 const {data,error}=await db.auth.signUp({email,password,options:{data:{name,phone}}});
 if(error)return toast(authErrorMessage(error));
 if(data.session){
  currentUser=data.user;await loadProfile();closeAll();toast("회원가입이 완료되었습니다. 환영합니다!");
 }else{
  closeAll();toast("가입 요청이 완료되었습니다. 이메일 인증 후 로그인해 주세요.");
 }
}
async function handleLogin(form){
 const f=new FormData(form),email=String(f.get("email")).trim(),password=String(f.get("password"));
 const {data,error}=await db.auth.signInWithPassword({email,password});
 if(error)return toast(authErrorMessage(error));
 currentUser=data.user;await loadProfile();
 if(profile){closeAll();toast("로그인되었습니다.");}
}
async function handleProfileSave(form){
 if(!currentUser)return toast("로그인이 필요합니다.");
 const f=new FormData(form),name=String(f.get("name")).trim(),phone=String(f.get("phone")).trim();
 const {error}=await db.from("shop_profiles").update({name,phone}).eq("id",currentUser.id);
 if(error)return toast("회원 정보 저장 실패: "+error.message);
 await loadProfile();accountView();toast("회원 정보가 저장되었습니다.");
}
async function logout(){
 const {error}=await db.auth.signOut();
 if(error)return toast(authErrorMessage(error));
 currentUser=null;profile=null;updateMemberMenu();closeAll();toast("로그아웃되었습니다.");
}

$("#productGrid").addEventListener("click",e=>{let card=e.target.closest(".product-card");if(card)openProduct(Number(card.dataset.id))});
$("#filters").addEventListener("click",e=>{let b=e.target.closest("button[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
$("#searchInput").addEventListener("input",renderProducts);$("#sortSelect").addEventListener("change",renderProducts);
$("#heroDots").addEventListener("click",e=>{let i=[...$("#heroDots").children].indexOf(e.target);if(i>=0){setSlide(i);startSlides()}});
$("#cartBtn").onclick=()=>{showOverlay();$("#cartDrawer").classList.add("open")};
$("#accountBtn").onclick=()=>showAccount("login");
$("#searchToggle").onclick=()=>{$("#searchWrap").classList.toggle("visible");$("#searchInput").focus();$("#shop").scrollIntoView({behavior:"smooth"})};
$("#menuToggle").onclick=()=>$("#mainNav").classList.toggle("open");
$("#checkoutBtn").onclick=checkout;
$("#overlay").onclick=closeAll;
document.addEventListener("click",e=>{
 if(e.target.matches("[data-close]"))closeAll();
 if(e.target.matches("[data-qty]")){let id=Number(e.target.dataset.qty),d=Number(e.target.dataset.delta),item=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);if(item&&p){item.qty=Math.max(1,Math.min(p.stock,item.qty+d));writeCart();renderCart()}}
 if(e.target.matches("[data-remove]")){cart=cart.filter(x=>x.id!==Number(e.target.dataset.remove));writeCart();renderCart()}
 if(e.target.id==="detailAdd")addToCart(Number(e.target.dataset.id));
 if(e.target.id==="toSignup")accountView("signup"),openModal("#accountModal");
 if(e.target.id==="toLogin")accountView("login"),openModal("#accountModal");
 if(e.target.id==="logoutBtn")logout();
 if(e.target.id==="showMyOrders"){accountView();loadMyOrders();}
});
document.addEventListener("submit",async e=>{
 if(e.target.id==="signupForm"){e.preventDefault();await handleSignup(e.target)}
 if(e.target.id==="loginForm"){e.preventDefault();await handleLogin(e.target)}
 if(e.target.id==="profileForm"){e.preventDefault();await handleProfileSave(e.target)}
 if(e.target.id==="newsletterForm"){e.preventDefault();toast("구독 신청이 접수되었습니다.");e.target.reset()}
});
db.auth.onAuthStateChange((_event,session)=>{
 // Defer profile queries until Supabase finishes its auth-state callback.
 setTimeout(async ()=>{
  currentUser=session?.user||null;
  if(currentUser) await loadProfile(); else {profile=null;updateMemberMenu()}
 },0);
});
(async function init(){
 renderProducts();renderCart();setSlide(0);startSlides();updateMemberMenu();
 await initializeAuth();
})();
