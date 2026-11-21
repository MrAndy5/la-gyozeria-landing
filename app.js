// ============================================================================
// LA GYOZERÍA — Interactive Menu & Live Financial Model (FACA Challenge II v3)
// All numbers sourced directly from LaGyozeria_FACA_v3.xlsx
// ============================================================================

const MENU_ITEMS = [
  { name: "3 Gyozas Clásicas", cat: "single", price: "2,00 €", share: "12%", detail: "Producto gancho · Cerdo, pollo o vegetal + salsa", tag: "GANCHO", featured: true },
  { name: "6 Gyozas Clásicas", cat: "single", price: "3,90 €", share: "7%", detail: "Ración individual · 0,65 €/ud" },
  { name: "8 Gyozas Clásicas", cat: "single", price: "5,20 €", share: "2%", detail: "Ración mediana · Combinables" },
  { name: "10 Gyozas Clásicas", cat: "single", price: "6,50 €", share: "2%", detail: "Ración grande · Solo gyozas" },
  { name: "6 Gyozas Premium", cat: "single", price: "5,50 €", share: "4%", detail: "Langostino-cebollino, pollo coreano picante o setas-queso", tag: "PREMIUM", tagRed: true },
  { name: "Menú Express (6 gyozas + bebida)", cat: "menu", price: "5,50 €", share: "19%", detail: "Favorito universitario · Rápido entre clases", tag: "TOP ESTUDIANTES" },
  { name: "Menú Completo (8 gyozas + arroz + bebida)", cat: "menu", price: "7,50 €", share: "30%", detail: "Comida/cena estrella · Arroz salteado al ajo y cebollino", tag: "BESTSELLER", featured: true, tagRed: true },
  { name: "Menú XL (10 gyozas + arroz + bebida)", cat: "menu", price: "9,00 €", share: "11%", detail: "Formato completo máximo · Menos de 10 €" },
  { name: "Friends Pack (20 gyozas)", cat: "pack", price: "12,50 €", share: "5%", detail: "Sabores en bloques de 5 · Ideal parejas y amigos" },
  { name: "Family Pack (30 gyozas · incl. 5 premium)", cat: "pack", price: "18,50 €", share: "5%", detail: "25 clásicas + 5 premium · Alto ticket delivery" },
  { name: "Party Pack (40 gyozas · incl. 5 premium)", cat: "pack", price: "24,50 €", share: "3%", detail: "35 clásicas + 5 premium · Grupos y findes", tag: "SHARING" },
];

const SCENARIOS = {
  pessimistic: {
    desc: "Escenario Pesimista: −15% pedidos (119/día en Y3), −3% ticket, +8% coste comida/envase, 30% delivery y +5% costes fijos. CFFA negativo los 5 años → aquí brilla la opción real de abandono.",
    npv: "−120.914 €",
    decision: "REJECT · VAN < 0",
    accept: false,
    irr: "n/a",
    spread: "Flujos negativos en Y0–Y5",
    pi: "−1,55x",
    payback: "No rec.",
    dpayback: "Descontado: No recuperado",
    salesY3: "250.500 €",
    ebitY3: "−19.704 €",
    cffaTotal: "−140.326 €",
    cffa: [-47500, -41251, -23137, -10250, -7667, -10521],
  },
  base: {
    desc: "Escenario Base: 95 → 145 pedidos/día (140 en Y3), ticket 7,54 € (+2,5–3%/año), 25% delivery, tasa de descuento nominal 12,0% (Bono 10Y 4,2% + prima 7,8%).",
    npv: "+31.324 €",
    decision: "ACCEPT · VAN > 0",
    accept: true,
    irr: "28,3%",
    spread: "+16,3 pp sobre coste de capital",
    pi: "1,66x",
    payback: "2,97 a",
    dpayback: "Descontado: 3,51 años",
    salesY3: "303.820 €",
    ebitY3: "+29.079 €",
    cffaTotal: "+73.768 €",
    cffa: [-47500, -7548, 20148, 36066, 38681, 33921],
  },
  optimistic: {
    desc: "Escenario Optimista: +10% pedidos (154/día en Y3 · 80% cap. en Y4), +3% ticket, −5% coste comida, 20% delivery y −3% costes fijos. Autofinancia la expansión a un 2.º local.",
    npv: "+140.775 €",
    decision: "ACCEPT · VAN > 0",
    accept: true,
    irr: "80,4%",
    spread: "+68,4 pp sobre coste de capital",
    pi: "3,96x",
    payback: "1,58 a",
    dpayback: "Descontado: 1,78 años",
    salesY3: "344.228 €",
    ebitY3: "+69.476 €",
    cffaTotal: "+227.739 €",
    cffa: [-47500, 19403, 48795, 66671, 72658, 67713],
  },
};

const YEARS = ["Y0 (2026)", "Y1 (2027)", "Y2 (2028)", "Y3 (2029)", "Y4 (2030)", "Y5 (2031)"];

// 1. RENDER MENU
function renderMenu(filter = "all") {
  const list = document.getElementById("menu-list");
  const filtered = filter === "all" ? MENU_ITEMS : MENU_ITEMS.filter((i) => i.cat === filter);
  list.innerHTML = filtered
    .map(
      (item) => `
      <div class="menu-item ${item.featured ? "featured" : ""}">
        <div>
          <div class="menu-item-title">
            <span>${item.name}</span>
            ${item.tag ? `<span class="badge-chip ${item.tagRed ? "red" : ""}">${item.tag}</span>` : ""}
          </div>
          <div class="menu-item-meta">${item.detail} · Mix: ${item.share} pedidos</div>
        </div>
        <div class="menu-price">${item.price}</div>
      </div>`
    )
    .join("");
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    renderMenu(btn.dataset.filter);
  });
});

// 2. RENDER FINANCIAL SCENARIO & CFFA CHART
function formatShortEur(val) {
  const sign = val > 0 ? "+" : val < 0 ? "−" : "";
  const abs = Math.abs(val);
  return `${sign}${(abs / 1000).toFixed(1).replace(".", ",")}k €`;
}

function renderScenario(key) {
  const s = SCENARIOS[key];
  document.getElementById("scenario-desc").textContent = s.desc;
  document.getElementById("kpi-npv").textContent = s.npv;
  const dec = document.getElementById("kpi-decision");
  dec.textContent = s.decision;
  dec.className = `decision-badge ${s.accept ? "accept" : "reject"}`;

  document.getElementById("kpi-irr").textContent = s.irr;
  document.getElementById("kpi-spread").textContent = s.spread;
  document.getElementById("kpi-pi").textContent = s.pi;
  document.getElementById("kpi-payback").textContent = s.payback;
  document.getElementById("kpi-dpayback").textContent = s.dpayback;
  document.getElementById("kpi-sales-y3").textContent = s.salesY3;
  document.getElementById("kpi-ebit-y3").textContent = s.ebitY3;
  document.getElementById("kpi-cffa-total").textContent = s.cffaTotal;

  // Max scale = 75,000 so heights compare cleanly across scenarios
  const maxAbs = 75000;
  const chart = document.getElementById("cffa-chart");
  chart.innerHTML = s.cffa
    .map((val, idx) => {
      const pct = Math.min(100, Math.round((Math.abs(val) / maxAbs) * 92));
      const isPos = val >= 0;
      return `
        <div class="bar-col">
          <div class="bar-plot">
            <div class="bar-half pos">
              ${isPos ? `<span class="bar-val">${formatShortEur(val)}</span><div class="bar-fill is-pos" style="height:${pct}%"></div>` : ""}
            </div>
            <div class="bar-half neg">
              ${!isPos ? `<div class="bar-fill is-neg" style="height:${pct}%"></div><span class="bar-val">${formatShortEur(val)}</span>` : ""}
            </div>
          </div>
          <span class="bar-year">${YEARS[idx]}</span>
        </div>`;
    })
    .join("");
}

document.querySelectorAll(".scen-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".scen-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderScenario(btn.dataset.scenario);
  });
});

// 3. SCROLL REVEAL
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// INIT
renderMenu("all");
renderScenario("base");
