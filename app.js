/* ==========================================================================
   FaturaPay Kurumsal v6.0 — B2C + B2B Sub-Dealer + Super Admin Engine
   Built strictly to tasteskill (app-screens.md) + Impeccable Operate rules
   ========================================================================== */

const STATE = {
  surface: 'portal',
  activeView: 'overview',
  overviewSeries: 'total',
  ledgerFilter: 'all',

  balance: 24850.00,
  creditLimit: 5000.00,
  dailyProfit: 1184.50,
  dailyTxCount: 68,
  activeTierKey: 'gold',
  soundEnabled: true,
  receiptFormat: 'corporate',
  lastReceiptTx: null,

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
  pending3dPayment: null,
  activeTheme: 'framed-sheet'
};

// Reconciled 7-day series: 138450 (GSM) + 114920 (Bill) + 31250 (E-Pin) = 284620 TL
const OVERVIEW_SERIES = {
  labels: ['24 Eki', '25 Eki', '26 Eki', '27 Eki', '28 Eki', '29 Eki', '30 Eki'],
  total: {
    title: 'Günlük toplam gişe tahsilat seyri (24 Ekim - 30 Ekim)',
    name: 'Toplam tahsilat',
    values: [34200, 38900, 36400, 41800, 44120, 40280, 48920],
    annotations: [{ at: 6, label: 'PayTR 3D +10.000 TL', short: '3D POS' }]
  },
  gsm: {
    title: 'GSM TL ve ses/internet paketi satış seyri (7 gün)',
    name: 'GSM TL ve paket',
    values: [16800, 18900, 17650, 20400, 21520, 19600, 23580],
    annotations: [{ at: 4, label: 'Yeni paket API senkronu', short: 'API' }]
  },
  bill: {
    title: '200+ kurum elektrik, su ve doğalgaz tahsilat seyri (7 gün)',
    name: 'Kurum fatura',
    values: [13400, 15600, 14850, 16900, 17880, 16950, 19340],
    annotations: [{ at: 6, label: 'Son ödeme yoğunluğu', short: 'Kesim' }]
  }
};

console.assert(
  OVERVIEW_SERIES.total.values.reduce((a, b) => a + b, 0) === 284620 &&
  OVERVIEW_SERIES.gsm.values.reduce((a, b) => a + b, 0) === 138450 &&
  OVERVIEW_SERIES.bill.values.reduce((a, b) => a + b, 0) === 114920,
  'Overview chart series must reconcile with KPI tab totals'
);

const WORLD_THEMES = [
  { id: 'framed-sheet',      name: 'Framed Sheet · Petrol',   origin: 'tasteskill varsayılan', swatches: ['#f4f7f8', '#ffffff', '#145e70'] },
  { id: 'achromatic-ledger', name: 'Achromatic Ledger',       origin: 'tasteskill finans',     swatches: ['#f7f8f9', '#111111', '#1a56b0'] },
  { id: 'wise-fintech',      name: 'Wise Orman Yeşili',       origin: 'awesome-design-md',     swatches: ['#eff3ed', '#163300', '#166534'] },
  { id: 'vercel-geist',      name: 'Vercel Monokrom',         origin: 'awesome-design-md',     swatches: ['#fafafa', '#171717', '#005cc5'] },
  { id: 'mercury-night',     name: 'Mercury Kurumsal Gece',   origin: 'awesome-design-md',     swatches: ['#111217', '#181a21', '#6699ff'] },
  { id: 'linear-obsidian',   name: 'Linear Obsidyen',         origin: 'awesome-design-md',     swatches: ['#08090a', '#111214', '#38bdf8'] },
  { id: 'revolut-carbon',    name: 'Revolut Siyah Terminal',  origin: 'awesome-design-md',     swatches: ['#000000', '#111111', '#2dd4bf'] },
  { id: 'telekom-counter',   name: 'Telekom Kırmızı Gişe',    origin: 'awesome-design-md',     swatches: ['#f4f4f6', '#18191c', '#b91c1c'] }
];

const VIEW_HEADERS = {
  overview: {
    title: 'Gişe özeti ve günlük nakit akışı',
    sub: 'Bugün 68 işlemde ₺1.184,50 net bayi hakedişi üretildi; 1 Vodafone yüklemesi operatör yanıtı bekliyor.',
    mode: 'erp'
  },
  terminal: {
    title: 'Gişe tahsilat ve yükleme terminali',
    sub: 'GSM kontör/paket, 200+ kurum fatura kapama, E-Pin üretimi ve 3D Secure sanal POS bakiye işlemleri.',
    mode: 'erp'
  },
  ledger: {
    title: 'Cari hesap ekstresi ve gün sonu mutabakatı',
    sub: 'Satır kilitli önceki ve sonraki bakiye kayıtları, anlık filtreleme ve CSV muhasebe çıktısı.',
    mode: 'erp'
  },
  dealers: {
    title: 'Kademeli alt bayiler ve gişe ağ yönetimi',
    sub: 'Ana bayi, bölge dağıtıcı ve alt gişe hiyerarşisi; tek tıkla alt bayi oturumuna geçiş ve limit tanımı.',
    mode: 'admin'
  },
  tiers: {
    title: 'Fiyat grupları ve canlı kâr marjı motoru',
    sub: 'Grup oranlarında yapılan her değişiklik tüm gişe ekranlarındaki maliyet ve hakedişleri anında günceller.',
    mode: 'admin'
  },
  cashiers: {
    title: 'Kasiyer hesapları ve vardiya satış kotaları',
    sub: 'Personel bazlı günlük maksimum işlem limiti ve fatura/TL iptal yetkisi kısıtlamaları.',
    mode: 'erp'
  },
  support: {
    title: 'İşlem sorgu, iptal ve destek kayıtları',
    sub: 'Operatör kuyruğundaki işlemler için mutabakat talepleri ve otomatik bakiye iade takibi.',
    mode: 'erp'
  },
  admin: {
    title: 'Merkez dağıtıcı onay ve API yönetim ekranı',
    sub: 'FAST havale bildirimleri, vitrin bayilik başvuruları, yedekli XML/REST API hatları ve IP güvenlik kayıtları.',
    mode: 'admin'
  },
  storefront: {
    title: 'Kurumsal tahsilat ve yetkili bayilik platformu',
    sub: 'Bireysel online ödeme noktası, şeffaf bayi komisyon kademeleri ve aynı gün aktifleşen bayilik başvurusu.',
    mode: 'storefront'
  }
};

const OPERATORS = [
  { code: 'TC', name: 'Turkcell', dot: '#d97706', bonus: 0.0 },
  { code: 'VF', name: 'Vodafone', dot: '#b91c1c', bonus: 0.4 },
  { code: 'TT', name: 'Türk Telekom', dot: '#0369a1', bonus: 0.6 },
  { code: 'BM', name: 'BİMcell', dot: '#15803d', bonus: 0.5 },
  { code: 'PT', name: 'PTTcell', dot: '#a16207', bonus: 0.5 },
  { code: 'KK', name: 'KKTC Telsim', dot: '#145e70', bonus: 0.9 }
];

const GSM_PACKAGES = [
  { id: 'tl150',  kind: 'tl',       code: 'TL-150',  title: '150 TL Tam Kontör',               meta: 'Direkt hat bakiyesi · Anında onay',          price: 150 },
  { id: 'tl250',  kind: 'tl',       code: 'TL-250',  title: '250 TL Tam Kontör',               meta: 'Direkt hat bakiyesi · Anında onay',          price: 250 },
  { id: 'tc15',   kind: 'paket',    code: 'PK-15G',  title: 'Avantaj 15 GB + 1000 DK',         meta: '28 gün · 250 SMS + Sınırsız mesajlaşma',     price: 275 },
  { id: 'tc20',   kind: 'paket',    code: 'PK-20G',  title: 'Süper 20 GB + 1000 DK',           meta: '28 gün · Sosyal medya yönü geçerli',         price: 320 },
  { id: 'tc30',   kind: 'paket',    code: 'PK-30G',  title: 'Platinum 30 GB + 1500 DK',        meta: '28 gün · Video ve iletişim paketi',          price: 410 },
  { id: 'tc50',   kind: 'paket',    code: 'PK-50G',  title: 'Ultra 50 GB + 2000 DK',           meta: '28 gün · Yüksek kotalı tam paket',           price: 540 },
  { id: 'tl500',  kind: 'tl',       code: 'TL-500',  title: '500 TL Tam Kontör',               meta: 'Direkt hat bakiyesi · Anında onay',          price: 500 },
  { id: 'tl1000', kind: 'tl',       code: 'TL-1000', title: '1.000 TL Kurumsal Kontör',        meta: 'Yüksek limitli direkt TL yükleme',           price: 1000 },
  { id: 'yd1',    kind: 'yurtdisi', code: 'INT-01',  title: 'Yurt Dışı Pasaport 5 GB + 100 DK',meta: 'Avrupa ve KKTC dolaşım · 15 gün',            price: 480 },
  { id: 'yd2',    kind: 'yurtdisi', code: 'INT-02',  title: 'Kıbrıs ve Azerbaycan 15 GB',      meta: '30 günlük uluslararası konuşma ve veri',     price: 390 }
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
    'İZSU · İzmir Su ve Kanalizasyon İdaresi',
    'İSKİ · İstanbul Su ve Kanalizasyon İdaresi',
    'ASKİ · Ankara Su ve Kanalizasyon İdaresi',
    'BUSKİ · Bursa Su ve Kanalizasyon İdaresi',
    'ASAT · Antalya Su ve Atıksu İdaresi',
    'MESKİ · Mersin Su ve Kanalizasyon',
    'MASKİ · Manisa Su ve Kanalizasyon'
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
    'Türksat Kablonet ve KabloTV',
    'Vodafone Evde İnternet Tahsilatı',
    'Digiturk / beIN Connect Abonelik',
    'Millenicom İnternet Hizmetleri'
  ],
  kamu: [
    'GİB · MTV Motorlu Taşıtlar Vergisi',
    'EGM · Trafik İdari Para Cezası Tahsilatı',
    'SGK · Bağ-Kur (4B) ve GSS Prim Tahsilatı',
    'PTT · HGS Otoyol Bakiye Yükleme',
    'Tapu ve Kadastro Harç Tahsilatı'
  ]
};

const EPIN_ITEMS = [
  { id: 'ep1', code: 'GP-250',  title: 'Google Play 250 TL Dijital Kod',     cat: 'Mağaza Cüzdan', price: 250 },
  { id: 'ep2', code: 'AP-500',  title: 'App Store ve iTunes 500 TL Kodu',    cat: 'Apple Cüzdan',  price: 500 },
  { id: 'ep3', code: 'VL-1450', title: 'Valorant 1.450 VP Riot PIN',         cat: 'Oyun E-Pin',    price: 375 },
  { id: 'ep4', code: 'PB-660',  title: 'PUBG Mobile 660 UC Dijital Kod',     cat: 'Oyun E-Pin',    price: 390 },
  { id: 'ep5', code: 'ST-400',  title: 'Steam 400 TL Cüzdan Kodu',           cat: 'PC Oyun',       price: 400 },
  { id: 'ep6', code: 'TD-350',  title: 'TOD Süper Lig Aylık Taraftar Paketi',cat: 'Dijital Yayın', price: 350 }
];

const BANK_IBANS = [
  { bank: 'Ziraat Bankası (7/24 FAST Otomatik)',    iban: 'TR42 0001 0019 4288 3019 4050 01' },
  { bank: 'Garanti BBVA (Kurumsal Tahsilat)',       iban: 'TR89 0006 2000 4120 0006 2988 14' },
  { bank: 'Türkiye İş Bankası (7/24 Havale/FAST)',  iban: 'TR15 0006 4000 0013 4021 9044 82' },
  { bank: 'Yapı Kredi (Otomatik Ekstre Entegreli)', iban: 'TR61 0006 7010 0000 0084 1192 05' }
];

const SUB_DEALERS = [
  { code: 'BY-1042', parent: 'Merkez Dağıtıcı',    name: 'Ege Merkez İletişim ve Fatura', city: 'İzmir / Konak',      contact: 'Murat Kaya · 0532 411 20 30', tier: 'gold',  balance: 24850.00, limit: 5000,  ipLock: '88.241.12.94',  active: true },
  { code: 'BY-1039', parent: 'Merkez Dağıtıcı',    name: 'Bornova Bölge Dağıtım A.Ş.',    city: 'İzmir / Bornova',    contact: 'Selin Demir · 0544 820 11 94',tier: 'vip',   balance: 64200.00, limit: 15000, ipLock: '78.180.44.10',  active: true },
  { code: 'BY-1034', parent: 'BY-1039 Alt Bayisi', name: 'Buca Kontör ve Telekom Gişesi', city: 'İzmir / Buca',       contact: 'Serkan Aydın · 0506 712 88 05',tier: 'gumus',balance: 8420.00,  limit: 2000,  ipLock: 'Dinamik (2FA)', active: true },
  { code: 'BY-1028', parent: 'BY-1042 Alt Bayisi', name: 'Karşıyaka Çarşı Ödeme Noktası', city: 'İzmir / Karşıyaka',  contact: 'Kemal Özkan · 0535 991 34 67',tier: 'gold',  balance: 19740.00, limit: 3500,  ipLock: '85.104.21.19',  active: true },
  { code: 'BY-1019', parent: 'Merkez Dağıtıcı',    name: 'Manisa Merkez Tahsilat Gişesi', city: 'Manisa / Şehzadeler',contact: 'Hakan Çelik · 0533 519 08 77',tier: 'bronz', balance: 3150.00,  limit: 0,     ipLock: 'Dinamik (2FA)', active: true }
];

const CASHIERS = [
  { user: 'kasiyer_elif',  name: 'Elif Yılmaz (Gişe-1)',  role: 'Kasiyer · TL ve Fatura Yetkili', dailyLimit: 15000, usedToday: 6420,  canCancel: false, active: true },
  { user: 'vardiya_burak', name: 'Burak Demir (Gişe-2)',  role: 'Kıdemli Gişe Sorumlusu',         dailyLimit: 35000, usedToday: 11280, canCancel: true,  active: true }
];

const LEDGER = [
  { ref: 'FP-90421', date: 'Bugün 14:08', day: 'today', status: 'ok',      type: 'Fatura Tahsilat',     provider: 'İZSU İzmir Su',               target: 'Abone: 40918274',      before: 25262.80, amount: 427.80,   profit: 15.00, after: 24850.00 },
  { ref: 'FP-90418', date: 'Bugün 13:51', day: 'today', status: 'ok',      type: 'GSM Paket Yükleme',   provider: 'Turkcell Süper 20 GB',        target: '0532 418 92 10',       before: 25571.28, amount: 320.00,   profit: 11.52, after: 25262.80 },
  { ref: 'FP-90411', date: 'Bugün 13:24', day: 'today', status: 'pending', type: 'GSM TL Yükleme',      provider: 'Vodafone 250 TL Kontör',      target: '0542 881 19 04',       before: 25811.28, amount: 250.00,   profit: 10.00, after: 25571.28 },
  { ref: 'FP-90398', date: 'Bugün 12:35', day: 'today', status: 'ok',      type: 'Çoklu Fatura (2 Ad)', provider: 'Gediz Elektrik + İzmirgaz',   target: 'Abone: 1008492031',    before: 27941.88, amount: 2160.60,  profit: 30.00, after: 25811.28 },
  { ref: 'POS-49201',date: 'Bugün 11:10', day: 'today', status: 'ok',      type: '3D Sanal POS Yükleme',provider: 'PayTR 3D Secure POS',         target: 'Bonus Kart **** 8821', before: 17941.88, amount: 10000.00, profit: 0.00,  after: 27941.88 },
  { ref: 'EP-33019', date: 'Dün 18:42',   day: 'old',   status: 'ok',      type: 'Dijital E-Pin',       provider: 'Valorant 1.450 VP Kod',       target: 'PIN: VP-992A-7741',    before: 18299.01, amount: 375.00,   profit: 16.87, after: 17941.88 }
];

const WIRE_QUEUE = [
  { id: 501, date: 'Bugün 13:58', dealer: 'Buca Kontör ve Telekom (BY-1034)', bank: 'Ziraat Bankası FAST · Dekont 994120', amount: 7500.00, status: 'pending' },
  { id: 502, date: 'Bugün 13:12', dealer: 'Manisa Merkez Gişesi (BY-1019)',   bank: 'Garanti BBVA Havale · Dekont 441802', amount: 4000.00, status: 'pending' }
];

const DEALER_APPLICATIONS = [
  { id: 701, date: 'Bugün 13:40', company: 'Alsancak Telekom ve Ödeme Noktası', owner: 'Onur Şahin', phone: '0532 609 14 88', city: 'İzmir / Konak', tier: 'gold', status: 'pending' }
];

const TICKETS = [
  { id: 'TLP-409', date: 'Bugün 12:50', subject: 'FP-90411 nolu Vodafone işlem durumu sorgusu', category: 'Operatör API Kontrol', status: 'Yanıtlandı', reply: 'Operatör kuyruğunda bekliyor; 2 dk içinde yanıt dönmezse Cron otomatik bakiye iadesi yapacaktır.' }
];

const IP_LOGS = [
  { time: 'Bugün 14:10', actor: 'Ege Merkez (BY-1042)',       ip: '88.241.12.94',  location: 'İzmir',  event: 'Başarılı bayi girişi (Statik IP doğrulandı)', ok: true },
  { time: 'Bugün 13:44', actor: 'kasiyer_elif (Gişe-1)',      ip: '88.241.12.94',  location: 'İzmir',  event: 'Vardiya oturumu açıldı (Kota: ₺15.000)',       ok: true },
  { time: 'Bugün 11:19', actor: 'Manisa Merkez (BY-1019)',    ip: '176.42.90.11',  location: 'Manisa', event: 'Farklı IP algılandı · Netgsm SMS 2FA onaylı',  ok: false }
];

const COMMAND_ITEMS = [
  { label: 'Genel bakış ve günlük nakit akışı', meta: 'Gişe ERP', run: () => openAppView('overview') },
  { label: 'GSM TL ve paket yükleme terminali', meta: '6 operatör · MNP sorgu', run: () => jumpTerminalService('gsm') },
  { label: '200+ kurum fatura tahsilat merkezi', meta: 'Gediz, İZSU, İzmirgaz, barkod', run: () => jumpTerminalService('bill') },
  { label: 'Dijital kod ve oyun E-Pin üretimi', meta: 'Netgsm SMS teslimatlı', run: () => jumpTerminalService('epin') },
  { label: '3D Secure sanal POS ve FAST bakiye yükle', meta: 'PayTR, ParamPOS, İyzico', run: () => jumpTerminalService('pos') },
  { label: 'Satır kilitli cari ekstre ve CSV muhasebe', meta: 'Muhasebe', run: () => openAppView('ledger') },
  { label: 'Gün sonu gişe Z-raporu al', meta: 'Mutabakat', run: () => openZReportModal() },
  { label: 'Kademeli alt bayiler ve gişe oturumu (Impersonate)', meta: 'Dağıtıcı Admin', run: () => openAppView('dealers') },
  { label: 'Canlı fiyat grupları ve komisyon matrisi', meta: 'Dağıtıcı Admin', run: () => openAppView('tiers') },
  { label: 'Bekleyen FAST ve bayilik başvuru onayları', meta: 'Süper Admin', run: () => openAppView('admin') },
  { label: 'Müşteri ve online bayilik vitrin sayfası', meta: 'Vitrin', run: () => switchSurface('storefront') },
  { label: 'Tema ve white-label marka stüdyosu', meta: '8 DESIGN.md sistemi', run: () => openStudio(true) }
];

// ==================== FORMATTING & FEEDBACK ====================
function fmtTL(n) {
  return '₺' + Number(n || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function playFeedbackTone() {
  if (!STATE.soundEnabled) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, ctx.currentTime);
    gain.gain.setValueAtTime(0.035, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.07);
  } catch {}
}

function toast(msg) {
  playFeedbackTone();
  const el = document.getElementById('toastBox');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 3400);
}

// ==================== NAVIGATION & SURFACE SWITCHING ====================
function toggleMobileNav(open) {
  document.getElementById('appSidebar')?.classList.toggle('open', open);
}

function switchSurface(surf) {
  STATE.surface = surf;
  ['portal', 'admin', 'storefront'].forEach(k => {
    document.getElementById('surf-' + k)?.setAttribute('aria-pressed', String(k === surf));
  });
  if (surf === 'storefront') {
    openAppView('storefront', true);
  } else if (surf === 'admin') {
    openAppView('admin', true);
  } else {
    openAppView('overview', true);
  }
}

function openAppView(viewId, fromSurface = false) {
  STATE.activeView = viewId;
  toggleMobileNav(false);

  if (!fromSurface) {
    const targetSurf = viewId === 'storefront' ? 'storefront' : (['admin', 'dealers', 'tiers'].includes(viewId) ? 'admin' : 'portal');
    STATE.surface = targetSurf;
    ['portal', 'admin', 'storefront'].forEach(k => {
      document.getElementById('surf-' + k)?.setAttribute('aria-pressed', String(k === targetSurf));
    });
  }

  document.querySelectorAll('.app-view').forEach(sec => {
    sec.classList.toggle('active', sec.id === 'view-' + viewId);
  });

  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.getAttribute('data-view') === viewId) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  const meta = VIEW_HEADERS[viewId] || VIEW_HEADERS.overview;
  document.getElementById('screenTitle').textContent = meta.title;
  document.getElementById('screenSub').textContent = meta.sub;

  const actWrap = document.getElementById('screenActions');
  if (viewId === 'storefront') {
    actWrap.innerHTML = `
      <button type="button" class="btn" onclick="openStudio(true)">Markayı özelleştir</button>
      <button type="button" class="btn primary" onclick="switchSurface('portal')">Bayi gişesine geç</button>
    `;
  } else if (viewId === 'admin' || viewId === 'dealers' || viewId === 'tiers') {
    actWrap.innerHTML = `
      <button type="button" class="btn" onclick="runCronPendingSync()">Cron sorgu çalıştır</button>
      <button type="button" class="btn primary" onclick="openAppView('dealers')">Yeni alt bayi aç</button>
    `;
  } else {
    actWrap.innerHTML = `
      <button type="button" class="btn" onclick="openZReportModal()">Gün sonu Z-raporu</button>
      <button type="button" class="btn primary" onclick="openAppView('terminal')">Yeni tahsilat başlat</button>
    `;
  }

  if (viewId === 'overview') {
    requestAnimationFrame(renderOverviewCharts);
  }
}

function jumpTerminalService(srvKey) {
  openAppView('terminal');
  const btn = document.querySelector(`.tab-btn[data-srv="${srvKey}"]`);
  if (btn) switchServiceTab(srvKey, btn);
}

function switchServiceTab(srvKey, btn) {
  document.querySelectorAll('.tab-btn[data-srv]').forEach(b => {
    b.setAttribute('aria-selected', String(b === btn));
  });
  document.querySelectorAll('.srv-pane').forEach(p => {
    p.classList.toggle('active', p.id === 'spane-' + srvKey);
  });
}

// ==================== OVERVIEW CHARTS (tasteskill assets/charts.js) ====================
function switchOverviewSeries(key) {
  STATE.overviewSeries = key;
  ['total', 'gsm', 'bill'].forEach(k => {
    document.getElementById('ctab-' + k)?.setAttribute('aria-selected', String(k === key));
  });
  renderOverviewCharts();
}

function renderOverviewCharts() {
  if (!window.Charts) return;
  const lineEl = document.getElementById('overviewLineChart');
  const barEl = document.getElementById('overviewBarList');
  const cfg = OVERVIEW_SERIES[STATE.overviewSeries] || OVERVIEW_SERIES.total;

  const titleEl = document.getElementById('overviewChartTitle');
  if (titleEl) titleEl.textContent = cfg.title;

  if (lineEl && lineEl.offsetParent !== null) {
    window.Charts.line(lineEl, {
      labels: OVERVIEW_SERIES.labels,
      series: [{ name: cfg.name, values: cfg.values }],
      annotations: cfg.annotations,
      height: 210,
      format: (v) => fmtTL(v),
      tickFormat: (v) => v === 0 ? '₺0' : '₺' + (v / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + 'B'
    });
  }

  if (barEl && barEl.offsetParent !== null) {
    window.Charts.barList(barEl, [
      { label: 'GSM TL ve paket satışı (%48,6)', value: 138450 },
      { label: 'Elektrik, su ve doğalgaz fatura (%40,4)', value: 114920 },
      { label: 'Dijital E-Pin ve mağaza kodları (%11,0)', value: 31250 }
    ], {
      format: (v) => fmtTL(v),
      thin: true
    });
  }
}

window.addEventListener('resize', () => {
  clearTimeout(window.__chartResizeT);
  window.__chartResizeT = setTimeout(() => {
    if (STATE.activeView === 'overview') renderOverviewCharts();
  }, 150);
});

// ==================== WALLET & KPI SYNC ====================
function syncWalletUI() {
  const tierObj = STATE.tiers[STATE.activeTierKey];
  const availWithCredit = STATE.balance + STATE.creditLimit;

  document.getElementById('topBalTxt').textContent = fmtTL(STATE.balance);
  document.getElementById('topProfitTxt').textContent = '+' + fmtTL(STATE.dailyProfit);
  document.getElementById('topLimitTxt').textContent = fmtTL(availWithCredit);
  document.getElementById('topTierBadge').textContent = `${tierObj.name} · %${tierObj.gsmDisc.toFixed(1).replace('.', ',')}`;

  document.getElementById('kpiBal').textContent = fmtTL(STATE.balance);
  document.getElementById('kpiProfit').textContent = fmtTL(STATE.dailyProfit);
  document.getElementById('kpiTxCount').innerHTML = `${STATE.dailyTxCount} <small>adet</small>`;
  const kpiNote = document.getElementById('kpiTierNote');
  if (kpiNote) kpiNote.textContent = `${tierObj.name} · %${tierObj.gsmDisc.toFixed(1).replace('.', ',')} baz marj`;

  if (STATE.activeView === 'overview') {
    const pendCount = LEDGER.filter(x => x.status === 'pending').length;
    VIEW_HEADERS.overview.sub = `Bugün ${STATE.dailyTxCount} işlemde ${fmtTL(STATE.dailyProfit)} net bayi hakedişi üretildi; ${pendCount} işlem operatör yanıtı bekliyor.`;
    document.getElementById('screenSub').textContent = VIEW_HEADERS.overview.sub;
  }

  SUB_DEALERS[0].balance = STATE.balance;
  renderSubDealers();
  renderOperators();
  renderGsmPackages();
}

// ==================== STOREFRONT B2C & DEALER APPLICATION ====================
function switchB2cTab(mode) {
  document.getElementById('b2cTabTl')?.setAttribute('aria-pressed', String(mode === 'tl'));
  document.getElementById('b2cTabBill')?.setAttribute('aria-pressed', String(mode === 'bill'));
  document.getElementById('b2c-tl').style.display = mode === 'tl' ? 'block' : 'none';
  document.getElementById('b2c-bill').style.display = mode === 'bill' ? 'block' : 'none';
}

function submitB2cDemoOrder(kind) {
  toast(`Bireysel ${kind} tahsilat talebi oluşturuldu; gişe terminaline yönlendirildiniz.`);
  jumpTerminalService(kind === 'TL' ? 'gsm' : 'bill');
}

function submitPublicDealerApplication() {
  const comp = document.getElementById('appCompany').value.trim();
  const owner = document.getElementById('appOwner').value.trim();
  const phone = document.getElementById('appPhone').value.trim();
  const city = document.getElementById('appCity').value.trim();
  const tier = document.getElementById('appTier').value;
  if (!comp || !phone) return toast('Lütfen işletme ünvanı ve cep telefonu alanlarını doldurun.');

  DEALER_APPLICATIONS.unshift({
    id: Date.now(),
    date: 'Şimdi',
    company: comp,
    owner: owner || 'Yetkili',
    phone,
    city: city || 'İzmir',
    tier,
    status: 'pending'
  });
  renderAdminQueues();
  toast('Bayilik başvurusu kaydedildi ve Merkez Süper Admin onay kuyruğuna aktarıldı.');
  switchSurface('admin');
}

// ==================== GSM TERMINAL + MNP + BULK TOP-UP ====================
function renderOperators() {
  const baseDisc = STATE.tiers[STATE.activeTierKey].gsmDisc;
  const grid = document.getElementById('opGrid');
  if (!grid) return;
  grid.innerHTML = OPERATORS.map(op => {
    const eff = (baseDisc + op.bonus).toFixed(1).replace('.', ',');
    const isSel = STATE.selectedOp.code === op.code;
    return `
      <button type="button" class="op-tile" aria-pressed="${isSel}" onclick="selectOp('${op.code}')">
        <span class="op-tile-left">
          <span class="op-dot" style="background:${op.dot};"></span>
          <span class="op-name">${op.name}</span>
        </span>
        <span class="op-rate">%${eff}</span>
      </button>
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
  btn.parentElement.querySelectorAll('button').forEach(c => c.setAttribute('aria-pressed', String(c === btn)));
  const list = GSM_PACKAGES.filter(p => kind === 'all' || p.kind === kind);
  if (!list.some(p => p.id === STATE.selectedPkgId) && list[0]) STATE.selectedPkgId = list[0].id;
  renderGsmPackages();
}

function renderGsmPackages() {
  const list = GSM_PACKAGES.filter(p => STATE.pkgFilter === 'all' || p.kind === STATE.pkgFilter);
  const wrap = document.getElementById('gsmPkgList');
  if (!wrap) return;

  wrap.innerHTML = list.map(p => {
    const isSel = p.id === STATE.selectedPkgId;
    return `
      <button type="button" class="pkg-item" aria-pressed="${isSel}" onclick="STATE.selectedPkgId='${p.id}'; renderGsmPackages();">
        <div>
          <code>${p.code}</code>
          <div class="pkg-title">${STATE.selectedOp.name} ${p.title}</div>
          <div class="pkg-meta">${p.meta}</div>
        </div>
        <div class="pkg-price">₺${p.price}</div>
      </button>
    `;
  }).join('');

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
    <div class="kv-row">
      <span>BTK MNP şebeke durumu</span>
      <strong>${STATE.selectedOp.name} aktif hat (${past.length + 2} geçmiş işlem)</strong>
    </div>
    <div class="kv-row">
      <span>Son yükleme kaydı</span>
      <strong>Bugün 13:51 · Süper 20 GB (₺320,00) · Yüklemeye uygun</strong>
    </div>
  `;
  toast(`BTK MNP şebeke ve abone geçmişi doğrulandı: ${num}`);
}

function executeGsmSingle() {
  const num = document.getElementById('gsmNumberInput').value.trim() || '0532 418 92 10';
  const pkg = GSM_PACKAGES.find(p => p.id === STATE.selectedPkgId) || GSM_PACKAGES[0];
  const effDisc = STATE.tiers[STATE.activeTierKey].gsmDisc + STATE.selectedOp.bonusDisc;
  const profit = +(pkg.price * (effDisc / 100)).toFixed(2);
  const cost = +(pkg.price - profit).toFixed(2);

  if (STATE.balance + STATE.creditLimit < cost) {
    return toast('Cari bakiye ve açık kredi limitiniz bu işlem için yetersiz.');
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
  toast(`${num} numarasına ${pkg.title} yüklemesi onaylandı.`);
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

  if (STATE.balance + STATE.creditLimit < totalCost) return toast('Toplu işlem için cari limit yetersiz.');

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
    target: `${lines[0]} + ${lines.length - 1} hat`,
    before,
    amount: totalRetail,
    profit: totalProfit,
    after: STATE.balance
  };
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  openReceiptModal(tx);
  toast(`${lines.length} adet hatta toplu XML yüklemesi tamamlandı.`);
}

// ==================== 200+ INSTITUTION BILLS, BARCODE & MULTI-CART ====================
function selectBillCategory(cat, btn) {
  STATE.activeBillCat = cat;
  if (btn) {
    btn.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
  }
  const sel = document.getElementById('instSelect');
  if (sel) {
    sel.innerHTML = INSTITUTIONS[cat].map((name, idx) => `<option value="${idx}">${name}</option>`).join('');
  }
  querySubscriberInvoices();
}

function simulateBarcodeScan() {
  const randomSub = String(Math.floor(1004000000 + Math.random() * 890000000));
  document.getElementById('billSubNo').value = randomSub;
  querySubscriberInvoices();
  toast(`Barkod okundu: ${randomSub} nolu abone borçları getirildi.`);
}

function querySubscriberInvoices() {
  const idx = Number(document.getElementById('instSelect')?.value || 0);
  const instName = INSTITUTIONS[STATE.activeBillCat][idx];
  const subNo = document.getElementById('billSubNo')?.value.trim() || '1008492031';
  const customFee = Number(document.getElementById('billServiceFee')?.value || STATE.tiers[STATE.activeTierKey].billComm);

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
    const shortInst = inv.inst.split('(')[0].split('·')[0].trim();
    return `
      <label class="invoice-row">
        <span class="invoice-left">
          <input type="checkbox" ${inv.selected ? 'checked' : ''} onchange="STATE.queriedInvoices[${idx}].selected=this.checked; updateSelectedBillSummary();" />
          <span>
            <span class="cell-title">${shortInst} · ${inv.period}</span>
            <span class="cell-sub">Abone: <code>${inv.subNo}</code> (${inv.owner}) · Son ödeme: ${inv.due}</span>
          </span>
        </span>
        <span style="text-align:right;" class="num">
          <strong style="font-size:14px; display:block;">${fmtTL(rowTotal)}</strong>
          <span class="pos-num" style="font-size:12px;">+${fmtTL(inv.serviceFee)} kâr</span>
        </span>
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
  if (STATE.balance + STATE.creditLimit < baseSum) return toast('Cari limit yetersiz.');

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
    provider: chosen[0].inst.split('(')[0].trim(),
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
  toast(`${chosen.length} adet fatura kurum sisteminde anlık kapatıldı.`);
}

function pushSelectedToBillCart() {
  const chosen = STATE.queriedInvoices.filter(i => i.selected);
  if (chosen.length === 0) return toast('Sepete eklemek için fatura dönemi seçin.');
  chosen.forEach(c => STATE.billCart.push({ ...c }));
  renderMultiBillCart();
  toast(`${chosen.length} fatura çoklu tahsilat sepetine eklendi.`);
}

function renderMultiBillCart() {
  document.getElementById('multiCartCount').textContent = String(STATE.billCart.length);
  const total = STATE.billCart.reduce((s, x) => s + x.base + x.lateFee + x.serviceFee, 0);
  document.getElementById('multiCartTotal').textContent = fmtTL(total);

  const rowsBox = document.getElementById('multiCartRows');
  if (STATE.billCart.length === 0) {
    rowsBox.innerHTML = 'Farklı kurumlara ait faturaları sepete ekleyip tek fişle kapatabilirsiniz.';
    return;
  }
  rowsBox.innerHTML = STATE.billCart.map((c, idx) => `
    <div class="kv-row">
      <span>${idx + 1}. ${c.inst.split('(')[0].split('·')[0].trim()} (${c.period})</span>
      <strong>${fmtTL(c.base + c.lateFee + c.serviceFee)}</strong>
    </div>
  `).join('');
}

function clearMultiBillCart() {
  STATE.billCart = [];
  renderMultiBillCart();
}

function checkoutMultiBillCart() {
  if (STATE.billCart.length === 0) return toast('Tahsilat sepetinizde henüz fatura bulunmuyor.');
  const baseSum = +(STATE.billCart.reduce((s, i) => s + i.base + i.lateFee, 0)).toFixed(2);
  const feeSum = +(STATE.billCart.reduce((s, i) => s + i.serviceFee, 0)).toFixed(2);
  if (STATE.balance + STATE.creditLimit < baseSum) return toast('Sepet toplamı için cari bakiye yetersiz.');

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
    type: `Sepet Tahsilat (${count} Ad)`,
    provider: `${count} Kurum Toplu Fatura Kapama`,
    target: 'Çoklu müşteri sepeti',
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
  toast(`Sepetteki ${count} fatura tek işlemde kapatıldı.`);
}

// ==================== E-PIN & SMS DELIVERY ====================
function renderEpinCatalog() {
  const disc = STATE.tiers[STATE.activeTierKey].epinDisc;
  const box = document.getElementById('epinCatalogGrid');
  if (!box) return;
  box.innerHTML = EPIN_ITEMS.map(e => {
    const prof = +(e.price * (disc / 100)).toFixed(2);
    const isSel = e.id === STATE.selectedEpinId;
    return `
      <button type="button" class="pkg-item" aria-pressed="${isSel}" onclick="STATE.selectedEpinId='${e.id}'; renderEpinCatalog();">
        <div>
          <code>${e.code}</code> · <span style="font-size:12px; color:var(--muted);">${e.cat}</span>
          <div class="pkg-title">${e.title}</div>
          <div class="pkg-meta">Bayi net kârı: +${fmtTL(prof)} (%${disc.toFixed(1).replace('.', ',')})</div>
        </div>
        <div class="pkg-price">₺${e.price}</div>
      </button>
    `;
  }).join('');
}

function buyEpinNow() {
  const item = EPIN_ITEMS.find(x => x.id === STATE.selectedEpinId) || EPIN_ITEMS[0];
  const disc = STATE.tiers[STATE.activeTierKey].epinDisc;
  const profit = +(item.price * (disc / 100)).toFixed(2);
  const cost = +(item.price - profit).toFixed(2);
  const smsPhone = document.getElementById('epinSmsPhone').value.trim() || '0541 191 86 11';

  if (STATE.balance + STATE.creditLimit < cost) return toast('Cari limit yetersiz.');
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
  toast(`PIN üretildi (${pin}) ve Netgsm ile ${smsPhone} numarasına iletildi.`);
}

// ==================== 3D SECURE VIRTUAL POS & IBAN FAST ====================
function detectBinAndRenderInstallments() {
  const numRaw = (document.getElementById('ccNumInput')?.value || '4543 6012 8840 8821').replace(/\s+/g, '');
  const amt = Math.max(100, Number(document.getElementById('posTopupAmt')?.value || 5000));
  const gw = document.getElementById('posGateway')?.value || 'PayTR 3D POS';

  let bankBrand = 'Garanti Bonus Ticari Kart';
  if (numRaw.startsWith('54')) bankBrand = 'Yapı Kredi World Business';
  else if (numRaw.startsWith('4506') || numRaw.startsWith('55')) bankBrand = 'İş Bankası Maximum Ticari';
  else if (numRaw.startsWith('4022') || numRaw.startsWith('52')) bankBrand = 'Akbank Axess Kurumsal';

  const masked = numRaw.length >= 8 ? `${numRaw.slice(0, 4)} •••• •••• ${numRaw.slice(-4)}` : '4543 •••• •••• 8821';
  const bankEl = document.getElementById('ccVisualBank');
  if (bankEl) {
    bankEl.innerHTML = `Algılanan kart: ${gw} · ${bankBrand} (<code>${masked}</code>)`;
  }

  const baseRate = STATE.tiers[STATE.activeTierKey].posRate / 100;
  const plans = [
    { count: 1,  label: 'Tek çekim', rate: baseRate },
    { count: 3,  label: '3 taksit',  rate: baseRate + 0.024 },
    { count: 6,  label: '6 taksit',  rate: baseRate + 0.052 },
    { count: 12, label: '12 taksit', rate: baseRate + 0.108 }
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
          <td>
            <label style="cursor:pointer; font-weight:500; display:inline-flex; align-items:center; gap:8px;">
              <input type="radio" name="instPlan" value="${p.count}" ${p.count === selCount ? 'checked' : ''} onchange="detectBinAndRenderInstallments()" style="accent-color:var(--accent);" />
              <span>${p.label}</span>
            </label>
          </td>
          <td class="n">%${(p.rate * 100).toFixed(2).replace('.', ',')}</td>
          <td class="n">${fmtTL(monthly)} x ${p.count}</td>
          <td class="n"><strong>${fmtTL(gross)}</strong></td>
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
    provider: gw + ' (HMAC Webhook)',
    target: '3D SMS onaylı otomatik cari',
    before,
    amount: amt,
    profit: 0,
    after: STATE.balance
  };
  STATE.pending3dPayment = null;
  LEDGER.unshift(tx);
  syncWalletUI();
  renderLedgerTables();
  toast(`3D Secure SMS doğrulandı; ${fmtTL(amt)} cari kasaya eklendi.`);
}

function renderBankIbans() {
  const box = document.getElementById('ibanListWrap');
  if (!box) return;
  box.innerHTML = BANK_IBANS.map(b => `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:9px 11px; border:1px solid var(--border); border-radius:var(--radius-control); margin-bottom:7px; background:var(--raised);">
      <div style="min-width:0;">
        <span style="font-size:13px; font-weight:500; display:block;">${b.bank}</span>
        <code style="color:var(--muted); display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${b.iban}</code>
      </div>
      <button type="button" class="btn sm" onclick="navigator.clipboard?.writeText('${b.iban}'); toast('IBAN panoya kopyalandı.');">Kopyala</button>
    </div>
  `).join('');
}

function sendWireNotification() {
  const amt = Math.max(100, Number(document.getElementById('wireAmtInput')?.value || 7500));
  const bank = document.getElementById('wireBankSelect')?.value || 'Ziraat Bankası FAST';
  const ref = document.getElementById('wireDecontInput')?.value.trim() || ('FAST-' + Math.floor(100000 + Math.random() * 800000));

  WIRE_QUEUE.unshift({
    id: Date.now(),
    date: 'Şimdi',
    dealer: 'Ege Merkez İletişim (BY-1042)',
    bank: `${bank} · Dekont: ${ref}`,
    amount: amt,
    status: 'pending'
  });
  renderAdminQueues();
  toast('Havale/FAST bildiriminiz Merkez Süper Admin onay kuyruğuna iletildi.');
}

// ==================== CASHIER SUB-USERS & QUOTA BARS ====================
function renderCashiers() {
  const tb = document.getElementById('cashiersBody');
  if (!tb) return;
  tb.innerHTML = CASHIERS.map((c, idx) => {
    const ratio = Math.min(100, Math.round((c.usedToday / Math.max(1, c.dailyLimit)) * 100));
    return `
      <tr>
        <td>
          <span class="cell-title">${c.name}</span>
          <span class="cell-sub"><code>@${c.user}</code></span>
        </td>
        <td>${c.role}</td>
        <td class="num">
          <span>${fmtTL(c.usedToday)} / <strong>${fmtTL(c.dailyLimit)}</strong></span>
          <div class="quota-track" role="progressbar" aria-valuenow="${ratio}" aria-valuemin="0" aria-valuemax="100">
            <div class="quota-fill" style="width:${ratio}%;"></div>
          </div>
        </td>
        <td><span class="pill ${c.canCancel ? 'pos' : ''}">${c.canCancel ? 'İptal yetkili' : 'Sadece satış'}</span></td>
        <td class="n">
          <button type="button" class="btn sm" onclick="CASHIERS[${idx}].active=!CASHIERS[${idx}].active; renderCashiers();">
            ${c.active ? 'Aktif (Durdur)' : 'Pasif (Aç)'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function addCashierUser() {
  const nm = document.getElementById('newCashierName').value.trim();
  const lim = Math.max(1000, Number(document.getElementById('newCashierLimit').value || 15000));
  if (!nm) return toast('Lütfen personel adını girin.');
  CASHIERS.unshift({
    user: 'gise_' + Math.floor(10 + Math.random() * 89),
    name: nm,
    role: 'Gişe Kasiyeri · Sınırlı Yetki',
    dailyLimit: lim,
    usedToday: 0,
    canCancel: false,
    active: true
  });
  document.getElementById('newCashierName').value = '';
  renderCashiers();
  toast(`${nm} kasiyer hesabı ${fmtTL(lim)} günlük kota ile tanımlandı.`);
}

// ==================== LEDGER, COUNT-CARDS FILTER, CSV & Z-REPORT ====================
function setLedgerFilter(filterKey) {
  STATE.ledgerFilter = filterKey;
  ['all', 'ok', 'pending', 'today'].forEach(k => {
    document.getElementById('lf-' + k)?.setAttribute('aria-pressed', String(k === filterKey));
  });
  renderLedgerTables();
}

function renderLedgerTables() {
  const countAll = LEDGER.length;
  const countOk = LEDGER.filter(x => x.status === 'ok').length;
  const countPending = LEDGER.filter(x => x.status === 'pending').length;
  const countToday = LEDGER.filter(x => x.day === 'today').length;

  const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = String(v); };
  setTxt('lfCountAll', countAll);
  setTxt('lfCountOk', countOk);
  setTxt('lfCountPending', countPending);
  setTxt('lfCountToday', countToday);

  const filtered = LEDGER.filter(x => {
    if (STATE.ledgerFilter === 'ok') return x.status === 'ok';
    if (STATE.ledgerFilter === 'pending') return x.status === 'pending';
    if (STATE.ledgerFilter === 'today') return x.day === 'today';
    return true;
  });

  // Overview capped 5-row list (balanced with right column height)
  const ovTb = document.getElementById('ovMiniTxBody');
  if (ovTb) {
    ovTb.innerHTML = LEDGER.slice(0, 5).map(t => `
      <tr>
        <td>
          <span class="cell-title">${t.provider}</span>
          <span class="cell-sub">${t.target} · ${t.date}</span>
        </td>
        <td><span class="pill ${t.status === 'ok' ? 'pos' : 'warn'}">${t.status === 'ok' ? 'Onaylandı' : 'Kuyrukta'}</span></td>
        <td class="n"><strong>${fmtTL(t.amount)}</strong></td>
        <td class="n ${t.profit > 0 ? 'pos-num' : ''}">${t.profit > 0 ? '+' + fmtTL(t.profit) : '₺0,00'}</td>
        <td class="n"><button type="button" class="btn sm" onclick="openReceiptByRef('${t.ref}')">Fiş</button></td>
      </tr>
    `).join('');
  }

  const fullTb = document.getElementById('ledgerFullBody');
  if (fullTb) {
    if (filtered.length === 0) {
      fullTb.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:28px; color:var(--muted);">Seçili filtrede cari hareket bulunmuyor.</td></tr>`;
    } else {
      fullTb.innerHTML = filtered.map(t => `
        <tr>
          <td>
            <code>#${t.ref}</code>
            <span class="cell-sub">${t.date}</span>
          </td>
          <td>${t.type}</td>
          <td>
            <span class="cell-title">${t.provider}</span>
            <span class="cell-sub">${t.target}</span>
          </td>
          <td class="n">${fmtTL(t.before)}</td>
          <td class="n"><strong>${fmtTL(t.amount)}</strong></td>
          <td class="n ${t.profit > 0 ? 'pos-num' : ''}">${t.profit > 0 ? '+' + fmtTL(t.profit) : '₺0,00'}</td>
          <td class="n"><strong>${fmtTL(t.after)}</strong></td>
          <td><span class="pill ${t.status === 'ok' ? 'pos' : 'warn'}">${t.status === 'ok' ? 'Onaylandı' : 'Operatörde'}</span></td>
          <td class="n"><button type="button" class="btn sm" onclick="openReceiptByRef('${t.ref}')">Dekont</button></td>
        </tr>
      `).join('');
    }
  }
}

function downloadLedgerCsv() {
  const head = ['Referans', 'Tarih', 'Tur', 'Kurum_Paket', 'Abone_Hedef', 'Onceki_Bakiye', 'Tutar', 'Net_Kar', 'Sonraki_Bakiye', 'Durum'];
  const lines = LEDGER.map(t => [t.ref, t.date, t.type, t.provider, t.target, t.before, t.amount, t.profit, t.after, t.status]);
  const csv = '\uFEFF' + [head, ...lines].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'faturapay-cari-ekstre.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('Muhasebe cari ekstresi CSV formatında indirildi.');
}

function openZReportModal() {
  const todayRows = LEDGER.filter(x => x.day === 'today' && x.status === 'ok');
  const turnover = todayRows.reduce((s, x) => s + x.amount, 0);
  const profit = todayRows.reduce((s, x) => s + x.profit, 0);
  document.getElementById('zRepCount').textContent = todayRows.length + ' onaylı işlem';
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
      <td><code>#${t.id}</code><span class="cell-sub">${t.date}</span></td>
      <td>
        <span class="cell-title">${t.subject}</span>
        <span class="cell-sub">Merkez yanıtı: ${t.reply}</span>
      </td>
      <td>${t.category}</td>
      <td><span class="pill pos">${t.status}</span></td>
    </tr>
  `).join('');
}

function createSupportTicket() {
  const subj = document.getElementById('ticketSubject').value.trim();
  const cat = document.getElementById('ticketCat').value;
  if (!subj) return toast('Lütfen işlem referans numarasını ve açıklamayı yazın.');
  TICKETS.unshift({
    id: 'TLP-' + Math.floor(410 + Math.random() * 500),
    date: 'Şimdi',
    subject: subj,
    category: cat,
    status: 'İnceleniyor',
    reply: 'Talebiniz merkez operasyon birimine iletildi; sonuç SMS ile bildirilecektir.'
  });
  document.getElementById('ticketSubject').value = '';
  renderTickets();
  toast('Destek ve mutabakat kaydınız merkeze iletildi.');
}

// ==================== SUPER ADMIN: SUB-DEALERS, PRICE MATRIX, QUEUES & CRON ====================
function renderSubDealers() {
  const q = (document.getElementById('subDealerSearch')?.value || '').toLowerCase();
  const filtered = SUB_DEALERS.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.city.toLowerCase().includes(q));

  const tb = document.getElementById('subDealersTable');
  if (!tb) return;
  tb.innerHTML = filtered.map((d, idx) => `
    <tr>
      <td>
        <span class="cell-title">${d.name}</span>
        <span class="cell-sub"><code>${d.code}</code> · ${d.parent} (${d.city})</span>
      </td>
      <td>
        <span>${d.contact}</span>
        <span class="cell-sub">IP: <code>${d.ipLock}</code></span>
      </td>
      <td><span class="pill">${STATE.tiers[d.tier]?.name || d.tier}</span></td>
      <td class="n">
        <strong>${fmtTL(d.balance)}</strong>
        <span class="cell-sub">Kredi: +${fmtTL(d.limit)}</span>
      </td>
      <td><span class="pill ${d.active ? 'pos' : 'neg'}">${d.active ? 'Aktif' : 'Askıda'}</span></td>
      <td class="n">
        <div style="display:inline-flex; gap:6px; flex-wrap:nowrap; justify-content:flex-end;">
          <button type="button" class="btn sm" onclick="adjustSubDealer(${idx}, 2500)">+₺2.500</button>
          <button type="button" class="btn sm primary" onclick="impersonateDealer(${idx})">Gişeye geç</button>
          <button type="button" class="btn sm" onclick="SUB_DEALERS[${idx}].active=!SUB_DEALERS[${idx}].active; renderSubDealers();">${d.active ? 'Durdur' : 'Aç'}</button>
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
  if (!nm) return toast('Lütfen bayi veya gişe ünvanını girin.');

  SUB_DEALERS.unshift({
    code: 'BY-' + Math.floor(1050 + Math.random() * 900),
    parent: 'Merkez Dağıtıcı',
    name: nm,
    city: city || 'İzmir / Konak',
    contact: phone || 'Yetkili tanımlı',
    tier,
    balance: bal,
    limit: lim,
    ipLock: 'Dinamik (SMS 2FA)',
    active: true
  });
  document.getElementById('admDealerName').value = '';
  renderSubDealers();
  toast(`${nm} alt bayisi açıldı ve giriş bilgileri SMS ile gönderildi.`);
}

function adjustSubDealer(idx, delta) {
  SUB_DEALERS[idx].balance = +(SUB_DEALERS[idx].balance + delta).toFixed(2);
  if (idx === 0) STATE.balance = SUB_DEALERS[0].balance;
  syncWalletUI();
  toast(`${SUB_DEALERS[idx].name} carisine +${fmtTL(delta)} bakiye eklendi.`);
}

function impersonateDealer(idx) {
  const d = SUB_DEALERS[idx];
  STATE.activeTierKey = d.tier;
  STATE.balance = d.balance;
  STATE.creditLimit = d.limit;
  document.getElementById('activeBranchName').textContent = `${d.name} · ${d.code}`;
  syncWalletUI();
  renderTierMatrixEditor();
  renderEpinCatalog();
  detectBinAndRenderInstallments();
  openAppView('terminal');
  toast(`${d.name} (${STATE.tiers[d.tier].name}) gişe oturumuna geçildi.`);
}

function renderTierMatrixEditor() {
  const tb = document.getElementById('tierMatrixBody');
  if (!tb) return;
  tb.innerHTML = Object.entries(STATE.tiers).map(([key, t]) => `
    <tr>
      <td>
        <span class="cell-title">${t.name}</span>
        ${STATE.activeTierKey === key ? '<span class="pill pos" style="margin-top:4px;">Aktif gişe grubu</span>' : ''}
      </td>
      <td class="n"><input type="number" step="0.1" class="input num" style="max-width:92px; height:32px; text-align:right; margin-left:auto;" value="${t.gsmDisc}" onchange="updateTierRate('${key}', 'gsmDisc', this.value)" aria-label="${t.name} GSM iskonto" /></td>
      <td class="n"><input type="number" step="0.5" class="input num" style="max-width:92px; height:32px; text-align:right; margin-left:auto;" value="${t.billComm}" onchange="updateTierRate('${key}', 'billComm', this.value)" aria-label="${t.name} fatura geliri" /></td>
      <td class="n"><input type="number" step="0.1" class="input num" style="max-width:92px; height:32px; text-align:right; margin-left:auto;" value="${t.epinDisc}" onchange="updateTierRate('${key}', 'epinDisc', this.value)" aria-label="${t.name} E-Pin marjı" /></td>
      <td class="n"><input type="number" step="0.05" class="input num" style="max-width:92px; height:32px; text-align:right; margin-left:auto;" value="${t.posRate}" onchange="updateTierRate('${key}', 'posRate', this.value)" aria-label="${t.name} POS komisyonu" /></td>
      <td class="n">
        <button type="button" class="btn sm" onclick="STATE.activeTierKey='${key}'; syncWalletUI(); renderTierMatrixEditor(); renderEpinCatalog(); detectBinAndRenderInstallments(); toast('Aktif gişe grubu ${t.name} olarak ayarlandı.');">
          Gişede dene
        </button>
      </td>
    </tr>
  `).join('');
}

function updateTierRate(key, field, val) {
  STATE.tiers[key][field] = Math.max(0, Number(val || 0));
  syncWalletUI();
  renderEpinCatalog();
  detectBinAndRenderInstallments();
  toast(`${STATE.tiers[key].name} komisyon oranı tüm terminallerde güncellendi.`);
}

function renderAdminQueues() {
  const pendingWires = WIRE_QUEUE.filter(w => w.status === 'pending').length;
  const pendingApps = DEALER_APPLICATIONS.filter(a => a.status === 'pending').length;
  const badge = document.getElementById('navAdminBadge');
  if (badge) {
    const sum = pendingWires + pendingApps;
    badge.textContent = String(sum);
    badge.style.display = sum > 0 ? 'inline-block' : 'none';
  }

  const wTb = document.getElementById('admWireBody');
  if (wTb) {
    wTb.innerHTML = WIRE_QUEUE.map((w, idx) => `
      <tr>
        <td>${w.date}</td>
        <td><span class="cell-title">${w.dealer}</span></td>
        <td>${w.bank}</td>
        <td class="n"><strong>${fmtTL(w.amount)}</strong></td>
        <td><span class="pill ${w.status === 'pending' ? 'warn' : 'pos'}">${w.status === 'pending' ? 'Bekliyor' : 'Onaylandı'}</span></td>
        <td class="n">
          ${w.status === 'pending'
            ? `<button type="button" class="btn sm primary" onclick="approveWireAdmin(${idx})">Onayla ve işle</button>`
            : '<span style="color:var(--muted); font-size:12px;">Cariye işlendi</span>'}
        </td>
      </tr>
    `).join('');
  }

  const aTb = document.getElementById('admAppsBody');
  if (aTb) {
    aTb.innerHTML = DEALER_APPLICATIONS.map((a, idx) => `
      <tr>
        <td>${a.date}</td>
        <td><span class="cell-title">${a.company}</span><span class="cell-sub">${a.city}</span></td>
        <td>${a.owner}<span class="cell-sub">${a.phone}</span></td>
        <td><span class="pill">${STATE.tiers[a.tier]?.name || a.tier}</span></td>
        <td class="n">
          ${a.status === 'pending'
            ? `<button type="button" class="btn sm primary" onclick="approveDealerApp(${idx})">Bayiliği aç</button>`
            : '<span class="pill pos">Açıldı</span>'}
        </td>
      </tr>
    `).join('');
  }

  const ipTb = document.getElementById('ipLogsBody');
  if (ipTb) {
    ipTb.innerHTML = IP_LOGS.map(l => `
      <tr>
        <td>${l.time}</td>
        <td><span class="cell-title">${l.actor}</span></td>
        <td><code>${l.ip}</code> · ${l.location}</td>
        <td><span class="pill ${l.ok ? 'pos' : 'warn'}">${l.event}</span></td>
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
  toast(`FAST bildirimi onaylandı; ${fmtTL(w.amount)} cari bakiyeye eklendi.`);
}

function approveDealerApp(idx) {
  const a = DEALER_APPLICATIONS[idx];
  if (!a || a.status !== 'pending') return;
  a.status = 'approved';
  SUB_DEALERS.unshift({
    code: 'BY-' + Math.floor(1100 + Math.random() * 800),
    parent: 'Online Başvuru',
    name: a.company,
    city: a.city,
    contact: `${a.owner} · ${a.phone}`,
    tier: a.tier,
    balance: 0,
    limit: 1000,
    ipLock: 'SMS 2FA Aktif',
    active: true
  });
  renderAdminQueues();
  renderSubDealers();
  toast(`${a.company} başvurusu onaylandı ve alt bayi hesabı açıldı.`);
}

function runCronPendingSync() {
  const pend = LEDGER.find(x => x.status === 'pending');
  if (!pend) return toast('Cron kontrolü: Kuyrukta bekleyen işlem yok, tüm hatlar güncel.');
  pend.status = 'ok';
  syncWalletUI();
  renderLedgerTables();
  toast(`Cron senkronizasyonu: #${pend.ref} (${pend.target}) operatör onayı kesinleştirildi.`);
}

// ==================== RECEIPT MODAL & WHATSAPP DISPATCH ====================
function openReceiptByRef(ref) {
  const found = LEDGER.find(x => x.ref === ref) || LEDGER[0];
  openReceiptModal(found);
}

function openReceiptModal(tx) {
  STATE.lastReceiptTx = tx;
  const card = document.getElementById('rcpModalCard');
  card.classList.toggle('thermal', STATE.receiptFormat === 'thermal');
  document.getElementById('rcpToggleBtn').textContent = STATE.receiptFormat === 'thermal' ? 'A4 kurumsal görünüm' : '80mm termal görünüm';
  document.getElementById('rcpBrandTitle').textContent = document.getElementById('stBrandName').value || 'FaturaPay';
  document.getElementById('rcpRefCode').textContent = 'REF: #' + tx.ref;
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
  const card = document.getElementById('rcpModalCard');
  card.classList.toggle('thermal', STATE.receiptFormat === 'thermal');
  document.getElementById('rcpToggleBtn').textContent = STATE.receiptFormat === 'thermal' ? 'A4 kurumsal görünüm' : '80mm termal görünüm';
}

function shareReceiptWhatsapp() {
  const tx = STATE.lastReceiptTx || LEDGER[0];
  toast(`Dijital makbuz (#${tx.ref} · ${fmtTL(tx.amount)}) müşteri WhatsApp hattına hazırlandı.`);
}

// ==================== COMMAND PALETTE (Ctrl+K) ====================
function openCommandModal(open) {
  const bd = document.getElementById('cmdBackdrop');
  bd.classList.toggle('open', open);
  if (open) {
    const inp = document.getElementById('cmdSearchInput');
    inp.value = '';
    renderCommandList();
    setTimeout(() => inp.focus(), 40);
  }
}

function renderCommandList() {
  const q = (document.getElementById('cmdSearchInput')?.value || '').toLowerCase().trim();
  const listEl = document.getElementById('cmdResultsList');
  if (!listEl) return;
  const matches = COMMAND_ITEMS.filter(item => !q || item.label.toLowerCase().includes(q) || item.meta.toLowerCase().includes(q));
  listEl.innerHTML = matches.map((m, idx) => `
    <button type="button" class="op-tile" onclick="runCommandIndex(${COMMAND_ITEMS.indexOf(m)})">
      <span class="op-name">${m.label}</span>
      <span class="op-rate">${m.meta}</span>
    </button>
  `).join('') || `<div style="padding:14px; color:var(--muted); font-size:13px;">Eşleşen işlem bulunamadı.</div>`;
}

function runCommandIndex(i) {
  openCommandModal(false);
  COMMAND_ITEMS[i]?.run();
}

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandModal(true);
  } else if (e.key === 'Escape') {
    openCommandModal(false);
    openStudio(false);
    document.querySelectorAll('.backdrop.open').forEach(b => b.classList.remove('open'));
  }
});

// ==================== WHITE-LABEL THEME & DESIGN SYSTEM STUDIO ====================
function openStudio(open) {
  document.getElementById('studioDrawerWrap').classList.toggle('open', open);
}

function renderThemePresetCards() {
  const grid = document.getElementById('themePresetGrid');
  if (!grid) return;
  grid.innerHTML = WORLD_THEMES.map(t => `
    <button type="button" class="theme-card" aria-pressed="${STATE.activeTheme === t.id}" onclick="applyWorldTheme('${t.id}')">
      <span class="theme-swatches">
        ${t.swatches.map(hex => `<span class="sw-dot" style="background:${hex};"></span>`).join('')}
      </span>
      <span class="theme-name">${t.name}</span>
      <span class="theme-origin">${t.origin}</span>
    </button>
  `).join('');
}

function applyWorldTheme(themeId) {
  STATE.activeTheme = themeId;
  document.documentElement.setAttribute('data-world-theme', themeId);
  renderThemePresetCards();
  requestAnimationFrame(renderOverviewCharts);
  const found = WORLD_THEMES.find(x => x.id === themeId);
  if (found) toast(`Tasarım sistemi değiştirildi: ${found.name}`);
}

function updateLiveBrandIdentity() {
  const name = document.getElementById('stBrandName').value.trim() || 'FaturaPay';
  const shortTxt = document.getElementById('stBrandShort').value.trim() || 'FP';
  const phone = document.getElementById('stBrandPhone').value.trim() || '0850 308 00 00';
  const logoUrl = document.getElementById('stLogoUrl').value.trim();

  document.querySelectorAll('.js-brand-name').forEach(el => { el.textContent = name; });
  document.querySelectorAll('.js-brand-phone').forEach(el => { el.textContent = phone; });

  document.querySelectorAll('.js-brand-mark').forEach(el => {
    if (logoUrl) {
      el.innerHTML = `<img src="${logoUrl.replace(/"/g, '')}" alt="${name}" onerror="this.parentElement.textContent='${shortTxt.toUpperCase()}'" />`;
    } else if (shortTxt && shortTxt.toUpperCase() !== 'FP') {
      el.textContent = shortTxt.toUpperCase();
    } else {
      el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M5 12h10M5 17h6"/><path d="m15 15 4 2-4 2"/></svg>`;
    }
  });
  document.title = `${name} · TL Yükleme, Fatura Tahsilat ve Alt Bayi Otomasyonu`;
}

function setStudioShell(shellMode) {
  document.documentElement.setAttribute('data-shell', shellMode);
  ['framed-sheet', 'open-plane', 'topnav'].forEach(k => {
    document.getElementById('sh-' + k)?.setAttribute('aria-pressed', String(k === shellMode));
  });
  requestAnimationFrame(renderOverviewCharts);
}

function setStudioDensity(den) {
  document.documentElement.setAttribute('data-density', den);
  ['comfortable', 'compact'].forEach(k => {
    document.getElementById('dn-' + k)?.setAttribute('aria-pressed', String(k === den));
  });
  requestAnimationFrame(renderOverviewCharts);
}

function setStudioRadiusMode(px) {
  const r = Number(px);
  document.documentElement.style.setProperty('--radius-card', r + 'px');
  document.documentElement.style.setProperty('--radius-control', (r === 0 ? 0 : Math.max(4, Math.round(r * 0.75))) + 'px');
  document.documentElement.style.setProperty('--radius-sheet', (r === 0 ? 0 : 16) + 'px');
  [0, 8, 16].forEach(k => {
    document.getElementById('rd-' + k)?.setAttribute('aria-pressed', String(k === r));
  });
}

function setStudioReceipt(fmt) {
  STATE.receiptFormat = fmt;
  ['corporate', 'thermal'].forEach(k => {
    document.getElementById('rcp-' + k)?.setAttribute('aria-pressed', String(k === fmt));
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
    supportPhone: document.getElementById('stBrandPhone').value,
    designSystem: STATE.activeTheme,
    shell: document.documentElement.getAttribute('data-shell'),
    density: document.documentElement.getAttribute('data-density'),
    receiptFormat: STATE.receiptFormat
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'faturapay-tasarim-sistemi.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Tasarım ve marka yapılandırması JSON olarak indirildi.');
}

function resetStudioAll() {
  document.getElementById('stBrandName').value = 'FaturaPay';
  document.getElementById('stBrandShort').value = 'FP';
  document.getElementById('stBrandPhone').value = '0850 308 00 00';
  document.getElementById('stLogoUrl').value = '';
  updateLiveBrandIdentity();
  applyWorldTheme('framed-sheet');
  setStudioShell('framed-sheet');
  setStudioDensity('comfortable');
  setStudioRadiusMode(8);
  setStudioReceipt('corporate');
}

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
  renderThemePresetCards();
  renderOperators();
  renderGsmPackages();
  selectBillCategory('elektrik');
  renderMultiBillCart();
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
  renderOverviewCharts();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (STATE.activeView === 'overview') renderOverviewCharts();
    });
  }
});
