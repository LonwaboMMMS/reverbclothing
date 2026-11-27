(() => {
  "use strict";
  const seed = [
    {id:1,name:"Reverb Essential Tee",type:"T-shirts",price:399,description:"A heavyweight everyday tee with a relaxed silhouette.",colors:[{name:"Black",hex:"#202020",sizes:{XS:0,S:4,M:8,L:7,XL:3,XXL:1}},{name:"Bone",hex:"#e7e0d2",sizes:{XS:1,S:3,M:6,L:5,XL:2,XXL:0}}]},
    {id:2,name:"Studio Hoodie",type:"Hoodies",price:899,description:"Comfort-first layering, built for cooler days.",colors:[{name:"Charcoal",hex:"#414141",sizes:{XS:0,S:2,M:4,L:4,XL:2,XXL:1}},{name:"Olive",hex:"#69705a",sizes:{XS:1,S:2,M:3,L:2,XL:0,XXL:0}}]},
    {id:3,name:"Utility Cargo",type:"Pants",price:749,description:"Utility pockets, clean lines and a comfortable fit.",colors:[{name:"Sand",hex:"#b9a68a",sizes:{XS:0,S:1,M:4,L:3,XL:2,XXL:0}}]},
    {id:4,name:"Everyday Cap",type:"Accessories",price:299,description:"A low-profile cap for daily wear.",colors:[{name:"Black",hex:"#202020",sizes:{XS:0,S:0,M:0,L:0,XL:0,XXL:0}}]}
  ];
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const money = n => "R" + Number(n).toLocaleString("en-ZA");
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  let products;
  try { products = JSON.parse(localStorage.getItem("reverbProducts")) || seed; } catch (_) { products = seed; }
  let cart = [];
  let activeProduct = null;
  let selectedColour = 0;
  let selectedSize = "";
  const modal = $("#modal"), modalContent = $("#modalContent");
  const search = $("#search"), typeFilter = $("#typeFilter"), colourFilter = $("#colourFilter");
  const sizeFilter = $("#sizeFilter"), sort = $("#sort"), grid = $("#products"), empty = $("#empty"), filters = $("#filters");

  function totalStock(product) {
    return product.colors.reduce((sum, colour) => sum + Object.values(colour.sizes).reduce((a,b) => a + Number(b || 0), 0), 0);
  }
  function saveProducts() { localStorage.setItem("reverbProducts", JSON.stringify(products)); }
  function populateFilters() {
    const types = [...new Set(products.map(p => p.type))];
    const colours = [...new Set(products.flatMap(p => p.colors.map(c => c.name)))];
    const oldType = typeFilter.value, oldColour = colourFilter.value;
    typeFilter.innerHTML = '<option value="">All types</option>' + types.map(v => '<option value="' + escapeHTML(v) + '">' + escapeHTML(v) + '</option>').join("");
    colourFilter.innerHTML = '<option value="">All colours</option>' + colours.map(v => '<option value="' + escapeHTML(v) + '">' + escapeHTML(v) + '</option>').join("");
    typeFilter.value = oldType; colourFilter.value = oldColour;
  }
  function render() {
    populateFilters();
    let list = products.slice();
    if (search.value.trim()) list = list.filter(p => p.name.toLowerCase().includes(search.value.trim().toLowerCase()));
    if (typeFilter.value) list = list.filter(p => p.type === typeFilter.value);
    if (colourFilter.value) list = list.filter(p => p.colors.some(c => c.name === colourFilter.value));
    if (sizeFilter.value) list = list.filter(p => p.colors.some(c => Number(c.sizes[sizeFilter.value]) > 0));
    if (sort.value === "low") list.sort((a,b) => a.price-b.price);
    if (sort.value === "high") list.sort((a,b) => b.price-a.price);
    grid.innerHTML = list.map(p => {
      const kind = p.type.toLowerCase().includes("hood") ? "hoodie" : p.type.toLowerCase().includes("pant") ? "pants" : p.type.toLowerCase().includes("access") ? "cap" : "tee";
      return '<article class="product-card" data-id="' + p.id + '"><div class="product-image">' + (p.images?.[0] || p.image ? '<img src="' + escapeHTML((p.images||[p.image])[0]) + '" alt="' + escapeHTML(p.name) + '">' : '<div class="product-art ' + kind + '" style="--product-color:' + escapeHTML(p.colors[0]?.hex || "#222") + '"><span class="product-mark">R</span></div>') + '<span class="product-badge">REVERB / 01</span><button class="quick" type="button">QUICK VIEW ↗</button></div><div class="product-info"><div><h3>' + escapeHTML(p.name) + '</h3><p>' + escapeHTML(p.type) + '</p></div><span class="price">' + money(p.price) + '</span></div><div class="swatches">' + p.colors.map(c => '<span class="swatch" title="' + escapeHTML(c.name) + '" style="background:' + escapeHTML(c.hex) + '"></span>').join("") + '</div></article>';
    }).join("");
    empty.hidden = list.length > 0;
    $(".product-card", grid).forEach(card => { card.addEventListener("click", e => { if (e.target.closest(".quick")) { e.preventDefault(); e.stopPropagation(); openProduct(Number(card.dataset.id)); return; } location.href = "product.html?id=" + encodeURIComponent(card.dataset.id); }); card.querySelector(".quick")?.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); openProduct(Number(card.dataset.id)); }); });
  }
  function show(html) {
    modalContent.innerHTML = html;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
  function openProduct(id) {
    activeProduct = products.find(p => p.id === id);
    if (!activeProduct) return;
    selectedColour = 0; selectedSize = "";
    drawProduct();
  }
  function drawProduct() {
    const p = activeProduct, colour = p.colors[selectedColour];
    const selectedStock = selectedSize ? Number(colour.sizes[selectedSize] || 0) : null;
    const soldOut = selectedSize && selectedStock < 1;
    show('<p class="eyebrow">' + escapeHTML(p.type) + '</p><h2>' + escapeHTML(p.name) + '</h2><p>' + escapeHTML(p.description) + '</p><h3>' + money(p.price) + '</h3><p>Colour</p><div class="detail-colors">' + p.colors.map((c,i) => '<button type="button" data-col="' + i + '" class="' + (i===selectedColour ? "selected" : "") + '"><span class="swatch" style="display:inline-block;background:' + escapeHTML(c.hex) + ';vertical-align:middle"></span> ' + escapeHTML(c.name) + '</button>').join("") + '</div><p>Size</p><div class="size-stock">' + Object.keys(colour.sizes).map(s => '<button type="button" data-size="' + s + '" class="' + (s===selectedSize ? "selected" : "") + '">' + s + (Number(colour.sizes[s]) < 1 ? " · Sold out" : "") + '</button>').join("") + '</div>' +
      (soldOut ? '<section class="restock-notify"><h3>Get notified when it is back</h3><p>' + escapeHTML(colour.name) + ' / ' + escapeHTML(selectedSize) + ' is currently sold out. Leave your details and we will notify you when this option is available again.</p><form id="restockForm"><input name="name" type="text" placeholder="Your name" autocomplete="name" required maxlength="100"><input name="contact" type="text" placeholder="Email address or mobile number" autocomplete="email" required maxlength="160"><button class="action" type="submit">NOTIFY ME</button><p id="restockMessage" class="eyebrow" role="status" aria-live="polite"></p></form></section>' : '<button class="action" id="addCart" type="button">ADD TO BAG</button>'));
    $$("[data-col]", modalContent).forEach(button => button.addEventListener("click", () => { selectedColour = Number(button.dataset.col); selectedSize = ""; drawProduct(); }));
    $$("[data-size]", modalContent).forEach(button => button.addEventListener("click", () => { selectedSize = button.dataset.size; drawProduct(); }));
    const restockForm = $("#restockForm");
    if (restockForm) {
      restockForm.addEventListener("submit", async e => {
        e.preventDefault();
        const formData = new FormData(restockForm);
        const message = $("#restockMessage");
        const submit = restockForm.querySelector('button[type="submit"]');
        const request = {
          productId: p.id,
          productName: p.name,
          colour: colour.name,
          size: selectedSize,
          name: String(formData.get("name") || "").trim(),
          contact: String(formData.get("contact") || "").trim()
        };
        submit.disabled = true;
        message.textContent = "Submitting your request…";
        try {
          const response = await fetch("/api/restock-requests", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify(request)
          });
          if (!response.ok) throw new Error("Request service is not available.");
          message.textContent = "You're on the list. We'll contact you when this option is back.";
          restockForm.reset();
        } catch (_) {
          message.textContent = "Restock notifications are not active yet. Your details have not been saved. Please try again later.";
          submit.disabled = false;
        }
      });
    }
    const addCart = $("#addCart");
    if (addCart) addCart.addEventListener("click", () => {
      if (!selectedSize) { alert("Please select a size."); return; }
      cart.push({product:p, colour:colour.name, size:selectedSize});
      $("#cartCount").textContent = cart.length;
      close();
    });
  }
  function account() {
    show('<h2>Account</h2><div class="account-tabs"><button class="action" id="loginTab" type="button">Log in</button><button class="action" id="signupTab" type="button">Create account</button></div><div id="accountBody"></div>');
    const body = $("#accountBody");
    function login() {
      body.innerHTML = '<form id="loginForm"><input type="email" placeholder="Email address" required><input type="password" placeholder="Password" required><a href="#" id="forgot">Forgot password?</a><button class="action">LOG IN</button></form>';
      $("#loginForm").addEventListener("submit", e => { e.preventDefault(); alert("Authentication will be connected when backend services are configured."); });
      $("#forgot").addEventListener("click", e => { e.preventDefault(); body.innerHTML = '<h3>Reset password</h3><input id="resetEmail" type="email" placeholder="Email address"><button class="action" id="resetBtn" type="button">SEND RESET LINK</button><p class="eyebrow">Email delivery will be connected with authentication backend.</p>'; $("#resetBtn").addEventListener("click", () => alert("Password reset requires backend configuration.")); });
    }
    function signup() {
      body.innerHTML = '<form id="signupForm"><input placeholder="Full name" required><input type="email" placeholder="Email address" required><input type="password" placeholder="Password" minlength="8" required><button class="action">CREATE ACCOUNT</button></form>';
      $("#signupForm").addEventListener("submit", e => { e.preventDefault(); alert("Account registration backend is not connected yet."); });
    }
    $("#loginTab").addEventListener("click", login);
    $("#signupTab").addEventListener("click", signup);
    login();
  }
  function bag() {
    if (!cart.length) { show('<h2>Your bag is empty.</h2><p>Find something you love in the collection.</p>'); return; }
    show('<h2>Your bag</h2>' + cart.map((item,i) => '<div class="admin-row">' + escapeHTML(item.product.name) + ' · ' + escapeHTML(item.colour) + ' · ' + item.size + ' <b>' + money(item.product.price) + '</b> <button type="button" data-remove="' + i + '">Remove</button></div>').join("") + '<h3>Total ' + money(cart.reduce((sum,item) => sum + item.product.price,0)) + '</h3><button class="action" id="checkout" type="button">CHECKOUT</button>');
    $$("[data-remove]", modalContent).forEach(button => button.addEventListener("click", () => { cart.splice(Number(button.dataset.remove),1); $("#cartCount").textContent = cart.length; bag(); }));
    $("#checkout").addEventListener("click", () => alert("Checkout/payment integration will be added later."));
  }
  $("#closeModal").addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });
  $("#accountBtn").addEventListener("click", account);
  $("#mobileAccount").addEventListener("click", account);
  $("#cartBtn").addEventListener("click", bag);
  $("#mobileBag").addEventListener("click", bag);
  $("#searchBtn").addEventListener("click", () => { filters.classList.add("show"); search.focus(); });
  $("#mobileSearch").addEventListener("click", () => { filters.classList.add("show"); search.focus(); $("#shop").scrollIntoView({behavior:"smooth"}); });
  $("#filterBtn").addEventListener("click", () => filters.classList.toggle("show"));
  [search,typeFilter,colourFilter,sizeFilter,sort].forEach(el => el.addEventListener("input", render));
  $$(".category-strip button").forEach(button => button.addEventListener("click", () => { typeFilter.value = button.dataset.category; render(); $("#shop").scrollIntoView({behavior:"smooth"}); }));
  render();
})();