// NORME. demo store — data is grouped here for future database migration.
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
const memberGrades = [
 {name:"WELCOME",min:0,rate:.01},{name:"SILVER",min:300000,rate:.03},
 {name:"GOLD",min:700000,rate:.05},{name:"BLACK",min:1500000,rate:.07}
];
const $ = s => document.querySelector(s);
const money = n => "₩"+Number(n).toLocaleString("ko-KR");
const read = (key,fallback) => {try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}};
const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));
let users=read("norme_users",[]), currentUser=read("norme_current_user",null), cart=read("norme_cart",[]), orders=read("norme_orders",[]);
let activeCategory="All", activeSlide=0, slideTimer;
function gradeFor(total){return [...memberGrades].reverse().find(g=>total>=g.min)||memberGrades[0]}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2200)}
function renderProducts(){
 let q=$("#searchInput").value.trim().toLowerCase(), sort=$("#sortSelect").value;
 let list=products.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&p.name.toLowerCase().includes(q));
 if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);
 $("#productGrid").innerHTML=list.map(p=>`<article class="product-card" data-id="${p.id}"><div class="product-image"><img loading="lazy" src="${p.image}" alt="${p.name} 착용 및 제품 사진"><span class="product-tag">925 SILVER</span></div><div class="product-info"><h3>${p.name}</h3><p>${money(p.price)}</p></div></article>`).join("")||"<p>검색 결과가 없습니다.</p>";
}
function setSlide(n){const slides=[...document.querySelectorAll(".hero-slide")],dots=[...document.querySelectorAll("#heroDots button")];activeSlide=n%slides.length;slides.forEach((s,i)=>s.classList.toggle("active",i===activeSlide));dots.forEach((d,i)=>d.classList.toggle("active",i===activeSlide));$(".hero-bottom span").textContent=String(activeSlide+1).padStart(2,"0")+" / 04"}
function startSlides(){clearInterval(slideTimer);slideTimer=setInterval(()=>setSlide(activeSlide+1),6000)}
function showOverlay(){ $("#overlay").classList.add("show")}
function closeAll(){document.querySelectorAll(".drawer.open,.modal.open").forEach(x=>x.classList.remove("open"));$("#overlay").classList.remove("show")}
function openModal(id){showOverlay();$(id).classList.add("open")}
function addToCart(id){let p=products.find(x=>x.id===id);let item=cart.find(x=>x.id===id);if(!p||p.stock<1)return toast("품절 상품입니다.");if(item){if(item.qty>=p.stock)return toast("재고 수량을 초과할 수 없습니다.");item.qty++}else cart.push({id,qty:1});write("norme_cart",cart);renderCart();toast("장바구니에 담았습니다.")}
function renderCart(){
 $("#cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);
 $("#cartItems").innerHTML=cart.length?cart.map(c=>{let p=products.find(x=>x.id===c.id);return `<div class="cart-row"><img src="${p.image}" alt="${p.name}"><div><h3>${p.name}</h3><p>${money(p.price)}</p><div class="qty-control"><button data-qty="${p.id}" data-delta="-1">−</button><span>${c.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove-btn" data-remove="${p.id}">삭제</button></div>`}).join(""):"<p class='fine-print'>장바구니가 비어 있습니다.</p>";
 $("#cartTotal").textContent=money(cart.reduce((s,c)=>s+products.find(p=>p.id===c.id).price*c.qty,0));
}
function openProduct(id){let p=products.find(x=>x.id===id);$("#productDetail").innerHTML=`<div class="detail-layout"><img src="${p.image}" alt="${p.name} 모델 착용 및 제품 디테일"><div class="detail-copy"><p class="eyebrow">${p.category.toUpperCase()} / COLLECTION 001</p><h2>${p.name}</h2><p class="price">${money(p.price)}</p><p>${p.description}</p><p>${p.material}</p><p class="fine-print">이미지는 브랜드 콘셉트 시안이며, 실제 판매 시 제품 사양과 소재를 확인해 주세요.</p><label for="detailQty">수량</label><select id="detailQty"><option>1</option><option>2</option><option>3</option></select><button class="primary-btn" id="detailAdd" data-id="${id}">ADD TO BAG</button></div></div>`;openModal("#productModal")}
function accountView(mode="login"){
 if(currentUser){let u=users.find(x=>x.email===currentUser);if(!u){currentUser=null;write("norme_current_user",null);return accountView("login")}
 let g=gradeFor(u.spent);$("#accountContent").innerHTML=`<div class="form-panel"><p class="eyebrow">MY NORME.</p><h2>MY ACCOUNT</h2><div class="member-summary">${u.name}님, 반갑습니다.<br>GRADE : <b>${g.name}</b><br>POINT : <b>${u.points.toLocaleString()} P</b><br>TOTAL PURCHASE : ${money(u.spent)}</div><h3>ORDER HISTORY</h3>${orders.filter(o=>o.email===u.email).map(o=>`<div class="order-item">${o.date} · ${money(o.total)} · ${o.items.length}개 상품</div>`).join("")||"<p>아직 주문 내역이 없습니다.</p>"}<button class="primary-btn" id="logoutBtn">로그아웃</button></div>`;return}
 $("#accountContent").innerHTML=mode==="signup"?`<div class="form-panel"><p class="eyebrow">JOIN NORME.</p><h2>CREATE ACCOUNT</h2><p>가입 축하 포인트 3,000P를 드립니다.</p><form id="signupForm"><div class="form-field"><label>이름</label><input name="name" required></div><div class="form-field"><label>이메일</label><input name="email" type="email" required></div><div class="form-field"><label>비밀번호</label><input name="password" type="password" minlength="4" required></div><button class="primary-btn">회원가입</button></form><button class="form-switch" id="toLogin">이미 회원이신가요? 로그인</button></div>`:`<div class="form-panel"><p class="eyebrow">WELCOME BACK</p><h2>LOGIN</h2><form id="loginForm"><div class="form-field"><label>이메일</label><input name="email" type="email" required></div><div class="form-field"><label>비밀번호</label><input name="password" type="password" required></div><button class="primary-btn">로그인</button></form><button class="form-switch" id="toSignup">처음 방문하셨나요? 회원가입</button></div>`;
}
function checkout(){
 if(!currentUser){closeAll();accountView();openModal("#accountModal");toast("결제 전 로그인이 필요합니다.");return}
 if(!cart.length)return toast("장바구니가 비어 있습니다.");
 let total=cart.reduce((s,c)=>s+products.find(p=>p.id===c.id).price*c.qty,0);
 $("#checkoutContent").innerHTML=`<div class="form-panel"><p class="eyebrow">DEMO CHECKOUT</p><h2>ORDER SUMMARY</h2><p>체험 결제입니다. 실제 카드 결제나 금전 이동은 발생하지 않습니다.</p>${cart.map(c=>{let p=products.find(x=>x.id===c.id);return `<div class="order-item">${p.name} × ${c.qty} <b style="float:right">${money(p.price*c.qty)}</b></div>`}).join("")}<div class="member-summary">총 결제 금액 <b>${money(total)}</b></div><button class="primary-btn" id="confirmOrder">체험 주문 확정</button></div>`;
 openModal("#checkoutModal");
}
function confirmOrder(){
 let u=users.find(x=>x.email===currentUser),total=cart.reduce((s,c)=>s+products.find(p=>p.id===c.id).price*c.qty,0);
 let earned=Math.floor(total*gradeFor(u.spent).rate);
 let order={id:Date.now(),email:u.email,date:new Date().toLocaleString("ko-KR"),total,items:cart.map(c=>({...c})),earned};
 orders.push(order);u.spent+=total;u.points+=earned;write("norme_users",users);write("norme_orders",orders);cart=[];write("norme_cart",cart);renderCart();closeAll();toast(`주문이 저장되었습니다. ${earned.toLocaleString()}P 적립`); 
}
$("#productGrid").addEventListener("click",e=>{let card=e.target.closest(".product-card");if(card)openProduct(Number(card.dataset.id))});
$("#filters").addEventListener("click",e=>{let b=e.target.closest("button[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
$("#searchInput").addEventListener("input",renderProducts);$("#sortSelect").addEventListener("change",renderProducts);
$("#heroDots").addEventListener("click",e=>{let i=[...$("#heroDots").children].indexOf(e.target);if(i>=0){setSlide(i);startSlides()}});
$("#cartBtn").onclick=()=>{showOverlay();$("#cartDrawer").classList.add("open")};
$("#accountBtn").onclick=()=>{accountView();openModal("#accountModal")};
$("#searchToggle").onclick=()=>{$("#searchWrap").classList.toggle("visible");$("#searchInput").focus();$("#shop").scrollIntoView({behavior:"smooth"})};
$("#menuToggle").onclick=()=>$("#mainNav").classList.toggle("open");
$("#checkoutBtn").onclick=checkout;
$("#overlay").onclick=closeAll;
document.addEventListener("click",e=>{
 if(e.target.matches("[data-close]"))closeAll();
 if(e.target.matches("[data-qty]")){let id=Number(e.target.dataset.qty),d=Number(e.target.dataset.delta),item=cart.find(x=>x.id===id),p=products.find(x=>x.id===id);item.qty=Math.max(1,Math.min(p.stock,item.qty+d));write("norme_cart",cart);renderCart()}
 if(e.target.matches("[data-remove]")){cart=cart.filter(x=>x.id!==Number(e.target.dataset.remove));write("norme_cart",cart);renderCart()}
 if(e.target.id==="detailAdd")addToCart(Number(e.target.dataset.id));
 if(e.target.id==="toSignup")accountView("signup"),openModal("#accountModal");
 if(e.target.id==="toLogin")accountView("login"),openModal("#accountModal");
 if(e.target.id==="logoutBtn"){currentUser=null;write("norme_current_user",null);closeAll();toast("로그아웃했습니다.")}
 if(e.target.id==="confirmOrder")confirmOrder();
});
document.addEventListener("submit",e=>{
 if(e.target.id==="signupForm"){e.preventDefault();let f=new FormData(e.target),email=f.get("email").trim().toLowerCase();if(users.some(u=>u.email===email))return toast("이미 가입된 이메일입니다.");let u={name:f.get("name").trim(),email,password:f.get("password"),points:3000,spent:0};users.push(u);currentUser=email;write("norme_users",users);write("norme_current_user",currentUser);closeAll();toast("가입 완료! 3,000P가 지급되었습니다.");}
 if(e.target.id==="loginForm"){e.preventDefault();let f=new FormData(e.target),email=f.get("email").trim().toLowerCase(),u=users.find(x=>x.email===email&&x.password===f.get("password"));if(!u)return toast("이메일 또는 비밀번호를 확인해 주세요.");currentUser=email;write("norme_current_user",currentUser);closeAll();toast("로그인되었습니다.");}
 if(e.target.id==="newsletterForm"){e.preventDefault();toast("구독 신청이 접수되었습니다.");e.target.reset()}
});
renderProducts();renderCart();setSlide(0);startSlides();
