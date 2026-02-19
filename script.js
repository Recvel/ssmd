/* ═══════════════ DATA ═══════════════ */
const coins = [
  { ticker: "BTC", name: "Bitcoin", icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=026" },
  { ticker: "ETH", name: "Ethereum", icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=026" },
  { ticker: "USDT", name: "Tether (TRC20)", icon: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=026" },
  { ticker: "XMR", name: "Monero", icon: "https://cryptologos.cc/logos/monero-xmr-logo.png?v=026" },
  { ticker: "LTC", name: "Litecoin", icon: "https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=026" },
];

const homeFaqData = [
  { q: "What is Swaptrix?", a: "Swaptrix is an instant crypto exchange platform that allows you to swap 800+ cryptocurrencies privately." },
  { q: "Do I need to register?", a: "No. You can make swaps instantly without creating an account." },
  { q: "How fast are transactions processed?", a: "Most exchanges are completed from a few minutes to 20 minutes." },
];

const fullFaqData = [
  { q: "What is Swaptrix?", a: "Swaptrix is an instant crypto exchange platform that allows you to swap 800+ cryptocurrencies privately without registration." },
  { q: "Do I need to register?", a: "No. You can make swaps instantly without creating an account. However, creating an account unlocks additional features." },
  { q: "How fast are transactions processed?", a: "Most exchanges are completed within a few minutes to 20 minutes, depending on blockchain congestion." },
  { q: "What are the fees?", a: "Our fees are included in the exchange rate shown. There are no hidden charges." },
  { q: "Is it safe to use Swaptrix?", a: "Yes. We use industry-standard encryption and security measures. We don't store your funds or personal data." },
  { q: "What cryptocurrencies are supported?", a: "We support over 1500 cryptocurrencies including Bitcoin, Ethereum, USDT, Monero, Litecoin, and many more." },
  { q: "What if my exchange is delayed?", a: "Delays can occur due to blockchain congestion. Contact our 24/7 support team for assistance with any delayed transactions." },
];

const mockTransactions = [
  { time: "2024-12-01 14:32", sum: "$12.50", coin: "BTC", network: "Bitcoin", status: "Completed", memo: "—", address: "bc1q...3k4m" },
  { time: "2024-11-28 09:15", sum: "$8.20", coin: "ETH", network: "Ethereum", status: "Completed", memo: "—", address: "0x1a2...f7e9" },
  { time: "2024-11-20 17:44", sum: "$3.10", coin: "USDT", network: "TRC20", status: "Pending", memo: "—", address: "TQn...7Rk2" },
];

const mockHistory = [
  { id: "SW-4821", time: "2024-12-01 14:32", fixed: "0.00031 BTC", profit: "$1.25", pair: "BTC → USDT" },
  { id: "SW-4820", time: "2024-11-28 09:15", fixed: "0.012 ETH", profit: "$0.87", pair: "ETH → LTC" },
  { id: "SW-4819", time: "2024-11-20 17:44", fixed: "15 USDT", profit: "$0.45", pair: "USDT → XMR" },
];

/* ═══════════════ STATE ═══════════════ */
let sendCoin = coins[0];
let getCoin = coins[2];
let coinModalTarget = null;
let authMode = null;
let isLoggedIn = false;
let apiKeyVisible = false;
let currentPage = "home";

/* ═══════════════ INIT ═══════════════ */
document.addEventListener("DOMContentLoaded", () => {
  updateWidgetCoins();
  renderFaq("homeFaq", homeFaqData);
  renderFaq("pageFaq", fullFaqData);
  renderDashTransactions(mockTransactions);
  renderHistory();
  setupModalOverlays();
});

/* ═══════════════ NAVIGATION ═══════════════ */
function showPage(id) {
  currentPage = id;
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const target = document.getElementById("page-" + id);
  if (target) target.classList.add("active");

  document.querySelectorAll(".nav-links a").forEach(a => {
    a.classList.toggle("active", a.dataset.page === id);
  });

  // Show/hide footer for dashboard
  const footer = document.getElementById("footer");
  if (footer) footer.style.display = id === "dashboard" ? "none" : "";
}

/* ═══════════════ EXCHANGE WIDGET ═══════════════ */
function updateWidgetCoins() {
  document.getElementById("sendIcon").src = sendCoin.icon;
  document.getElementById("sendTicker").textContent = sendCoin.ticker;
  document.getElementById("getIcon").src = getCoin.icon;
  document.getElementById("getTicker").textContent = getCoin.ticker;
}

function swapCoins() {
  [sendCoin, getCoin] = [getCoin, sendCoin];
  updateWidgetCoins();
}

/* ═══════════════ COIN MODAL ═══════════════ */
function openCoinModal(target) {
  coinModalTarget = target;
  document.getElementById("coinSearch").value = "";
  renderCoinList(coins);
  document.getElementById("coinModal").classList.add("open");
}

function closeCoinModal() {
  document.getElementById("coinModal").classList.remove("open");
  coinModalTarget = null;
}

function renderCoinList(list) {
  const container = document.getElementById("coinList");
  container.innerHTML = list.map(c => `
    <div class="coin-item" onclick="selectCoin('${c.ticker}')">
      <img src="${c.icon}" alt="${c.ticker}" />
      <div class="coin-item-info">
        <div class="coin-ticker">${c.ticker}</div>
        <div class="coin-name">${c.name}</div>
      </div>
    </div>
  `).join("");
}

function filterCoins() {
  const q = document.getElementById("coinSearch").value.toLowerCase();
  const filtered = coins.filter(c => c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  renderCoinList(filtered);
}

function selectCoin(ticker) {
  const coin = coins.find(c => c.ticker === ticker);
  if (!coin) return;
  if (coinModalTarget === "send") sendCoin = coin;
  else getCoin = coin;
  updateWidgetCoins();
  closeCoinModal();
}

/* ═══════════════ AUTH MODAL ═══════════════ */
let pointerStartedOutside = false;

function setupModalOverlays() {
  const authOverlay = document.getElementById("authModal");
  authOverlay.addEventListener("pointerdown", (e) => { pointerStartedOutside = (e.target === authOverlay); });
  authOverlay.addEventListener("pointerup", (e) => {
    if (e.target === authOverlay && pointerStartedOutside) closeAuth();
    pointerStartedOutside = false;
  });

  const coinOverlay = document.getElementById("coinModal");
  let coinPointerStarted = false;
  coinOverlay.addEventListener("pointerdown", (e) => { coinPointerStarted = (e.target === coinOverlay); });
  coinOverlay.addEventListener("pointerup", (e) => {
    if (e.target === coinOverlay && coinPointerStarted) closeCoinModal();
    coinPointerStarted = false;
  });
}

function openAuth(mode) {
  authMode = mode;
  updateAuthUI();
  document.getElementById("authModal").classList.add("open");
}

function closeAuth() {
  document.getElementById("authModal").classList.remove("open");
  authMode = null;
}

function switchAuth() {
  authMode = authMode === "signin" ? "signup" : "signin";
  updateAuthUI();
}

function updateAuthUI() {
  const isSignUp = authMode === "signup";
  document.getElementById("authTitle").textContent = isSignUp ? "Create Account" : "Sign In";
  document.getElementById("confirmGroup").style.display = isSignUp ? "block" : "none";
  document.getElementById("authSubmitBtn").textContent = isSignUp ? "Create Account" : "Sign In";
  document.getElementById("authSwitchText").textContent = isSignUp ? "Already have an account? " : "Don't have an account? ";
  document.getElementById("authSwitchBtn").textContent = isSignUp ? "Sign In" : "Create Account";
}

function submitAuth(e) {
  e.preventDefault();
  isLoggedIn = true;
  updateProfileUI();
  closeAuth();
}

/* ═══════════════ PROFILE ═══════════════ */
function updateProfileUI() {
  document.getElementById("authButtons").style.display = isLoggedIn ? "none" : "flex";
  document.getElementById("profileWidget").style.display = isLoggedIn ? "block" : "none";
}

function toggleProfileMenu() {
  document.getElementById("profileDropdown").classList.toggle("open");
}

function closeProfileMenu() {
  document.getElementById("profileDropdown").classList.remove("open");
}

function logOut() {
  isLoggedIn = false;
  updateProfileUI();
  closeProfileMenu();
  showPage("home");
}

document.addEventListener("click", (e) => {
  const widget = document.getElementById("profileWidget");
  if (widget && !widget.contains(e.target)) closeProfileMenu();
});

/* ═══════════════ FAQ RENDER ═══════════════ */
function renderFaq(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = data.map((item, i) => `
    <div class="faq-item">
      <button class="faq-question" onclick="toggleFaq(this)">
        ${item.q}
        <span class="faq-arrow">▼</span>
      </button>
      <div class="faq-answer">${item.a}</div>
    </div>
  `).join("");
}

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const arrow = btn.querySelector(".faq-arrow");
  const isOpen = answer.classList.contains("open");
  btn.closest(".faq-item").parentElement.querySelectorAll(".faq-answer").forEach(a => a.classList.remove("open"));
  btn.closest(".faq-item").parentElement.querySelectorAll(".faq-arrow").forEach(a => a.classList.remove("open"));
  if (!isOpen) {
    answer.classList.add("open");
    arrow.classList.add("open");
  }
}

/* ═══════════════ DASHBOARD ═══════════════ */
function showDashTab(tab, btn) {
  ["dashboard", "history", "integrate"].forEach(t => {
    const el = document.getElementById("dash-tab-" + t);
    if (el) el.style.display = t === tab ? "flex" : "none";
  });
  document.querySelectorAll(".sidebar-item").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

function renderDashTransactions(txs) {
  const body = document.getElementById("dashTxBody");
  if (!body) return;
  if (txs.length === 0) {
    body.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--muted)">Nothing found</td></tr>`;
    return;
  }
  body.innerHTML = txs.map(tx => `
    <tr>
      <td>${tx.time}</td>
      <td style="font-weight:600;color:var(--fg)">${tx.sum}</td>
      <td>${tx.coin}</td>
      <td>${tx.network}</td>
      <td><span class="${tx.status === 'Completed' ? 'db-badge-ok' : 'db-badge-pending'}">${tx.status}</span></td>
      <td>${tx.memo}</td>
      <td style="font-family:monospace;font-size:12px">${tx.address}</td>
    </tr>
  `).join("");
}

function filterDashTransactions(q) {
  const lower = q.toLowerCase();
  const filtered = mockTransactions.filter(t =>
    t.coin.toLowerCase().includes(lower) ||
    t.network.toLowerCase().includes(lower) ||
    t.status.toLowerCase().includes(lower)
  );
  renderDashTransactions(filtered);
}

function renderHistory() {
  const body = document.getElementById("historyBody");
  if (!body) return;
  body.innerHTML = mockHistory.map(item => `
    <tr>
      <td style="font-family:monospace;font-size:12px;color:hsl(264,100%,63%)">${item.id}</td>
      <td>${item.time}</td>
      <td style="font-family:monospace">${item.fixed}</td>
      <td style="font-weight:600;color:hsl(120,60%,55%)">${item.profit}</td>
      <td>${item.pair}</td>
    </tr>
  `).join("");
}

function toggleApiKey() {
  apiKeyVisible = !apiKeyVisible;
  const input = document.getElementById("apiKeyInput");
  if (input) input.type = apiKeyVisible ? "text" : "password";
  const btn = input ? input.parentElement.querySelector("button") : null;
  if (btn) btn.textContent = apiKeyVisible ? "🙈 Hide" : "👁 Show";
}

function copyRefLink() {
  const input = document.getElementById("refLinkInput");
  if (!input) return;
  navigator.clipboard.writeText(input.value);
  const btn = input.parentElement.querySelector("button");
  if (btn) {
    btn.textContent = "✅ Copied!";
    setTimeout(() => { btn.textContent = "📋 Copy"; }, 2000);
  }
}
