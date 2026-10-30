/* ==========================================================================
   FaturaPay Enterprise v5.5 — Full B2C + B2B Sub-Dealer + Super Admin Engine
   ========================================================================== */

const STATE = {
  world: 'portal', // 'storefront' | 'portal' | 'adminworld'
  balance: 24850.00,
  creditLimit: 5000.00,
  dailyProfit: 1184.50,
  dailyTxCount: 68,
  activeTierKey: 'gold',
  soundEnabled: true,
  receiptFormat: 'corporate', // 'corporate' | 'thermal'

  // Live Editable Price/Commission Groups (Directly drives Terminal calculations!)
  tiers: {
    bronz: { name: 'Bronz Gişe', gsmDisc: 2.4, billComm: 10.0, epinDisc: 3.0, posRate: 2.35 },
    gumus: { name: 'Gümüş Bayi', gsmDisc: 3.0, billComm: 12.5, epinDisc: 3.8, posRate: 2.10 },
    gold:  { name: 'Gold Bayi',  gsmDisc: 3.6, billComm: 15.0, epinDisc: 4.5, posRate: 1.85 },
    vip:   { name: 'VIP Bölge Dağıtıcı', gsmDisc: 4.4, billComm: 18.0, epinDisc: 5.5, posRate: 1.49 }
  },

  selectedOp: { code: 'TC', name: 'Turkcell', bonusDisc: 0 },
  pkgFilter: 'all',
  selectedPkgId: 'tc20',

  activeBillCat: 'elektrik',
  queriedInvoices: [],
  billCart: [],

  selectedEpinId: 'ep1',
  pending3dPayment: null
};

// 8 GORGEOUS ONE-CLICK DESIGN THEMES
const THEME_PRESETS = {
  stripe:  { label: 'Stripe Finans İndigo', theme: 'light', sidebar: 'dark', primary: '#4f46e5', dark: '#3730a3', accent: '#0ea5e9', radius: 14 },
  paytr:   { label: 'PayTR Kurumsal Mavi',  theme: 'light', sidebar: 'light', primary: '#0284c7', dark: '#0369a1', accent: '#38bdf8', radius: 10 },
  zumrut:  { label: 'FaturaMatik Zümrüt',   theme: 'light', sidebar: 'dark', primary: '#059669', dark: '#047857', accent: '#10b981', radius: 12 },
  oled:    { label: 'Linear OLED Gece',     theme: 'dark',  sidebar: 'dark', primary: '#6366f1', dark: '#4f46e5', accent: '#22d3ee', radius: 14 },
  telekom: { label: 'Telekom Enerji',       theme: 'light', sidebar: 'dark', primary: '#ea580c', dark: '#c2410c', accent: '#f59e0b', radius: 12 },
  royal:   { label: 'Kraliyet Fintech Mor', theme: 'light', sidebar: 'brand', primary: '#7c3aed', dark: '#5b21b6', accent: '#ec4899', radius: 18 },
  vipgold: { label: 'VIP Altın & Obsidyen', theme: 'dark',  sidebar: 'dark', primary: '#d97706', dark: '#b45309', accent: '#fbbf24', radius: 10 },
  kamu:    { label: 'Merkez Banka Klasik',  theme: 'banking', sidebar: 'brand', primary: '#1e3a8a', dark: '#172554', accent: '#0284c7', radius: 6 }
};

const OPERATORS = [
  { code: 'TC', name: 'Turkcell', color: '#eab308', textColor: '#0f172a', bonus: 0.0 },
  { code: 'VF', name: 'Vodafone', color: '#dc2626', textColor: '#ffffff', bonus: 0.4 },
  { code: 'TT', name: 'Türk Telekom', color: '#0284c7', textColor: '#ffffff', bonus: 0.6 },
  { code: 'BM', name: 'BİMcell', color: '#059669', textColor: '#ffffff', bonus: 0.5 },
  { code: 'PT', name: 'PTTcell', color: '#ca8a04', textColor: '#ffffff', bonus: 0.5 },
  { code: 'KK', name: 'KKTCell / Telsim', color: '#7c3aed', textColor: '#ffffff', bonus: 0.9 }
];

const GSM_PACKAGES = [
  { id: 'tl150', kind: 'tl', code: 'TL-150', title: '150 TL Tam Kontör', meta: 'Direkt Hat Bakiyesi • Anında Onay', price: 150 },
  { id: 'tl250', kind: 'tl', code: 'TL-250', title: '250 TL Tam Kontör', meta: 'Direkt Hat Bakiyesi • Anında Onay', price: 250 },
  { id: 'tc15',  kind: 'paket', code: 'PK-15G', title: 'Avantaj 15 GB + 1000 DK', meta: '28 Gün • 250 SMS + Sınırsız WhatsApp', price: 275 },
  { id: 'tc20',  kind: 'paket', code: 'PK-20G', title: 'Süper 20 GB + 1000 DK', meta: '28 Gün • Sosyal Medya Yönü Geçerli', price: 320 },
  { id: 'tc30',  kind: 'paket', code: 'PK-30G', title: 'Platinum 30 GB + 1500 DK', meta: '28 Gün • Sınırsız İletişim & YouTube', price: 410 },
  { id: 'tc50',  kind: 'paket', code: 'PK-50G', title: 'Ultra 50 GB + 2000 DK', meta: '28 Gün • VIP Yüksek İnternet Paketi', price: 540 },
  { id: 'tl500', kind: 'tl', code: 'TL-500', title: '500 TL Tam Kontör', meta: 'Direkt Hat Bakiyesi • Anında Onay', price: 500 },
  { id: 'tl1000',kind: 'tl', code: 'TL-1000',title: '1.000 TL Kurumsal Kontör', meta: 'Yüksek Limitli Direkt TL Yükleme', price: 1000 },
  { id: 'yd1',   kind: 'yurtdisi', code: 'INT-01', title: 'Yurt Dışı Pasaport 5 GB + 100 DK', meta: 'Avrupa & KKTC Dolaşım Paketi • 15 Gün', price: 480 },
  { id: 'yd2',   kind: 'yurtdisi', code: 'INT-02', title: 'Kıbrıs & Azerbaycan 15 GB Konuşma', meta: '30 Günlük Uluslararası Hat Paketi', price: 390 }
];

const INSTITUTIONS = {
  elektrik: [
    'Gediz Elektrik Perakende (İzmir / Manisa)',
    'Aydem Elektrik Perakende (Aydın / Denizli / Muğla)',
    'Enerjisa Elektrik (Başkent / Ayedaş / Toroslar)',
    'CK Boğaziçi Elektrik (İstanbul Avrupa)',
    'Uludağ Elektrik (Bursa / Balıkesir / Çanakkale)',
    'Meram Elektrik MEPAŞ (Konya / Karaman)',
    'Sakarya Elektrik SEPAŞ (Kocaeli / Sakarya)'
  ],
  su: [
    'İZSU — İzmir Su ve Kanalizasyon İdaresi',
    'İSKİ — İstanbul Su ve Kanalizasyon İdaresi',
    'ASKİ — Ankara Su ve Kanalizasyon İdaresi',
    'BUSKİ — Bursa Su ve Kanalizasyon İdaresi',
    'ASAT — Antalya Su ve Atıksu İdaresi',
    'MESKİ — Mersin Su ve Kanalizasyon',
    'MASKİ — Manisa Su ve Kanalizasyon'
  ],
  gaz: [
    'İzmirgaz Doğalgaz Dağıtım A.Ş.',
    'İGDAŞ İstanbul Doğalgaz A.Ş.',
    'Başkent Doğalgaz Dağıtım GYO',
    'Bursagaz / SOCAR Türkiye Doğalgaz',
    'Enerya Doğalgaz (Antalya / Konya / Denizli)',
    'Aksa Doğalgaz Dağıtım A.Ş.'
  ],
  internet: [
    'Türk Telekom Ev İnterneti (TTNET)',
    'Turkcell Superonline Fiber / ADSL',
    'TurkNet Özgür İletişim Fatura',
    'Türksat Kablonet & KabloTV',
    'Vodafone Evde İnternet Tahsilatı',
    'Digiturk / beIN Connect Abonelik',
    'Millenicom İnternet Hizmetleri'
  ],
  kamu: [
    'GİB — MTV Motorlu Taşıtlar Vergisi',
    'EGM — Trafik İdari Para Cezası Tahsilatı',
    'SGK — Bağ-Kur (4B) & GSS Prim Tahsilatı',
    'PTT — HGS Otoyol Bakiye Yükleme',
    'Tapu ve Kadastro Harç Tahsilatı'
  ]
};

const EPIN_ITEMS = [
  { id: 'ep1', code: 'GP-250', title: 'Google Play 250 TL Dijital Kod', cat: 'Mağaza Cüzdan', price: 250 },
  { id: 'ep2', code: 'AP-500', title: 'App Store & iTunes 500 TL Kodu', cat: 'Apple Cüzdan', price: 500 },
  { id: 'ep3', code: 'VL-1450', title: 'Valorant 1.450 VP Riot PIN', cat: 'Oyun E-Pin', price: 375 },
  { id: 'ep4', code: 'PB-660', title: 'PUBG Mobile 660 UC Dijital Kod', cat: 'Oyun E-Pin', price: 390 },
  { id: 'ep5', code: 'ST-400', title: 'Steam 400 TL Cüzdan Kodu', cat: 'PC Oyun', price: 400 },
  { id: 'ep6', code: 'TD-350', title: 'TOD Süper Lig Aylık Taraftar Paketi', cat: 'Dijital Yayın', price: 350 }
];

const BANK_IBANS = [
  { bank: 'Ziraat Bankası (7/24 FAST Otomatik)', holder: 'FATURAPAY ÖDEME HİZMETLERİ A.Ş.', iban: 'TR42 0001 0019 4288 3019 4050 01' },
  { bank: 'Garanti BBVA (Kurumsal Tahsilat)', holder: 'FATURAPAY ÖDEME HİZMETLERİ A.Ş.', iban: 'TR89 0006 2000 4120 0006 2988 14' },
  { bank: 'Türkiye İş Bankası (7/24 Havale/FAST)', holder: 'FATURAPAY ÖDEME HİZMETLERİ A.Ş.', iban: 'TR15 0006 4000 0013 4021 9044 82' },
  { bank: 'Yapı Kredi (Otomatik Ekstre Entegreli)', holder: 'FATURAPAY ÖDEME HİZMETLERİ A.Ş.', iban: 'TR61 0006 7010 0000 0084 1192 05' }
];

const SUB_DEALERS = [
  { code: '#BY-1042', parent: 'Merkez Dağıtıcı', name: 'Ege Merkez İletişim & Fatura', city: 'İzmir / Konak', contact: 'Murat Kaya • 0532 411 20 30', tier: 'gold', balance: 24850.00, limit: 5000, dailyMax: 75000, ipLock: '88.241.12.94', active: true },
  { code: '#BY-1039', parent: 'Merkez Dağıtıcı', name: 'Bornova Bölge Dağıtım A.Ş.', city: 'İzmir / Bornova', contact: 'Selin Demir • 0544 820 11 94', tier: 'vip', balance: 64200.00, limit: 15000, dailyMax: 250000, ipLock: '78.180.44.10', active: true },
  { code: '#BY-1034', parent: '#BY-1039 Alt Bayisi', name: 'Buca Kontör & Telekom Gişesi', city: 'İzmir / Buca', contact: 'Serkan Aydın • 0506 712 88 05', tier: 'gumus', balance: 8420.00, limit: 2000, dailyMax: 40000, ipLock: 'Dinamik (2FA)', active: true },
  { code: '#BY-1028', parent: '#BY-1042 Alt Bayisi', name: 'Karşıyaka Çarşı Ödeme Noktası', city: 'İzmir / Karşıyaka', contact: 'Kemal Özkan • 0535 991 34 67', tier: 'gold', balance: 19740.00, limit: 3500, dailyMax: 60000, ipLock: '85.104.21.19', active: true },
  { code: '#BY-1019', parent: 'Merkez Dağıtıcı', name: 'Manisa Merkez FaturaMatik', city: 'Manisa / Şehzadeler', contact: 'Hakan Çelik • 0533 519 08 77', tier: 'bronz', balance: 3150.00, limit: 0, dailyMax: 20000, ipLock: 'Dinamik (2FA)', active: true }
];

const CASHIERS = [
  { user: 'kasiyer_elif', name: 'Elif Yılmaz (Gişe-1)', role: 'Kasiyer (TL & Fatura Yetkili)', dailyLimit: 15000, usedToday: 6420, canCancel: false, active: true },
  { user: 'vardiya_burak', name: 'Burak Demir (Gişe-2)', role: 'Kıdemli Gişe Sorumlusu', dailyLimit: 35000, usedToday: 11280, canCancel: true, active: true }
];

const LEDGER = [
  { ref: 'FP-90421', date: 'Bugün 14:08', day: 'today', status: 'ok', type: 'Fatura Tahsilat', provider: 'İZSU İzmir Su', target: 'Abone: 40918274', before: 25262.80, amount: 427.80, profit: 15.00, after: 24850.00 },
  { ref: 'FP-90418', date: 'Bugün 13:51', day: 'today', status: 'ok', type: 'GSM Paket Yükleme', provider: 'Turkcell Süper 20 GB', target: '0532 418 92 10', before: 25571.28, amount: 320.00, profit: 11.52, after: 25262.80 },
  { ref: 'FP-90411', date: 'Bugün 13:24', day: 'today', status: 'pending', type: 'GSM TL Yükleme', provider: 'Vodafone 250 TL Kontör', target: '0542 881 19 04', before: 25811.28, amount: 250.00, profit: 10.00, after: 25571.28 },
  { ref: 'FP-90398', date: 'Bugün 12:35', day: 'today', status: 'ok', type: 'Çoklu Fatura (2 Adet)', provider: 'Gediz Elektrik + İzmirgaz', target: 'Abone: 1008492031', before: 27941.88, amount: 2160.60, profit: 30.00, after: 25811.28 },
  { ref: 'POS-49201', date: 'Bugün 11:10', day: 'today', status: 'ok', type: '3D Sanal POS Yükleme', provider: 'PayTR 3D Secure POS', target: 'Bonus Kart **** 8821', before: 17941.88, amount: 10000.00, profit: 0, after: 27941.88 },
  { ref: 'EP-33019', date: 'Dün 18:42', day: 'old', status: 'ok', type: 'Dijital E-Pin', provider: 'Valorant 1.450 VP Kod', target: 'Kod: VP-992A-7741', before: 18299.98, amount: 375.00, profit: 16.88, after: 17941.88 }
];

const WIRE_QUEUE = [
  { id: 501, date: 'Bugün 13:58', dealer: 'Buca Kontör & Telekom (#BY-1034)', bank: 'Ziraat Bankası FAST • Dekont #994120', amount: 7500.00, status: 'pending' },
  { id: 502, date: 'Bugün 13:12', dealer: 'Manisa Merkez FaturaMatik (#BY-1019)', bank: 'Garanti BBVA Havale • Dekont #441802', amount: 4000.00, status: 'pending' }
];

const DEALER_APPLICATIONS = [
  { id: 701, date: 'Bugün 13:40', company: 'Alsancak Telekom & Ödeme Noktası', owner: 'Onur Şahin', phone: '0532 609 14 88', city: 'İzmir / Konak', tier: 'gold', status: 'pending' }
];

const TICKETS = [
  { id: '#TLP-409', date: 'Bugün 12:50', subject: 'FP-90411 nolu Vodafone işlem durumu sorgusu', category: 'İşlem / API Kontrol', status: 'Yanıtlandı', reply: 'Operatör kuyruğunda, 2 dk içinde tamamlanmazsa Cron otomatik bakiye iadesi yapacaktır.' }
];

const IP_LOGS = [
  { time: 'Bugün 14:10', actor: 'Ege Merkez (#BY-1042)', ip: '88.241.12.94', location: 'İzmir / TR', event: 'Başarılı Bayi Girişi (SSL + Statik IP Eşleşti)', ok: true },
  { time: 'Bugün 13:44', actor: 'kasiyer_elif (Alt Kullanıcı)', ip: '88.241.12.94', location: 'İzmir / TR', event: 'Gişe-1 Oturumu Açıldı (Limit: ₺15.000)', ok: true },
  { time: 'Bugün 11:19', actor: 'Manisa Merkez (#BY-1019)', ip: '176.42.90.11', location: 'Manisa / TR', event: 'Farklı IP Algılandı → Netgsm 2FA SMS Onayı İle Doğrulandı', ok: false }
];

// ==================== UTILITIES ====================
function fmtTL(n) {
  return '₺' + Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function playBeep() {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch {}
}

function toast(msg) {
  playBeep();
  const el = document.getElementById('toastBox');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => el.classList.remove('show'), 3600);
}

// ==================== WORLD & VIEW NAVIGATION ====================
function switchWorld(worldName, btnEl) {
  STATE.world = worldName;
  document.querySelectorAll('.world-tab').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const sf = document.getElementById('world-storefront');
  const pt = document.getElementById('world-portal');

  if (worldName === 'storefront') {
    sf.classList.add('active');
    pt.classList.remove('active');
  } else {
    sf.classList.remove('active');
    pt.classList.add('active');
    if (worldName === 'adminworld') {
      openPortalView('admin');
    } else {
      openPortalView('overview');
    }
  }
}

function openPortalView(viewId, navBtn) {
  if (STATE.world === 'storefront') {
    switchWorld('portal', document.querySelectorAll('.world-tab')[1]);
  }
  document.querySelectorAll('.p-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('pview-' + viewId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-view') === viewId);
  });
  if (navBtn) navBtn.classList.add('active');
}

function jumpTerminalService(srvKey) {
  openPortalView('terminal');
  const btn = document.querySelector(`.srv-tab[data-srv="${srvKey}"]`);
  if (btn) switchServiceTab(srvKey, btn);
}

function switchServiceTab(srvKey, btn) {
  document.querySelectorAll('.srv-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.srv-pane').forEach(p => p.classList.remove('active'));
  document.getElementById('spane-' + srvKey)?.classList.add('active');
}

// ==================== WALLET & KPI SYNC ====================
function syncWalletUI() {
  const tierObj = STATE.tiers[STATE.activeTierKey];
  const availWithCredit = STATE.balance + STATE.creditLimit;

  document.getElementById('topBalTxt').textContent = fmtTL(STATE.balance);
  document.getElementById('topProfitTxt').textContent = fmtTL(STATE.dailyProfit);
  document.getElementById('topLimitTxt').textContent = fmtTL(availWithCredit);
  document.getElementById('topTierBadge').textContent = `${tierObj.name.toUpperCase()} • %${tierObj.gsmDisc.toFixed(1).replace('.', ',')}`;

  document.getElementById('kpiBal').textContent = fmtTL(STATE.balance);
  document.getElementById('kpiProfit').textContent = fmtTL(STATE.dailyProfit);
  document.getElementById('kpiTxCount').textContent = STATE.dailyTxCount + ' İşlem';

  SUB_DEALERS[0].balance = STATE.balance;
  renderSubDealers();
  renderOperators();
  renderGsmPackages();
}

// ==================== STOREFRONT B2C & DEALER APPLICATION ====================
function switchB2cTab(mode, btn) {
  document.querySelectorAll('.b2c-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('b2c-tl').style.display = mode === 'tl' ? 'block' : 'none';
  document.getElementById('b2c-bill').style.display = mode === 'bill' ? 'block' : 'none';
}

function submitB2cDemoOrder(kind) {
  toast(`✓ Bireysel 3D Secure Ödeme Ekranına yönlendirildi (${kind}) — Bayi panelinden tüm detayları test edebilirsiniz.`);
  switchWorld('portal', document.querySelectorAll('.world-tab')[1]);
  jumpTerminalService(kind === 'TL' ? 'gsm' : 'bill');
}

function submitPublicDealerApplication() {
  const comp = document.getElementById('appCompany').value.trim();
  const owner = document.getElementById('appOwner').value.trim();
  const phone = document.getElementById('appPhone').value.trim();
  const city = document.getElementById('appCity').value.trim();
  const tier = document.getElementById('appTier').value;
  if (!comp || !phone) return toast('Lütfen işletme adı ve cep telefonu alanlarını doldurun.');

  DEALER_APPLICATIONS.unshift({
    id: Date.now(),
    date: 'Şimdi',
    company: comp,
    owner: owner || 'Yetkili',
    phone,
    city: city || 'Türkiye',
    tier,
    status: 'pending'
  });
  renderAdminQueues();
  toast('🎉 Bayilik başvurunuz alındı! Süper Admin onay kuyruğuna canlı olarak düştü.');
  switchWorld('adminworld', document.querySelectorAll('.world-tab')[2]);
}

// ==================== GSM TERMINAL + NUMBER HISTORY + BULK TOPUP ====================
function renderOperators() {
  const baseDisc = STATE.tiers[STATE.activeTierKey].gsmDisc;
  const grid = document.getElementById('opGrid');
  if (!grid) return;
  grid.innerHTML = OPERATORS.map(op => {
    const eff = (baseDisc + op.bonus).toFixed(1).replace('.', ',');
    const isSel = STATE.selectedOp.code === op.code;
    return `
      <div class="op-card ${isSel ? 'selected' : ''}" onclick="selectOp('${op.code}')">
        <div class="op-emblem" style="background:${op.color}; color:${op.textColor};">${op.code}</div>
        <div class="op-nm">${op.name}</div>
        <div class="op-dsc">%${eff} Kâr</div>
      </div>
    `;
  }).join('');
}

function selectOp(code) {
  const found = OPERATORS.find(o => o.code === code) || OPERATORS[0];
  STATE.selectedOp = { code: found.code, name: found.name, bonusDisc: found.bonus };
  renderOperators();
  renderGsmPackages();
}

function setPkgFilter(kind, btn) {
  STATE.pkgFilter = kind;
  btn.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  const list = GSM_PACKAGES.filter(p => kind === 'all' || p.kind === kind);
  if (!list.some(p => p.id === STATE.selectedPkgId) && list[0]) STATE.selectedPkgId = list[0].id;
  renderGsmPackages();
}

function renderGsmPackages() {
  const list = GSM_PACKAGES.filter(p => STATE.pkgFilter === 'all' || p.kind === STATE.pkgFilter);
  const wrap = document.getElementById('gsmPkgList');
  if (!wrap) return;

  wrap.innerHTML = list.map(p => `
    <div class="pkg-box ${p.id === STATE.selectedPkgId ? 'selected' : ''}" onclick="STATE.selectedPkgId='${p.id}'; renderGsmPackages();">
      <div>
        <span class="pkg-code">[${p.code}]</span>
        <div class="pkg-t">${STATE.selectedOp.name} ${p.title}</div>
        <div class="pkg-m">${p.meta}</div>
      </div>
      <div class="pkg-p">₺${p.price}</div>
    </div>
  `).join('');

  const pkg = GSM_PACKAGES.find(p => p.id === STATE.selectedPkgId) || GSM_PACKAGES[0];
  const effDisc = STATE.tiers[STATE.activeTierKey].gsmDisc + STATE.selectedOp.bonusDisc;
  const profit = +(pkg.price * (effDisc / 100)).toFixed(2);
  const cost = +(pkg.price - profit).toFixed(2);
  const apiRawCost = +(cost - pkg.price * 0.008).toFixed(2);

  document.getElementById('gsmRetailOut').textContent = fmtTL(pkg.price);
  document.getElementById('gsmDiscOut').textContent = '%' + effDisc.toFixed(1).replace('.', ',');
  document.getElementById('gsmCostOut').textContent = fmtTL(cost);
  document.getElementById('gsmApiRawOut').textContent = fmtTL(apiRawCost);
  document.getElementById('gsmProfitOut').textContent = '+' + fmtTL(profit);
}

function checkMnpAndHistory() {
  const num = document.getElementById('gsmNumberInput').value.trim() || '0532 418 92 10';
  const past = LEDGER.filter(x => x.target.includes(num.slice(0, 4)));
  const box = document.getElementById('numHistoryBox');
  box.style.display = 'block';
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <strong>📡 BTK MNP Şebeke: ${STATE.selectedOp.name} Faturalı/Ön Ödemeli Aktif</strong>
      <span class="badge b-ok">${past.length + 2} Geçmiş İşlem</span>
    </div>
    <div style="font-size:11.5px; color:var(--muted); margin-top:4px;">
      Son Yükleme: Bugün 13:51 • Süper 20 GB (₺320,00) — Kara liste kaydı yok, yüklemeye uygun.
    </div>
  `;
  toast(`✓ MNP & Abone Geçmişi sorgulandı: ${num}`);
}

function executeGsmSingle() {
  const num = document.getElementById('gsmNumberInput').value.trim() || '0532 418 92 10';
  const pkg = GSM_PACKAGES.find(p => p.id === STATE.selectedPkgId) || GSM_PACKAGES[0];
  const effDisc = STATE.tiers[STATE.activeTierKey].gsmDisc + STATE.selectedOp.bonusDisc;
  const profit = +(pkg.price * (effDisc / 100)).toFixed(2);
  const cost = +(pkg.price - profit).toFixed(2);

  if (STATE.balance + STATE.creditLimit < cost) {
    return toast('❌ Cari bakiye + kredi limitiniz bu işlem için yetersiz!');
  }

  const before = STATE.balance;
  STATE.balance = +(STATE.balance - cost).toFixed(2);
  STATE.dailyProfit = +(STATE.dailyProfit + profit).toFixed(2);
  STATE.dailyTxCount++;

  const tx = {
    ref: 'FP-' + Math.floor(90500 + Math.random() * 900),
    date: 'Şimdi',
    day: 'today',
    status: 'ok',
    type: 'GSM TL/Paket',
    provider: `${STATE.selectedOp.name} ${pkg.title}`,
    target: num,
    before,
    amount: pkg.price,
    profit,
    after: STATE.balance
  };
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  openReceiptModal(tx);
  toast(`✓ ${num} numarasına ${pkg.title} başarıyla yüklendi!`);
}

function executeBulkGsm() {
  const raw = document.getElementById('bulkPhonesInput').value.trim();
  const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (lines.length === 0) return toast('Lütfen her satıra bir GSM numarası girin.');
  const unitPrice = 250;
  const effDisc = STATE.tiers[STATE.activeTierKey].gsmDisc;
  const totalRetail = lines.length * unitPrice;
  const totalProfit = +(totalRetail * (effDisc / 100)).toFixed(2);
  const totalCost = +(totalRetail - totalProfit).toFixed(2);

  if (STATE.balance + STATE.creditLimit < totalCost) return toast('Toplu işlem için cari limit yetersiz!');

  const before = STATE.balance;
  STATE.balance = +(STATE.balance - totalCost).toFixed(2);
  STATE.dailyProfit = +(STATE.dailyProfit + totalProfit).toFixed(2);
  STATE.dailyTxCount += lines.length;

  const tx = {
    ref: 'TPL-' + Math.floor(60000 + Math.random() * 9000),
    date: 'Şimdi',
    day: 'today',
    status: 'ok',
    type: `Toplu TL (${lines.length} Hat)`,
    provider: `${STATE.selectedOp.name} 250 TL Toplu Gönderim`,
    target: `${lines[0]} + ${lines.length - 1} numara`,
    before,
    amount: totalRetail,
    profit: totalProfit,
    after: STATE.balance
  };
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  openReceiptModal(tx);
  toast(`✓ ${lines.length} adet numaraya toplu API yüklemesi başlatıldı ve onaylandı!`);
}

// ==================== 200+ INSTITUTION BILLS, BARCODE & MULTI-PERIOD CART ====================
function selectBillCategory(cat, chipBtn) {
  STATE.activeBillCat = cat;
  if (chipBtn) {
    chipBtn.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chipBtn.classList.add('active');
  }
  const sel = document.getElementById('instSelect');
  sel.innerHTML = INSTITUTIONS[cat].map((name, idx) => `<option value="${idx}">${name}</option>`).join('');
  querySubscriberInvoices();
}

function simulateBarcodeScan() {
  const randomSub = String(Math.floor(1004000000 + Math.random() * 890000000));
  document.getElementById('billSubNo').value = randomSub;
  querySubscriberInvoices();
  toast(`📷 Barkod Okuyucu: #${randomSub} abone faturası otomatik getirildi!`);
}

function querySubscriberInvoices() {
  const idx = Number(document.getElementById('instSelect')?.value || 0);
  const instName = INSTITUTIONS[STATE.activeBillCat][idx];
  const subNo = document.getElementById('billSubNo')?.value.trim() || '1008492031';
  const customFee = Number(document.getElementById('billServiceFee')?.value || STATE.tiers[STATE.activeTierKey].billComm);

  // Return 2 realistic periods (1 current + 1 previous/overdue) so dealer can select 1 or both!
  STATE.queriedInvoices = [
    {
      uid: subNo + '-10',
      period: '2026/10 Güncel Dönem',
      due: '05.11.2026',
      owner: 'M*** A*** K***',
      inst: instName,
      subNo,
      base: 845.60,
      lateFee: 0,
      serviceFee: customFee,
      selected: true
    },
    {
      uid: subNo + '-09',
      period: '2026/09 Gecikmeli Dönem',
      due: '05.10.2026 (Gecikmeli)',
      owner: 'M*** A*** K***',
      inst: instName,
      subNo,
      base: 612.40,
      lateFee: 18.50,
      serviceFee: customFee,
      selected: false
    }
  ];
  renderQueriedInvoices();
}

function renderQueriedInvoices() {
  const box = document.getElementById('queriedInvoicesList');
  if (!box) return;
  box.innerHTML = STATE.queriedInvoices.map((inv, idx) => {
    const rowTotal = +(inv.base + inv.lateFee + inv.serviceFee).toFixed(2);
    return `
      <label style="display:flex; justify-content:space-between; align-items:center; gap:10px; padding:9px 11px; border:1px solid var(--border-strong); border-radius:8px; margin-bottom:7px; background:var(--surface); cursor:pointer;">
        <div style="display:flex; align-items:center; gap:10px;">
          <input type="checkbox" ${inv.selected ? 'checked' : ''} onchange="STATE.queriedInvoices[${idx}].selected=this.checked; updateSelectedBillSummary();" />
          <div>
            <strong style="font-size:12.5px; color:var(--ink);">${inv.inst.split('(')[0].trim()} — ${inv.period}</strong>
            <div style="font-size:11px; color:var(--muted);">Abone: ${inv.subNo} (${inv.owner}) • Son Ödeme: ${inv.due}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <strong style="font-size:13.5px; color:var(--primary);">${fmtTL(rowTotal)}</strong>
          <div style="font-size:10.5px; color:var(--emerald);">+${fmtTL(inv.serviceFee)} Kâr</div>
        </div>
      </label>
    `;
  }).join('');
  updateSelectedBillSummary();
}

function updateSelectedBillSummary() {
  const chosen = STATE.queriedInvoices.filter(i => i.selected);
  const baseSum = chosen.reduce((s, i) => s + i.base + i.lateFee, 0);
  const feeSum = chosen.reduce((s, i) => s + i.serviceFee, 0);
  document.getElementById('qBaseSum').textContent = fmtTL(baseSum);
  document.getElementById('qFeeSum').textContent = '+' + fmtTL(feeSum);
  document.getElementById('qTotalSum').textContent = fmtTL(baseSum + feeSum);
}

function paySelectedBillsDirect() {
  const chosen = STATE.queriedInvoices.filter(i => i.selected);
  if (chosen.length === 0) return toast('Lütfen tahsil edilecek en az 1 fatura dönemi seçin.');
  const baseSum = +(chosen.reduce((s, i) => s + i.base + i.lateFee, 0)).toFixed(2);
  const feeSum = +(chosen.reduce((s, i) => s + i.serviceFee, 0)).toFixed(2);
  if (STATE.balance + STATE.creditLimit < baseSum) return toast('Cari limit yetersiz!');

  const before = STATE.balance;
  STATE.balance = +(STATE.balance - baseSum).toFixed(2);
  STATE.dailyProfit = +(STATE.dailyProfit + feeSum).toFixed(2);
  STATE.dailyTxCount += chosen.length;

  const tx = {
    ref: 'FT-' + Math.floor(92000 + Math.random() * 7000),
    date: 'Şimdi',
    day: 'today',
    status: 'ok',
    type: chosen.length > 1 ? `Fatura (${chosen.length} Dönem)` : 'Fatura Tahsilat',
    provider: chosen[0].inst.split('—')[0].trim(),
    target: `Abone: ${chosen[0].subNo}`,
    before,
    amount: +(baseSum + feeSum).toFixed(2),
    profit: feeSum,
    after: STATE.balance
  };
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  openReceiptModal(tx);
  toast(`✓ ${chosen.length} adet fatura online kapaması yapıldı!`);
}

function pushSelectedToBillCart() {
  const chosen = STATE.queriedInvoices.filter(i => i.selected);
  if (chosen.length === 0) return toast('Sepete eklemek için fatura seçin.');
  chosen.forEach(c => STATE.billCart.push({ ...c }));
  renderMultiBillCart();
  toast(`🧺 ${chosen.length} fatura çoklu tahsilat sepetine eklendi.`);
}

function renderMultiBillCart() {
  const wrap = document.getElementById('multiCartWrap');
  if (STATE.billCart.length === 0) {
    wrap.style.display = 'none';
    return;
  }
  wrap.style.display = 'block';
  document.getElementById('multiCartCount').textContent = STATE.billCart.length;
  const total = STATE.billCart.reduce((s, x) => s + x.base + x.lateFee + x.serviceFee, 0);
  document.getElementById('multiCartTotal').textContent = fmtTL(total);
  document.getElementById('multiCartRows').innerHTML = STATE.billCart.map((c, idx) => `
    <div class="c-row">
      <span>${idx + 1}. ${c.inst.split('(')[0].trim()} (${c.period})</span>
      <strong>${fmtTL(c.base + c.lateFee + c.serviceFee)}</strong>
    </div>
  `).join('');
}

function clearMultiBillCart() {
  STATE.billCart = [];
  renderMultiBillCart();
}

function checkoutMultiBillCart() {
  if (STATE.billCart.length === 0) return;
  const baseSum = +(STATE.billCart.reduce((s, i) => s + i.base + i.lateFee, 0)).toFixed(2);
  const feeSum = +(STATE.billCart.reduce((s, i) => s + i.serviceFee, 0)).toFixed(2);
  if (STATE.balance + STATE.creditLimit < baseSum) return toast('Sepet toplamı için cari bakiye yetersiz!');

  const count = STATE.billCart.length;
  const before = STATE.balance;
  STATE.balance = +(STATE.balance - baseSum).toFixed(2);
  STATE.dailyProfit = +(STATE.dailyProfit + feeSum).toFixed(2);
  STATE.dailyTxCount += count;

  const tx = {
    ref: 'SEP-' + Math.floor(81000 + Math.random() * 8000),
    date: 'Şimdi',
    day: 'today',
    status: 'ok',
    type: `Sepet Tahsilat (${count} Fatura)`,
    provider: `${count} Farklı Fatura Toplu Kapama`,
    target: 'Çoklu Müşteri Sepeti',
    before,
    amount: +(baseSum + feeSum).toFixed(2),
    profit: feeSum,
    after: STATE.balance
  };
  STATE.billCart = [];
  renderMultiBillCart();
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  openReceiptModal(tx);
  toast(`✓ Sepetteki ${count} fatura tek işlemde tahsil edildi!`);
}

// ==================== E-PIN & SMS CODE DELIVERY ====================
function renderEpinCatalog() {
  const disc = STATE.tiers[STATE.activeTierKey].epinDisc;
  const box = document.getElementById('epinCatalogGrid');
  if (!box) return;
  box.innerHTML = EPIN_ITEMS.map(e => {
    const prof = +(e.price * (disc / 100)).toFixed(2);
    return `
      <div class="pkg-box ${e.id === STATE.selectedEpinId ? 'selected' : ''}" onclick="STATE.selectedEpinId='${e.id}'; renderEpinCatalog();">
        <div>
          <span class="pkg-code">[${e.code}] • ${e.cat}</span>
          <div class="pkg-t">${e.title}</div>
          <div class="pkg-m">Bayi Net Kârı: +${fmtTL(prof)} (%${disc.toFixed(1).replace('.', ',')})</div>
        </div>
        <div class="pkg-p">₺${e.price}</div>
      </div>
    `;
  }).join('');
}

function buyEpinNow() {
  const item = EPIN_ITEMS.find(x => x.id === STATE.selectedEpinId) || EPIN_ITEMS[0];
  const disc = STATE.tiers[STATE.activeTierKey].epinDisc;
  const profit = +(item.price * (disc / 100)).toFixed(2);
  const cost = +(item.price - profit).toFixed(2);
  const smsPhone = document.getElementById('epinSmsPhone').value.trim() || '0541 191 86 11';

  if (STATE.balance + STATE.creditLimit < cost) return toast('Cari limit yetersiz!');
  const pin = item.code + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

  const before = STATE.balance;
  STATE.balance = +(STATE.balance - cost).toFixed(2);
  STATE.dailyProfit = +(STATE.dailyProfit + profit).toFixed(2);
  STATE.dailyTxCount++;

  const tx = {
    ref: 'EP-' + Math.floor(41000 + Math.random() * 8000),
    date: 'Şimdi',
    day: 'today',
    status: 'ok',
    type: 'Dijital E-Pin',
    provider: item.title,
    target: `PIN: ${pin} (SMS: ${smsPhone})`,
    before,
    amount: item.price,
    profit,
    after: STATE.balance
  };
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  openReceiptModal(tx);
  toast(`🔑 PIN Üretildi (${pin}) ve Netgsm ile ${smsPhone} numarasına SMS gönderildi!`);
}

// ==================== 3D SECURE VIRTUAL POS (BIN DETECTION + 3D OTP MODAL) & IBAN ====================
function detectBinAndRenderInstallments() {
  const numRaw = (document.getElementById('ccNumInput')?.value || '4543 6012 8840 8821').replace(/\s+/g, '');
  const amt = Math.max(100, Number(document.getElementById('posTopupAmt')?.value || 5000));
  const gw = document.getElementById('posGateway')?.value || 'PayTR 3D POS';

  let bankBrand = 'Garanti Bonus • Ticari Kart';
  if (numRaw.startsWith('54')) bankBrand = 'Yapı Kredi World • Business';
  else if (numRaw.startsWith('4506') || numRaw.startsWith('55')) bankBrand = 'İş Bankası Maximum';
  else if (numRaw.startsWith('4022') || numRaw.startsWith('52')) bankBrand = 'Akbank Axess Kurumsal';

  document.getElementById('ccVisualNum').textContent = (document.getElementById('ccNumInput')?.value || '4543 •••• •••• 8821');
  document.getElementById('ccVisualBank').textContent = `${gw} • ${bankBrand}`;

  const baseRate = STATE.tiers[STATE.activeTierKey].posRate / 100;
  const plans = [
    { count: 1, label: 'Tek Çekim', rate: baseRate },
    { count: 3, label: '3 Taksit',  rate: baseRate + 0.024 },
    { count: 6, label: '6 Taksit',  rate: baseRate + 0.052 },
    { count: 12,label: '12 Taksit', rate: baseRate + 0.108 }
  ];

  const selCount = Number(document.querySelector('input[name="instPlan"]:checked')?.value || 1);
  const tbody = document.getElementById('installmentBody');
  if (tbody) {
    tbody.innerHTML = plans.map(p => {
      const fee = +(amt * p.rate).toFixed(2);
      const gross = +(amt + fee).toFixed(2);
      const monthly = +(gross / p.count).toFixed(2);
      return `
        <tr>
          <td><label style="cursor:pointer; font-weight:700;"><input type="radio" name="instPlan" value="${p.count}" ${p.count === selCount ? 'checked' : ''} onchange="detectBinAndRenderInstallments()" /> ${p.label}</label></td>
          <td>%${(p.rate * 100).toFixed(2).replace('.', ',')}</td>
          <td>${fmtTL(monthly)} × ${p.count}</td>
          <td><strong>${fmtTL(gross)}</strong></td>
        </tr>
      `;
    }).join('');
  }
}

function trigger3dSecureModal() {
  const amt = Math.max(100, Number(document.getElementById('posTopupAmt')?.value || 5000));
  const gw = document.getElementById('posGateway')?.value || 'PayTR 3D POS';
  STATE.pending3dPayment = { amt, gw };
  document.getElementById('otp3dAmountTxt').textContent = fmtTL(amt);
  document.getElementById('otp3dGatewayTxt').textContent = gw;
  document.getElementById('modal3dBackdrop').classList.add('open');
}

function confirm3dOtpPayment() {
  if (!STATE.pending3dPayment) return;
  const { amt, gw } = STATE.pending3dPayment;
  document.getElementById('modal3dBackdrop').classList.remove('open');

  const before = STATE.balance;
  STATE.balance = +(STATE.balance + amt).toFixed(2);
  const tx = {
    ref: 'POS-' + Math.floor(50000 + Math.random() * 9000),
    date: 'Şimdi',
    day: 'today',
    status: 'ok',
    type: '3D Sanal POS Yükleme',
    provider: gw + ' (HMAC Webhook Onaylı)',
    target: '3D SMS Onaylı Otomatik Cari',
    before,
    amount: amt,
    profit: 0,
    after: STATE.balance
  };
  STATE.pending3dPayment = null;
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  toast(`🔒 3D Secure SMS doğrulandı! ${fmtTL(amt)} saniyesinde cari kasaya yüklendi.`);
}

function renderBankIbans() {
  const box = document.getElementById('ibanListWrap');
  if (!box) return;
  box.innerHTML = BANK_IBANS.map(b => `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:9px 11px; border:1px solid var(--border); border-radius:8px; margin-bottom:7px; background:var(--surface-2);">
      <div>
        <strong style="font-size:12px; display:block;">${b.bank}</strong>
        <span style="font-family:var(--font-mono); font-size:11.5px; color:var(--primary);">${b.iban}</span>
      </div>
      <button class="btn btn-outline btn-xs" onclick="navigator.clipboard?.writeText('${b.iban}'); toast('📋 IBAN panoya kopyalandı!');">Kopyala</button>
    </div>
  `).join('');
}

function sendWireNotification() {
  const amt = Math.max(100, Number(document.getElementById('wireAmtInput')?.value || 5000));
  const bank = document.getElementById('wireBankSelect')?.value || 'Ziraat Bankası FAST';
  const ref = document.getElementById('wireDecontInput')?.value.trim() || ('FAST-' + Math.floor(100000 + Math.random() * 800000));

  WIRE_QUEUE.unshift({
    id: Date.now(),
    date: 'Şimdi',
    dealer: 'Ege Merkez İletişim (#BY-1042)',
    bank: `${bank} • Dekont: ${ref}`,
    amount: amt,
    status: 'pending'
  });
  renderAdminQueues();
  toast('✓ Havale/FAST bildiriminiz Süper Admin onay ekranına iletildi!');
}

// ==================== CASHIER SUB-USERS ====================
function renderCashiers() {
  const tb = document.getElementById('cashiersBody');
  if (!tb) return;
  tb.innerHTML = CASHIERS.map((c, idx) => `
    <tr>
      <td><strong>${c.name}</strong><div style="font-size:11px; color:var(--muted);">@${c.user}</div></td>
      <td>${c.role}</td>
      <td>${fmtTL(c.usedToday)} / <strong>${fmtTL(c.dailyLimit)}</strong></td>
      <td><span class="badge ${c.canCancel ? 'b-ok' : 'b-wait'}">${c.canCancel ? 'İptal Yetkili' : 'Sadece Satış'}</span></td>
      <td><button class="btn btn-outline btn-xs" onclick="CASHIERS[${idx}].active=!CASHIERS[${idx}].active; renderCashiers();">${c.active ? 'Aktif (Kapat)' : 'Pasif (Aç)'}</button></td>
    </tr>
  `).join('');
}

function addCashierUser() {
  const nm = document.getElementById('newCashierName').value.trim();
  const lim = Math.max(1000, Number(document.getElementById('newCashierLimit').value || 10000));
  if (!nm) return toast('Lütfen personel adı girin.');
  CASHIERS.unshift({
    user: 'gise_' + Math.floor(10 + Math.random() * 89),
    name: nm,
    role: 'Gişe Kasiyeri (Sınırlı Yetki)',
    dailyLimit: lim,
    usedToday: 0,
    canCancel: false,
    active: true
  });
  document.getElementById('newCashierName').value = '';
  renderCashiers();
  toast(`✓ Alt kullanıcı (${nm}) günlük ${fmtTL(lim)} işlem limitiyle tanımlandı!`);
}

// ==================== LEDGER, Z-REPORT & TICKETS ====================
function renderLedgerTables(onlyToday = false) {
  const statusFilter = document.getElementById('ledgerStatusFilter')?.value || 'all';
  const rows = LEDGER.filter(x => (!onlyToday || x.day === 'today') && (statusFilter === 'all' || x.status === statusFilter));

  const miniHtml = LEDGER.slice(0, 6).map((t, i) => `
    <tr>
      <td>
        <strong style="display:block;">${t.provider}</strong>
        <span style="font-size:11px; color:var(--muted);">${t.target} • ${t.date}</span>
      </td>
      <td><strong>${fmtTL(t.amount)}</strong></td>
      <td class="txt-profit">${t.profit > 0 ? '+' + fmtTL(t.profit) : '—'}</td>
      <td><button class="btn btn-outline btn-xs" onclick="openReceiptByRef('${t.ref}')">Fiş</button></td>
    </tr>
  `).join('');

  const ovTb = document.getElementById('ovMiniTxBody');
  const tmTb = document.getElementById('termMiniTxBody');
  if (ovTb) ovTb.innerHTML = miniHtml;
  if (tmTb) tmTb.innerHTML = miniHtml;

  const fullTb = document.getElementById('ledgerFullBody');
  if (fullTb) {
    fullTb.innerHTML = rows.map(t => `
      <tr>
        <td><strong>#${t.ref}</strong><div style="font-size:10.5px; color:var(--muted);">${t.date}</div></td>
        <td><span class="badge b-pri">${t.type}</span></td>
        <td><strong>${t.provider}</strong><div style="font-size:11px; color:var(--muted);">${t.target}</div></td>
        <td>${fmtTL(t.before)}</td>
        <td><strong>${fmtTL(t.amount)}</strong></td>
        <td class="txt-profit">${t.profit > 0 ? '+' + fmtTL(t.profit) : '—'}</td>
        <td><strong>${fmtTL(t.after)}</strong></td>
        <td><span class="badge ${t.status === 'ok' ? 'b-ok' : 'b-wait'}">${t.status === 'ok' ? 'Onaylandı' : 'Operatörde'}</span></td>
        <td><button class="btn btn-outline btn-xs" onclick="openReceiptByRef('${t.ref}')">Dekont</button></td>
      </tr>
    `).join('');
  }
}

function downloadLedgerCsv() {
  const head = ['Ref', 'Tarih', 'Tur', 'Kurum_Operator', 'Abone_Detay', 'Onceki_Bakiye', 'Tutar', 'Net_Kar', 'Sonraki_Bakiye', 'Durum'];
  const lines = LEDGER.map(t => [t.ref, t.date, t.type, t.provider, t.target, t.before, t.amount, t.profit, t.after, t.status]);
  const csv = '\uFEFF' + [head, ...lines].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'faturapay-cari-ekstre.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('📥 Muhasebe cari ekstresi Excel (.CSV) formatında indirildi!');
}

function openZReportModal() {
  const todayRows = LEDGER.filter(x => x.day === 'today' && x.status === 'ok');
  const turnover = todayRows.reduce((s, x) => s + x.amount, 0);
  const profit = todayRows.reduce((s, x) => s + x.profit, 0);
  document.getElementById('zRepCount').textContent = todayRows.length + ' Başarılı İşlem';
  document.getElementById('zRepTurnover').textContent = fmtTL(turnover);
  document.getElementById('zRepProfit').textContent = '+' + fmtTL(profit);
  document.getElementById('zRepClosing').textContent = fmtTL(STATE.balance);
  document.getElementById('zReportBackdrop').classList.add('open');
}

function renderTickets() {
  const tb = document.getElementById('ticketsBody');
  if (!tb) return;
  tb.innerHTML = TICKETS.map(t => `
    <tr>
      <td><strong>${t.id}</strong><div style="font-size:10.5px; color:var(--muted);">${t.date}</div></td>
      <td><strong>${t.subject}</strong><div style="font-size:11.5px; color:var(--emerald); margin-top:3px;">Yanıt: ${t.reply}</div></td>
      <td><span class="badge b-pri">${t.category}</span></td>
      <td><span class="badge b-ok">${t.status}</span></td>
    </tr>
  `).join('');
}

function createSupportTicket() {
  const subj = document.getElementById('ticketSubject').value.trim();
  const cat = document.getElementById('ticketCat').value;
  if (!subj) return toast('Lütfen talep konusunu yazın.');
  TICKETS.unshift({
    id: '#TLP-' + Math.floor(410 + Math.random() * 500),
    date: 'Şimdi',
    subject: subj,
    category: cat,
    status: 'Merkez İnceliyor',
    reply: 'Destek talebiniz merkez operasyon birimine iletildi (Netgsm SMS bildirimi aktif).'
  });
  document.getElementById('ticketSubject').value = '';
  renderTickets();
  toast('🎧 Destek / İade talebiniz oluşturuldu!');
}

// ==================== SUPER ADMIN: DEALERS, PRICE GROUPS MATRIX, QUEUES & CRON ====================
function renderSubDealers() {
  const q = (document.getElementById('subDealerSearch')?.value || '').toLowerCase();
  const filtered = SUB_DEALERS.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.city.toLowerCase().includes(q));
  document.getElementById('navDealerBadge').textContent = SUB_DEALERS.length + 14;

  const tb = document.getElementById('subDealersTable');
  if (!tb) return;
  tb.innerHTML = filtered.map((d, idx) => `
    <tr>
      <td>
        <strong>${d.name}</strong>
        <div style="font-size:11px; color:var(--muted);">${d.code} • Üst: ${d.parent} (${d.city})</div>
      </td>
      <td>${d.contact}<div style="font-size:10.5px; color:var(--primary);">IP: ${d.ipLock}</div></td>
      <td><span class="badge b-pri">${STATE.tiers[d.tier]?.name || d.tier}</span></td>
      <td><strong>${fmtTL(d.balance)}</strong><div style="font-size:10.5px; color:var(--muted);">Kredi: +${fmtTL(d.limit)}</div></td>
      <td><span class="badge ${d.active ? 'b-ok' : 'b-err'}">${d.active ? 'Aktif' : 'Askıda'}</span></td>
      <td>
        <div style="display:flex; gap:5px; flex-wrap:wrap;">
          <button class="btn btn-outline btn-xs" onclick="adjustSubDealer(${idx}, 2500)">+₺2.500</button>
          <button class="btn btn-outline btn-xs" onclick="impersonateDealer(${idx})">Gişeye Geç</button>
          <button class="btn btn-outline btn-xs" onclick="SUB_DEALERS[${idx}].active=!SUB_DEALERS[${idx}].active; renderSubDealers();">${d.active ? 'Durdur' : 'Aç'}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function createSubDealerAdmin() {
  const nm = document.getElementById('admDealerName').value.trim();
  const city = document.getElementById('admDealerCity').value.trim();
  const phone = document.getElementById('admDealerPhone').value.trim();
  const tier = document.getElementById('admDealerTier').value;
  const bal = Number(document.getElementById('admDealerBal').value || 0);
  const lim = Number(document.getElementById('admDealerLim').value || 0);
  if (!nm) return toast('Bayi ünvanı zorunludur.');

  SUB_DEALERS.unshift({
    code: '#BY-' + Math.floor(1050 + Math.random() * 900),
    parent: 'Merkez Dağıtıcı',
    name: nm,
    city: city || 'İzmir',
    contact: phone || 'Yetkili Tanımlı',
    tier,
    balance: bal,
    limit: lim,
    dailyMax: 50000,
    ipLock: 'Dinamik (SMS 2FA)',
    active: true
  });
  document.getElementById('admDealerName').value = '';
  renderSubDealers();
  toast(`🏪 ${nm} alt bayisi açıldı ve giriş bilgileri SMS ile gönderildi!`);
}

function adjustSubDealer(idx, delta) {
  SUB_DEALERS[idx].balance = +(SUB_DEALERS[idx].balance + delta).toFixed(2);
  if (idx === 0) STATE.balance = SUB_DEALERS[0].balance;
  syncWalletUI();
  toast(`✓ ${SUB_DEALERS[idx].name} cari kasasına +${fmtTL(delta)} eklendi.`);
}

function impersonateDealer(idx) {
  const d = SUB_DEALERS[idx];
  STATE.activeTierKey = d.tier;
  STATE.balance = d.balance;
  STATE.creditLimit = d.limit;
  document.getElementById('activeBranchName').textContent = `${d.name} (${d.code})`;
  syncWalletUI();
  openPortalView('terminal');
  toast(`🔄 ${d.name} (${STATE.tiers[d.tier].name}) gişe oturumuna geçiş yapıldı! Tüm komisyonlar bu bayinin grubuna göre güncellendi.`);
}

function renderTierMatrixEditor() {
  const tb = document.getElementById('tierMatrixBody');
  if (!tb) return;
  tb.innerHTML = Object.entries(STATE.tiers).map(([key, t]) => `
    <tr>
      <td><strong>${t.name}</strong> ${STATE.activeTierKey === key ? '<span class="badge b-ok">Aktif Gişe</span>' : ''}</td>
      <td><input type="number" step="0.1" class="input" style="max-width:86px; padding:5px 8px;" value="${t.gsmDisc}" onchange="updateTierRate('${key}', 'gsmDisc', this.value)" /></td>
      <td><input type="number" step="0.5" class="input" style="max-width:86px; padding:5px 8px;" value="${t.billComm}" onchange="updateTierRate('${key}', 'billComm', this.value)" /></td>
      <td><input type="number" step="0.1" class="input" style="max-width:86px; padding:5px 8px;" value="${t.epinDisc}" onchange="updateTierRate('${key}', 'epinDisc', this.value)" /></td>
      <td><input type="number" step="0.05" class="input" style="max-width:86px; padding:5px 8px;" value="${t.posRate}" onchange="updateTierRate('${key}', 'posRate', this.value)" /></td>
      <td><button class="btn btn-outline btn-xs" onclick="STATE.activeTierKey='${key}'; syncWalletUI(); renderTierMatrixEditor(); renderEpinCatalog(); detectBinAndRenderInstallments(); toast('✓ Aktif gişe fiyat grubu ${t.name} olarak değiştirildi.');">Bu Grubu Test Et</button></td>
    </tr>
  `).join('');
}

function updateTierRate(key, field, val) {
  STATE.tiers[key][field] = Math.max(0, Number(val || 0));
  syncWalletUI();
  renderEpinCatalog();
  detectBinAndRenderInstallments();
  toast(`💰 ${STATE.tiers[key].name} fiyat grubu güncellendi — tüm gişe hesaplamalarına anında yansıtıldı!`);
}

function renderAdminQueues() {
  const pendingWires = WIRE_QUEUE.filter(w => w.status === 'pending').length;
  const pendingApps = DEALER_APPLICATIONS.filter(a => a.status === 'pending').length;
  document.getElementById('navAdminBadge').textContent = pendingWires + pendingApps;

  const wTb = document.getElementById('admWireBody');
  if (wTb) {
    wTb.innerHTML = WIRE_QUEUE.map((w, idx) => `
      <tr>
        <td>${w.date}</td>
        <td><strong>${w.dealer}</strong></td>
        <td>${w.bank}</td>
        <td><strong>${fmtTL(w.amount)}</strong></td>
        <td><span class="badge ${w.status === 'pending' ? 'b-wait' : 'b-ok'}">${w.status === 'pending' ? 'Bekliyor' : 'Onaylandı'}</span></td>
        <td>
          ${w.status === 'pending'
            ? `<button class="btn btn-emerald btn-xs" onclick="approveWireAdmin(${idx})">✓ Onayla &amp; Cariye Yansıt</button>`
            : 'Tamamlandı'}
        </td>
      </tr>
    `).join('');
  }

  const aTb = document.getElementById('admAppsBody');
  if (aTb) {
    aTb.innerHTML = DEALER_APPLICATIONS.map((a, idx) => `
      <tr>
        <td>${a.date}</td>
        <td><strong>${a.company}</strong><div style="font-size:11px; color:var(--muted);">${a.city}</div></td>
        <td>${a.owner} • ${a.phone}</td>
        <td><span class="badge b-pri">${STATE.tiers[a.tier]?.name || a.tier}</span></td>
        <td>
          ${a.status === 'pending'
            ? `<button class="btn btn-primary btn-xs" onclick="approveDealerApp(${idx})">🏪 Bayiliği Aç</button>`
            : '<span class="badge b-ok">Bayi Açıldı</span>'}
        </td>
      </tr>
    `).join('');
  }

  const ipTb = document.getElementById('ipLogsBody');
  if (ipTb) {
    ipTb.innerHTML = IP_LOGS.map(l => `
      <tr>
        <td>${l.time}</td>
        <td><strong>${l.actor}</strong></td>
        <td style="font-family:var(--font-mono);">${l.ip} (${l.location})</td>
        <td><span class="badge ${l.ok ? 'b-ok' : 'b-wait'}">${l.event}</span></td>
      </tr>
    `).join('');
  }
}

function approveWireAdmin(idx) {
  const w = WIRE_QUEUE[idx];
  if (!w || w.status !== 'pending') return;
  w.status = 'approved';
  const before = STATE.balance;
  STATE.balance = +(STATE.balance + w.amount).toFixed(2);
  LEDGER.unshift({
    ref: 'FAST-' + Math.floor(30000 + Math.random() * 9000),
    date: 'Şimdi',
    day: 'today',
    status: 'ok',
    type: 'Havale / FAST Onayı',
    provider: w.bank,
    target: w.dealer,
    before,
    amount: w.amount,
    profit: 0,
    after: STATE.balance
  });
  syncWalletUI();
  renderAdminQueues();
  renderLedgerTables();
  toast(`✓ FAST onaylandı ve ${fmtTL(w.amount)} cari bakiyeye otomatik işlendi!`);
}

function approveDealerApp(idx) {
  const a = DEALER_APPLICATIONS[idx];
  if (!a || a.status !== 'pending') return;
  a.status = 'approved';
  SUB_DEALERS.unshift({
    code: '#BY-' + Math.floor(1100 + Math.random() * 800),
    parent: 'Vitrin Online Başvuru',
    name: a.company,
    city: a.city,
    contact: `${a.owner} • ${a.phone}`,
    tier: a.tier,
    balance: 0,
    limit: 1000,
    dailyMax: 35000,
    ipLock: 'SMS 2FA Aktif',
    active: true
  });
  renderAdminQueues();
  renderSubDealers();
  toast(`🎉 ${a.company} başvurusu onaylandı ve yeni alt bayi hesabı oluşturuldu!`);
}

function runCronPendingSync() {
  const pend = LEDGER.find(x => x.status === 'pending');
  if (!pend) return toast('✓ Cron Kontrolü: Askıda bekleyen işlem bulunmuyor, tüm API kuyruğu güncel.');
  pend.status = 'ok';
  renderLedgerTables();
  toast(`🔄 Cron Job Senkronizasyonu: #${pend.ref} (${pend.target}) operatör onayı alındı ve kesinleştirildi!`);
}

// ==================== RECEIPT MODAL (80MM THERMAL + A4 CORPORATE) ====================
function openReceiptByRef(ref) {
  const found = LEDGER.find(x => x.ref === ref) || LEDGER[0];
  openReceiptModal(found);
}

function openReceiptModal(tx) {
  const box = document.getElementById('rcpModalCard');
  box.classList.toggle('thermal', STATE.receiptFormat === 'thermal');
  document.getElementById('rcpBrandTitle').textContent = document.getElementById('stBrandName').value || 'FaturaPay Kurumsal';
  document.getElementById('rcpRefCode').textContent = 'İŞLEM REF: #' + tx.ref;
  document.getElementById('rcpType').textContent = tx.type;
  document.getElementById('rcpProv').textContent = tx.provider;
  document.getElementById('rcpTarg').textContent = tx.target;
  document.getElementById('rcpTime').textContent = new Date().toLocaleString('tr-TR');
  document.getElementById('rcpAmt').textContent = fmtTL(tx.amount);
  document.getElementById('rcpBranch').textContent = document.getElementById('activeBranchName').textContent;
  document.getElementById('receiptBackdrop').classList.add('open');
}

function toggleReceiptModeLive() {
  setStudioReceipt(STATE.receiptFormat === 'corporate' ? 'thermal' : 'corporate');
  document.getElementById('rcpModalCard').classList.toggle('thermal', STATE.receiptFormat === 'thermal');
}

// ==================== DESIGN & WHITE-LABEL STUDIO ====================
function openStudio(open) {
  document.getElementById('studioDrawerWrap').classList.toggle('open', open);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function applyPresetTheme(key, cardEl) {
  const p = THEME_PRESETS[key];
  if (!p) return;
  document.querySelectorAll('.preset-card').forEach(c => c.classList.remove('active'));
  if (cardEl) cardEl.classList.add('active');

  setStudioSurface(p.theme);
  setStudioSidebar(p.sidebar);
  applyBrandColors(p.primary, p.dark, p.accent);
  setStudioRadius(p.radius);
  document.getElementById('stRadiusRange').value = p.radius;
  toast(`🎨 "${p.label}" tasarım teması tüm vitrin ve bayi ekranlarına uygulandı!`);
}

function applyBrandColors(primary, dark, accent) {
  const root = document.documentElement;
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-dark', dark || primary);
  root.style.setProperty('--primary-soft', hexToRgba(primary, 0.11));
  root.style.setProperty('--primary-border', hexToRgba(primary, 0.30));
  if (accent) root.style.setProperty('--accent', accent);
  document.getElementById('stPrimaryHex').value = primary;
  if (accent) document.getElementById('stAccentHex').value = accent;
}

function updateLiveBrandIdentity() {
  const name = document.getElementById('stBrandName').value.trim() || 'FaturaPay Kurumsal';
  const shortTxt = document.getElementById('stBrandShort').value.trim() || 'FP';
  const sub = document.getElementById('stBrandSub').value.trim() || 'Bayi & Tahsilat Otomasyonu';
  const phone = document.getElementById('stBrandPhone').value.trim() || '0850 308 00 00';
  const logoUrl = document.getElementById('stLogoUrl').value.trim();

  document.querySelectorAll('.js-brand-name').forEach(el => { el.textContent = name; });
  document.querySelectorAll('.js-brand-sub').forEach(el => { el.textContent = sub; });
  document.querySelectorAll('.js-brand-phone').forEach(el => { el.textContent = phone; });

  document.querySelectorAll('.js-brand-mark').forEach(el => {
    if (logoUrl) {
      el.innerHTML = `<img src="${logoUrl.replace(/"/g, '')}" alt="Logo" onerror="this.parentElement.textContent='${shortTxt.toUpperCase()}'"/>`;
    } else {
      el.textContent = shortTxt.toUpperCase();
    }
  });
  document.title = `${name} — TL Yükleme, Fatura Tahsilat & Alt Bayi Sistemi`;
}

function setStudioSurface(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  ['light', 'dark', 'banking'].forEach(m => {
    document.getElementById('seg-th-' + m)?.classList.toggle('active', m === mode);
  });
}

function setStudioSidebar(style) {
  document.documentElement.setAttribute('data-sidebar', style);
  ['dark', 'light', 'brand'].forEach(s => {
    document.getElementById('seg-sb-' + s)?.classList.toggle('active', s === style);
  });
}

function setStudioLayout(layout) {
  document.documentElement.setAttribute('data-layout', layout);
  ['sidebar', 'topnav'].forEach(l => {
    document.getElementById('seg-ly-' + l)?.classList.toggle('active', l === layout);
  });
}

function setStudioFont(fontKey, btn) {
  const map = {
    inter: "'Inter', -apple-system, sans-serif",
    jakarta: "'Plus Jakarta Sans', -apple-system, sans-serif",
    mono: "'JetBrains Mono', monospace"
  };
  document.documentElement.style.setProperty('--font-sans', map[fontKey] || map.inter);
  if (btn) {
    btn.parentElement.querySelectorAll('.seg').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

function setStudioFontSize(px, btn) {
  document.documentElement.style.setProperty('--base-font-size', px + 'px');
  if (btn) {
    btn.parentElement.querySelectorAll('.seg').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

function setStudioRadius(px) {
  const r = Number(px);
  document.documentElement.style.setProperty('--radius', r + 'px');
  document.documentElement.style.setProperty('--radius-sm', Math.max(4, Math.round(r * 0.65)) + 'px');
  document.getElementById('stRadiusValTxt').textContent = r + 'px';
}

function setStudioShadow(level, btn) {
  document.documentElement.setAttribute('data-shadow', level);
  if (btn) {
    btn.parentElement.querySelectorAll('.seg').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

function setStudioDensity(den) {
  document.documentElement.setAttribute('data-density', den);
  ['comfortable', 'compact'].forEach(d => {
    document.getElementById('seg-dn-' + d)?.classList.toggle('active', d === den);
  });
}

function setStudioReceipt(fmt) {
  STATE.receiptFormat = fmt;
  ['corporate', 'thermal'].forEach(f => {
    document.getElementById('seg-rcp-' + f)?.classList.toggle('active', f === fmt);
  });
}

function toggleModuleVisibility(selector, visible) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.display = visible ? '' : 'none';
  });
}

function exportThemeJson() {
  const payload = {
    brandName: document.getElementById('stBrandName').value,
    brandShort: document.getElementById('stBrandShort').value,
    brandSub: document.getElementById('stBrandSub').value,
    phone: document.getElementById('stBrandPhone').value,
    theme: document.documentElement.getAttribute('data-theme'),
    sidebar: document.documentElement.getAttribute('data-sidebar'),
    layout: document.documentElement.getAttribute('data-layout'),
    primary: document.getElementById('stPrimaryHex').value,
    accent: document.getElementById('stAccentHex').value,
    radius: document.getElementById('stRadiusRange').value,
    receiptFormat: STATE.receiptFormat
  };
  try { localStorage.setItem('faturapay_enterprise_v55', JSON.stringify(payload)); } catch {}
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kurumsal-tema-ayarlari.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('💾 Tema kaydedildi ve JSON yapılandırma dosyası indirildi!');
}

function resetStudioAll() {
  try { localStorage.removeItem('faturapay_enterprise_v55'); } catch {}
  document.getElementById('stBrandName').value = 'FaturaPay Kurumsal';
  document.getElementById('stBrandShort').value = 'FP';
  document.getElementById('stBrandSub').value = 'TL Yükleme • Fatura & Bayi ERP';
  document.getElementById('stLogoUrl').value = '';
  updateLiveBrandIdentity();
  applyPresetTheme('stripe', document.querySelector('.preset-card'));
  setStudioLayout('sidebar');
  setStudioDensity('comfortable');
  setStudioReceipt('corporate');
}

// ==================== INITIALIZE ====================
window.addEventListener('DOMContentLoaded', () => {
  renderOperators();
  renderGsmPackages();
  selectBillCategory('elektrik', document.querySelector('#spane-bill .chip'));
  renderEpinCatalog();
  detectBinAndRenderInstallments();
  renderBankIbans();
  renderCashiers();
  renderSubDealers();
  renderTierMatrixEditor();
  renderAdminQueues();
  renderTickets();
  renderLedgerTables();
  syncWalletUI();
});
