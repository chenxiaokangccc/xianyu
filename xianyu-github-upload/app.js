const STORAGE_KEY = "xianyu-hot-monitor-v3";

const sampleProducts = [
  {
    id: 10023,
    title: "iPhone 15 Pro 256G 原色钛金属 国行 99新 保修至2025-12",
    account: "数码玩家老王",
    price: 6399,
    wants: 2358,
    views: 18632,
    copy: "自用 iPhone 15 Pro 256G 原色钛金属，国行正品，99新，电池循环120次，无磕碰划痕，功能全部正常。原装盒子配件齐全，支持验机，爽快包邮。",
    link: "https://www.goofish.com/item?id=741234567890",
    status: "normal",
    note: "热度上升",
    checked: true,
    history: [
      ["2025-05-14", 6699, 1798, 14532, "iPhone 15 Pro 256G 原色钛金属 国行 99新", "自用机，功能正常，支持验机。"],
      ["2025-05-15", 6699, 1856, 15120, "iPhone 15 Pro 256G 原色钛金属 国行 99新", "自用机，功能正常，支持验机。"],
      ["2025-05-16", 6599, 1942, 15832, "iPhone 15 Pro 256G 原色钛金属 国行 99新", "自用机，配件齐全，支持验机。"],
      ["2025-05-17", 6599, 2048, 16621, "iPhone 15 Pro 256G 原色钛金属 国行 99新 保修中", "自用机，配件齐全，支持验机。"],
      ["2025-05-18", 6499, 2156, 17420, "iPhone 15 Pro 256G 原色钛金属 国行 99新 保修中", "自用机，配件齐全，支持验机，爽快包邮。"],
      ["2025-05-19", 6499, 2202, 17740, "iPhone 15 Pro 256G 原色钛金属 国行 99新 保修中", "自用机，配件齐全，支持验机，爽快包邮。"],
      ["2025-05-20", 6399, 2358, 18632, "iPhone 15 Pro 256G 原色钛金属 国行 99新 保修至2025-12", "自用 iPhone 15 Pro 256G 原色钛金属，国行正品，99新，电池循环120次，无磕碰划痕，功能全部正常。原装盒子配件齐全，支持验机，爽快包邮。"]
    ]
  },
  {
    id: 10024,
    title: "索尼 WH-1000XM5 头戴式降噪耳机 黑色 国行",
    account: "耳机发烧友",
    price: 1299,
    wants: 1122,
    views: 9562,
    copy: "通勤自用，降噪正常，耳罩轻微使用痕迹，原盒发票都在。",
    link: "https://www.goofish.com/item?id=741234567891",
    status: "normal",
    note: "稳定",
    history: buildHistory(1299, 1122, 9562, "索尼 WH-1000XM5 头戴式降噪耳机 黑色", "通勤自用，降噪正常，原盒发票都在。", 34, 412)
  },
  {
    id: 10025,
    title: "Switch OLED 白色 日版 续航版 带塞尔达王国之泪",
    account: "游戏宅小明",
    price: 1650,
    wants: 892,
    views: 6521,
    copy: "机器成色很好，屏幕无划痕，Joy-Con 无漂移，送保护壳和游戏卡。",
    link: "https://www.goofish.com/item?id=741234567892",
    status: "normal",
    note: "改标题",
    history: buildHistory(1650, 892, 6521, "Switch OLED 白色 日版 续航版", "机器成色很好，屏幕无划痕，送保护壳。", -12, 210, 50, true)
  },
  {
    id: 10026,
    title: "佳能 EOS R50 微单相机 18-45 套机 女生自用",
    account: "摄影小白",
    price: 4200,
    wants: 652,
    views: 3215,
    copy: "旅行拍照用，快门少，镜头无霉无灰，补充备用电池和内存卡信息。",
    link: "https://www.goofish.com/item?id=741234567893",
    status: "normal",
    note: "补充配件信息",
    history: buildHistory(4200, 652, 3215, "佳能 EOS R50 微单相机 18-45 套机", "旅行拍照用，快门少，镜头无霉无灰。", 5, 88, 0, false, true)
  },
  {
    id: 10027,
    title: "AirPods Pro 2 全新未拆封 USB-C 版 国行",
    account: "果粉之家",
    price: 1499,
    wants: 2015,
    views: 12845,
    copy: "公司年会奖品，全新未拆封，序列号可查，支持当面验。",
    link: "https://www.goofish.com/item?id=741234567894",
    status: "normal",
    note: "热度较高",
    history: buildHistory(1499, 2015, 12845, "AirPods Pro 2 全新未拆封 USB-C 版", "公司年会奖品，全新未拆封，序列号可查。", 104, 623, -60)
  },
  {
    id: 10028,
    title: "显卡 RTX 4070 12G 万图师 个人自用",
    account: "显卡玩家联盟",
    price: 4199,
    wants: 412,
    views: 2154,
    copy: "个人游戏机拆下，非矿，箱说齐全。",
    link: "https://www.goofish.com/item?id=741234567895",
    status: "failed",
    note: "抓取失败",
    history: buildHistory(4199, 412, 2154, "显卡 RTX 4070 12G 万图师 个人自用", "个人游戏机拆下，非矿。", 0, 0)
  },
  {
    id: 10029,
    title: "MacBook Air M2 13英寸 16G 512G 午夜色",
    account: "轻薄本小铺",
    price: 6299,
    wants: 1002,
    views: 5321,
    copy: "办公轻度使用，外观成色好，疑似链接已下架待确认。",
    link: "https://www.goofish.com/item?id=741234567896",
    status: "removed",
    note: "疑似下架",
    history: buildHistory(6299, 1002, 5321, "MacBook Air M2 13英寸 16G 512G 午夜色", "办公轻度使用，外观成色好。", 0, 0)
  }
];

let state = loadState();
let selectedId = state.selectedId || state.products[0]?.id;
let statusFilter = "all";
let isApplyingRemote = false;
let saveTimer = null;
let lastRemoteUpdatedAt = 0;

const el = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("zh-CN");
const money = (value) => `¥${fmt.format(value)}`;

function buildHistory(price, wants, views, title, copy, wantDelta, viewDelta, priceDelta = 0, titleChanged = false, copyChanged = false) {
  const dates = ["2025-05-14", "2025-05-15", "2025-05-16", "2025-05-17", "2025-05-18", "2025-05-19", "2025-05-20"];
  return dates.map((date, index) => {
    const factor = 6 - index;
    const rowPrice = index === 6 ? price : price - priceDelta;
    const rowTitle = titleChanged && index === 6 ? `${title} 带游戏` : title;
    const rowCopy = copyChanged && index === 6 ? `${copy} 补充配件信息。` : copy;
    return [
      date,
      rowPrice,
      Math.max(0, wants - wantDelta * factor - index * 8),
      Math.max(0, views - viewDelta * factor - index * 30),
      rowTitle,
      rowCopy
    ];
  });
}

function loadState() {
  const fallback = {
    products: structuredClone(sampleProducts).map((product) => ({
      ...product,
      isDemo: true,
      hasSnapshot: true
    })),
    settings: {
      crawlerCookie: ""
    },
    lastUpdatedAt: "2025-05-20 10:30:00",
    lastAutoRunDate: "",
    selectedId: sampleProducts[0].id
  };
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        ...fallback,
        ...parsed,
        products: (parsed.products && parsed.products.length ? parsed.products : fallback.products).map((product) => ({
          ...product,
          isDemo: product.isDemo ?? isDemoLink(product.link),
          hasSnapshot: product.hasSnapshot ?? !String(product.title || "").startsWith("待采集商品")
        })),
        settings: parsed.settings || fallback.settings
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  return fallback;
}

function saveState() {
  state.selectedId = selectedId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    settings: state.settings || { crawlerCookie: "" },
    selectedId
  }));
  if (!isApplyingRemote) {
    scheduleSharedSave();
  }
}

function sharedPayload() {
  return {
    products: state.products.map((product) => {
      const clean = { ...product };
      delete clean.checked;
      return clean;
    }),
    lastUpdatedAt: state.lastUpdatedAt || "",
    lastAutoRunDate: state.lastAutoRunDate || ""
  };
}

function scheduleSharedSave() {
  if (window.location.protocol === "file:") return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveSharedState, 500);
}

async function saveSharedState() {
  if (window.location.protocol === "file:") return;
  try {
    const response = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sharedPayload())
    });
    if (!response.ok) return;
    const payload = await response.json();
    lastRemoteUpdatedAt = payload.updatedAt || lastRemoteUpdatedAt;
  } catch {
    // Keep local interaction usable if the shared backend is unavailable.
  }
}

async function loadSharedState({ quiet = false } = {}) {
  if (window.location.protocol === "file:") return false;
  try {
    const response = await fetch("/api/state");
    if (!response.ok) return false;
    const payload = await response.json();
    if (payload.empty && state.products.length) {
      await saveSharedState();
      return false;
    }
    if (!payload.products || !payload.products.length) return false;
    if (payload.updatedAt && payload.updatedAt <= lastRemoteUpdatedAt) return false;
    const localSettings = state.settings || { crawlerCookie: "" };
    isApplyingRemote = true;
    state = {
      ...state,
      products: payload.products.map((product) => ({
        ...product,
        checked: false,
        isDemo: product.isDemo ?? isDemoLink(product.link),
        hasSnapshot: product.hasSnapshot ?? !String(product.title || "").startsWith("待采集商品")
      })),
      settings: localSettings,
      lastUpdatedAt: payload.lastUpdatedAt || "",
      lastAutoRunDate: payload.lastAutoRunDate || ""
    };
    if (!state.products.some((product) => product.id === selectedId)) {
      selectedId = state.products[0]?.id;
    }
    lastRemoteUpdatedAt = payload.updatedAt || Date.now();
    render();
    isApplyingRemote = false;
    if (!quiet) showToast("已同步共享数据");
    return true;
  } catch {
    isApplyingRemote = false;
    return false;
  }
}

function todayKey() {
  return el("currentDate").value || new Date().toISOString().slice(0, 10);
}

function nowText() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function getLatest(product) {
  return product.history.at(-1);
}

function getPrevious(product) {
  return product.history.at(-2) || getLatest(product);
}

function getChange(product) {
  const current = getLatest(product);
  const previous = getPrevious(product);
  return {
    price: current[1] - previous[1],
    wants: current[2] - previous[2],
    views: current[3] - previous[3],
    title: current[4] !== previous[4],
    copy: current[5] !== previous[5],
    priceDown: current[1] < previous[1],
    priceUp: current[1] > previous[1]
  };
}

function syncProductFromHistory(product) {
  const current = getLatest(product);
  product.price = current[1];
  product.wants = current[2];
  product.views = current[3];
  product.title = current[4];
  product.copy = current[5];
}

function render() {
  state.settings = state.settings || { crawlerCookie: "" };
  renderFileModeWarning();
  state.products.forEach((product) => {
    product.isDemo = product.isDemo ?? isDemoLink(product.link);
    if (product.isDemo && product.status === "failed") {
      product.status = "normal";
      product.note = "示例数据，不参与真实采集；请上传真实闲鱼链接";
    }
  });
  state.products.forEach(syncProductFromHistory);
  renderMetrics();
  renderTable();
  renderDetail();
  renderCookieStatus();
  el("sidebarUpdatedAt").textContent = state.lastUpdatedAt || "-";
  saveState();
}

function renderFileModeWarning() {
  const warning = el("fileModeWarning");
  if (!warning) return;
  warning.hidden = window.location.protocol !== "file:";
}

function renderMetrics() {
  const total = state.products.length;
  const failed = state.products.filter((item) => item.status === "failed").length;
  const removed = state.products.filter((item) => item.status === "removed").length;
  const success = total - failed;
  const createdToday = state.products.filter((item) => item.history.length === 1 && getLatest(item)[0] === todayKey()).length;
  el("metricTotal").textContent = fmt.format(total);
  el("metricTotalChange").textContent = `较昨日 +${createdToday}`;
  el("metricSuccess").textContent = fmt.format(success);
  el("metricSuccessRate").textContent = `成功率 ${total ? ((success / total) * 100).toFixed(2) : "0.00"}%`;
  el("metricFailed").textContent = fmt.format(failed);
  el("metricFailedDelta").textContent = `较昨日 +${failed}`;
  el("metricRemoved").textContent = fmt.format(removed);
  el("metricRemovedDelta").textContent = `较昨日 +${removed}`;
}

function filteredProducts() {
  const query = el("searchInput").value.trim().toLowerCase();
  return state.products.filter((product) => {
    const change = getChange(product);
    const matchesStatus =
      statusFilter === "all" ||
      product.status === statusFilter ||
      (statusFilter === "hot" && (change.wants > 50 || change.views > 400));
    const searchable = `${product.title} ${product.account} ${product.note}`.toLowerCase();
    return matchesStatus && (!query || searchable.includes(query));
  });
}

function renderTable() {
  const rows = filteredProducts();
  el("rowCount").textContent = `共 ${rows.length} 条`;
  el("productRows").innerHTML = rows
    .map((product) => {
      const change = getChange(product);
      const status = statusBadge(product.status);
      const priceBadge = change.priceDown
        ? `<span class="badge green">降价</span>`
        : change.priceUp
          ? `<span class="badge red">涨价</span>`
          : "无";
      return `
        <div class="table-row ${product.id === selectedId ? "active" : ""}" data-id="${product.id}">
          <label><input type="checkbox" ${product.checked ? "checked" : ""} data-check="${product.id}" /></label>
          <div class="title-cell"><strong title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</strong><small>ID: ${product.id}${product.isDemo ? " · 示例数据" : ""}</small></div>
          <span>${escapeHtml(product.account)}</span>
          <span>${product.hasSnapshot ? `<strong class="price-value">${money(product.price)}</strong> ${change.price ? `<em class="money-diff">${change.price > 0 ? "↑" : "↓"} ${Math.abs(change.price)}</em>` : `<em class="flat">-</em>`}` : `<em class="flat">待采集</em>`}</span>
          <span>${product.hasSnapshot ? `${fmt.format(product.wants)} ${deltaText(change.wants)}` : `<em class="flat">待采集</em>`}</span>
          <span>${product.hasSnapshot ? `${fmt.format(product.views)} ${deltaText(change.views)}` : `<em class="flat">待采集</em>`}</span>
          <span class="${change.wants >= 0 ? "up" : "down"}">${product.hasSnapshot ? fmt.format(change.wants) : "-"}</span>
          <span class="${change.views >= 0 ? "up" : "down"}">${product.hasSnapshot ? fmt.format(change.views) : "-"}</span>
          <span>${priceBadge}</span>
          <span>${change.title ? `<span class="badge amber">有</span>` : "无"}</span>
          <span>${change.copy ? `<span class="badge amber">有</span>` : "无"}</span>
          <span>${status}</span>
          <span>${escapeHtml(product.note || "-")}</span>
          <span class="row-actions">
            <button class="link-button" data-detail="${product.id}">查看详情</button>
            <button class="delete-button" data-delete="${product.id}">删除</button>
          </span>
        </div>
      `;
    })
    .join("");
}

function renderDetail() {
  const product = state.products.find((item) => item.id === selectedId) || state.products[0];
  if (!product) return;
  const change = getChange(product);
  const priceHistory = getHistoryForRange(product, parseInt(el("priceRange").value, 10));
  const wantHistory = getHistoryForRange(product, parseInt(el("wantRange").value, 10));
  const viewHistory = getHistoryForRange(product, parseInt(el("viewRange").value, 10));
  el("detailId").textContent = `ID: ${product.id}`;
  el("detailTitle").textContent = product.title;
  el("detailLink").href = product.link;
  el("detailLink").textContent = product.link;
  el("detailAccount").textContent = product.account;
  el("detailPrice").textContent = product.hasSnapshot ? money(product.price) : "待采集";
  el("detailWants").textContent = product.hasSnapshot ? fmt.format(product.wants) : "待采集";
  el("detailViews").textContent = product.hasSnapshot ? fmt.format(product.views) : "待采集";
  el("detailCopy").textContent = product.copy;
  el("detailPriceFlag").textContent = change.priceDown ? `今日降价 ¥${Math.abs(change.price)}` : change.priceUp ? `今日涨价 ¥${change.price}` : "今日未改价";
  el("detailWantsFlag").textContent = `今日新增 ${fmt.format(change.wants)}`;
  el("detailViewsFlag").textContent = `今日新增 ${fmt.format(change.views)}`;
  renderFlags(product, change);
  drawChart("priceChart", priceHistory.map((row) => row[1]), priceHistory.map((row) => row[0].slice(5)), "#2168f3", "¥");
  drawChart("wantChart", wantHistory.map((row) => row[2]), wantHistory.map((row) => row[0].slice(5)), "#16a34a", "");
  drawChart("viewChart", viewHistory.map((row) => row[3]), viewHistory.map((row) => row[0].slice(5)), "#2168f3", "");
  el("priceCallout").textContent = priceTrendText(priceHistory);
  el("wantCallout").textContent = countTrendText(wantHistory, 2, "想要");
  el("viewCallout").textContent = countTrendText(viewHistory, 3, "浏览");
}

function getHistoryForRange(product, days) {
  const history = product.history.filter((row) => row[1] !== null && row[2] !== null && row[3] !== null);
  return history.slice(-Math.max(1, days || 7));
}

function priceTrendText(history) {
  if (history.length < 2) return "等待更多采集记录";
  const diff = history.at(-1)[1] - history[0][1];
  if (diff < 0) return `近${history.length}次降价 ¥${fmt.format(Math.abs(diff))}`;
  if (diff > 0) return `近${history.length}次涨价 ¥${fmt.format(diff)}`;
  return `近${history.length}次价格不变`;
}

function countTrendText(history, index, label) {
  if (history.length < 2) return "等待更多采集记录";
  const diff = history.at(-1)[index] - history[0][index];
  return `近${history.length}次新增${label} ${fmt.format(diff)}`;
}

function deleteProducts(ids) {
  if (!ids.length) {
    showToast("请先选择要删除的商品");
    return;
  }
  const count = ids.length;
  if (!window.confirm(`确定删除 ${count} 个商品及其历史记录吗？`)) return;
  const removeSet = new Set(ids.map(Number));
  state.products = state.products.filter((product) => !removeSet.has(product.id));
  if (!state.products.some((product) => product.id === selectedId)) {
    selectedId = state.products[0]?.id;
  }
  render();
  showToast(`已删除 ${count} 个商品`);
}

function renderFlags(product, change) {
  const flags = {
    flagPriceDown: [change.priceDown ? "是" : "否", change.priceDown ? "is-good" : ""],
    flagPriceUp: [change.priceUp ? "是" : "否", change.priceUp ? "is-bad" : ""],
    flagTitle: [change.title ? "是" : "否", change.title ? "is-bad" : ""],
    flagCopy: [change.copy ? "是" : "否", change.copy ? "is-bad" : ""],
    flagWant: [`↑ ${fmt.format(change.wants)}`, change.wants > 0 ? "is-good" : ""],
    flagView: [`↑ ${fmt.format(change.views)}`, change.views > 0 ? "is-good" : ""],
    flagFailed: [product.status === "failed" ? "是" : "否", product.status === "failed" ? "is-bad" : ""],
    flagRemoved: [product.status === "removed" ? "是" : "否", product.status === "removed" ? "is-bad" : ""]
  };
  Object.entries(flags).forEach(([id, [text, className]]) => {
    const node = el(id);
    node.textContent = text;
    node.className = className;
  });
}

function deltaText(value) {
  if (value > 0) return `<em class="up">↑ ${fmt.format(value)}</em>`;
  if (value < 0) return `<em class="down">↓ ${fmt.format(Math.abs(value))}</em>`;
  return `<em class="flat">-</em>`;
}

function statusBadge(status) {
  const map = {
    normal: ["正常", "green"],
    failed: ["失败", "red"],
    removed: ["下架", "gray"],
    pending: ["待采集", "gray"]
  };
  const [label, color] = map[status] || ["未知", "gray"];
  return `<span class="badge ${color}">${label}</span>`;
}

function drawChart(canvasId, values, labels, color, prefix) {
  const canvas = el(canvasId);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const pad = 34;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = pad + (index * (width - pad * 2)) / Math.max(1, values.length - 1);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return { x, y, value, label: labels[index] };
  });

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e5ecf5";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = pad + (i * (height - pad * 2)) / 3;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(0, pad, 0, height - pad);
  gradient.addColorStop(0, `${color}30`);
  gradient.addColorStop(1, `${color}00`);
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(points.at(-1).x, height - pad);
  ctx.lineTo(points[0].x, height - pad);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  points.forEach((point, index) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = index === points.length - 1 ? color : "#667085";
    ctx.font = index === points.length - 1 ? "bold 12px Arial" : "12px Arial";
    ctx.fillText(`${prefix}${fmt.format(point.value)}`, point.x, Math.max(14, point.y - 10));
    ctx.fillStyle = "#667085";
    ctx.font = "12px Arial";
    ctx.fillText(point.label, point.x, height - 8);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const toast = el("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

async function addLinks() {
  const textareaLinks = parseLinks(el("linkTextarea").value);
  const file = el("linkFile").files[0];
  let fileLinks = [];
  if (file) {
    fileLinks = parseLinks(await file.text());
  }
  const links = [...new Set([...textareaLinks, ...fileLinks])];
  if (!links.length) {
    showToast("没有识别到可添加的链接");
    return;
  }
  const note = el("defaultNote").value.trim();
  const created = links.map((link, index) => createProductFromLink(link, note, index));
  state.products.unshift(...created);
  selectedId = created[0].id;
  state.lastUpdatedAt = nowText();
  el("linkTextarea").value = "";
  el("linkFile").value = "";
  el("defaultNote").value = "";
  el("addDialog").close();
  render();
  showToast(`已添加 ${created.length} 个监控商品`);
  await runDailyUpdate(false, created.map((item) => item.id));
}

function parseLinks(text) {
  return text
    .split(/[\n,\s]+/)
    .map((item) => item.trim())
    .filter((item) => /^https?:\/\/.+/i.test(item));
}

function createProductFromLink(link, note, index) {
  const id = Date.now() + index;
  const title = `待采集商品 ${String(id).slice(-5)}`;
  const copy = "已添加链接，等待下一次采集补全标题、价格、想要人数、浏览量与文案。";
  return {
    id,
    title,
    account: "待采集账号",
    price: 0,
    wants: 0,
    views: 0,
    copy,
    link,
    status: "pending",
    note: note || "新上传",
    checked: false,
    isDemo: false,
    hasSnapshot: false,
    history: [[todayKey(), 0, 0, 0, title, copy]]
  };
}

function isDemoLink(link) {
  return /^https:\/\/www\.goofish\.com\/item\?id=74123456789\d$/.test(link || "");
}

function hashCode(text) {
  return text.split("").reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0);
}

async function runDailyUpdate(isAuto = false, onlyIds = null) {
  const date = todayKey();
  const updateButton = el("runUpdate");
  updateButton.disabled = true;
  updateButton.textContent = "采集中...";
  const targetIds = onlyIds ? new Set(onlyIds) : null;
  let successCount = 0;
  let failCount = 0;
  for (const product of state.products) {
    if (targetIds && !targetIds.has(product.id)) continue;
    if (product.isDemo && !targetIds) {
      product.status = "normal";
      product.note = "示例数据，不参与真实采集；请上传真实闲鱼链接";
      continue;
    }
    const latest = getLatest(product);
    const isPlaceholder = product.title.startsWith("待采集商品") || product.account === "待采集账号";
    if (latest[0] === date && !isPlaceholder && !targetIds) continue;
    const next = await fetchXianyuSnapshot(product, date);
    product.status = next.status;
    product.account = next.account || product.account;
    product.note = next.note || product.note;
    if (next.status !== "normal") {
      failCount += 1;
      continue;
    }
    product.hasSnapshot = true;
    const snapshot = [date, next.price, next.wants, next.views, next.title, next.copy];
    if (latest[0] === date) {
      product.history[product.history.length - 1] = snapshot;
    } else {
      product.history.push(snapshot);
    }
    if (product.history.length > 90) product.history.shift();
    if (next.status === "normal") successCount += 1;
    else failCount += 1;
  }
  state.lastAutoRunDate = date;
  state.lastUpdatedAt = nowText();
  render();
  updateButton.disabled = false;
  updateButton.textContent = "立即更新";
  showToast(isAuto ? `今日自动采集完成，成功 ${successCount} 个，失败 ${failCount} 个` : `采集完成，成功 ${successCount} 个，失败 ${failCount} 个`);
}

async function fetchXianyuSnapshot(product, date) {
  const latest = getLatest(product);
  if (product.isDemo) {
    return {
      status: "normal",
      account: product.account,
      price: latest[1],
      wants: latest[2],
      views: latest[3],
      title: latest[4],
      copy: latest[5],
      note: "示例数据，不参与真实采集；请上传真实闲鱼链接"
    };
  }
  try {
    const cookie = normalizeCookie(state.settings?.crawlerCookie || "");
    const response = await fetch("/api/xianyu/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: product.link,
        date,
        cookie
      })
    });
    const payload = await response.json();
    if (!response.ok || payload.status === "failed") {
      throw new Error(payload.note || "采集失败");
    }
    return {
      status: payload.status || "normal",
      account: payload.account || product.account,
      price: Number(payload.price ?? latest[1]),
      wants: Number(payload.wants ?? latest[2]),
      views: Number(payload.views ?? latest[3]),
      title: payload.title || latest[4],
      copy: payload.copy || latest[5],
      note: payload.note || "真实采集"
    };
  } catch (error) {
    return {
      status: "failed",
      account: product.account,
      price: latest[1],
      wants: latest[2],
      views: latest[3],
      title: latest[4],
      copy: latest[5],
      note: error.message || "采集失败"
    };
  }
}

function normalizeCookie(cookie) {
  let text = String(cookie || "").trim();
  const curlMatch = text.match(/(?:-H|--header)\s+['"]cookie:\s*([^'"]+)['"]/i);
  if (curlMatch) {
    text = curlMatch[1];
  } else {
    const headerMatch = text.match(/(^|\n)\s*cookie\s*:\s*(.+?)(?=\n\S|$)/is);
    if (headerMatch) text = headerMatch[2].trim();
  }
  return text
    .replace(/^\s*cookie\s*:\s*/i, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("; ");
}

function renderCookieStatus() {
  const node = el("cookieStatus");
  if (!node) return;
  const cookie = normalizeCookie(state.settings?.crawlerCookie || "");
  if (!cookie) {
    node.textContent = "Cookie 状态：未保存";
    return;
  }
  node.textContent = cookie.includes("_m_h5_tk=")
    ? "Cookie 状态：已保存，包含 _m_h5_tk，可以调用闲鱼详情接口"
    : "Cookie 状态：已保存，但缺少 _m_h5_tk，可能只能尝试普通页面解析";
}

function simulateXianyuFetch(product, date) {
  const latest = getLatest(product);
  const seed = Math.abs(hashCode(`${product.id}-${date}`));
  const failRoll = seed % 100;
  const status = failRoll < 6 ? "failed" : failRoll > 95 ? "removed" : "normal";
  if (status !== "normal") {
    return {
      status,
      price: latest[1],
      wants: latest[2],
      views: latest[3],
      title: latest[4],
      copy: latest[5]
    };
  }
  const wantDelta = Math.max(0, (seed % 180) - 16);
  const viewDelta = Math.max(0, (seed % 920) - 40);
  const priceShift = seed % 8 === 0 ? -((seed % 5) + 1) * 20 : seed % 17 === 0 ? ((seed % 4) + 1) * 30 : 0;
  const title = seed % 13 === 0 ? `${latest[4]} 急出` : latest[4];
  const copy = seed % 11 === 0 ? `${latest[5]} 今日补充：可小刀，支持当面验货。` : latest[5];
  return {
    status,
    price: Math.max(1, latest[1] + priceShift),
    wants: latest[2] + wantDelta,
    views: latest[3] + viewDelta,
    title,
    copy
  };
}

function exportCsv() {
  const headers = ["商品标题", "账号名称", "当前价格", "当前想要", "当前浏览", "今日新增想要", "今日新增浏览", "是否改价", "是否改标题", "是否改文案", "状态", "备注", "商品链接"];
  const rows = filteredProducts().map((product) => {
    const change = getChange(product);
    return [
      product.title,
      product.account,
      product.price,
      product.wants,
      product.views,
      change.wants,
      change.views,
      change.price === 0 ? "否" : change.priceDown ? "降价" : "涨价",
      change.title ? "是" : "否",
      change.copy ? "是" : "否",
      product.status === "normal" ? "正常" : product.status === "failed" ? "失败" : "下架",
      product.note || "",
      product.link
    ];
  });
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `xianyu-monitor-${todayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  document.querySelectorAll("[data-open-add]").forEach((button) => {
    button.addEventListener("click", () => el("addDialog").showModal());
  });
  document.querySelectorAll("[data-open-crawler]").forEach((button) => {
    button.addEventListener("click", () => {
      el("crawlerCookie").value = state.settings?.crawlerCookie || "";
      renderCookieStatus();
      el("crawlerDialog").showModal();
    });
  });
  document.querySelectorAll(".nav-item[data-section]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      el(button.dataset.section).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  el("addLinks").addEventListener("click", (event) => {
    event.preventDefault();
    addLinks();
  });
  el("runUpdate").addEventListener("click", () => runDailyUpdate(false));
  el("refreshFromSidebar").addEventListener("click", () => runDailyUpdate(false));
  el("saveCrawler").addEventListener("click", (event) => {
    event.preventDefault();
    state.settings = state.settings || {};
    state.settings.crawlerCookie = normalizeCookie(el("crawlerCookie").value);
    saveState();
    renderCookieStatus();
    el("crawlerDialog").close();
    showToast("采集设置已保存");
  });
  el("crawlerCookie").addEventListener("input", () => {
    state.settings = state.settings || {};
    state.settings.crawlerCookie = normalizeCookie(el("crawlerCookie").value);
    saveState();
    renderCookieStatus();
  });
  el("testCrawler").addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/health");
      if (!response.ok) throw new Error("本地采集服务未启动");
      showToast("本地采集服务正常");
    } catch {
      showToast("本地采集服务未启动，请用 server.py 打开网站");
    }
  });
  el("exportCsv").addEventListener("click", exportCsv);
  el("searchInput").addEventListener("input", renderTable);
  el("statusFilters").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    statusFilter = button.dataset.status;
    el("statusFilters").querySelectorAll("button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderTable();
  });
  el("productRows").addEventListener("click", (event) => {
    const check = event.target.closest("[data-check]");
    if (check) {
      const product = state.products.find((item) => item.id === Number(check.dataset.check));
      product.checked = check.checked;
      saveState();
      return;
    }
    const deleteButton = event.target.closest("[data-delete]");
    if (deleteButton) {
      deleteProducts([Number(deleteButton.dataset.delete)]);
      return;
    }
    const trigger = event.target.closest("[data-detail], .table-row");
    if (!trigger) return;
    const row = event.target.closest(".table-row");
    selectedId = Number(trigger.dataset.detail || row?.dataset.id);
    render();
    el("detailSection").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  el("checkAll").addEventListener("change", (event) => {
    state.products.forEach((product) => {
      product.checked = event.target.checked;
    });
    renderTable();
    saveState();
  });
  el("deleteSelected").addEventListener("click", () => {
    const ids = state.products.filter((product) => product.checked).map((product) => product.id);
    deleteProducts(ids);
  });
  el("currentDate").addEventListener("change", () => render());
  ["priceRange", "wantRange", "viewRange"].forEach((id) => {
    el(id).addEventListener("change", renderDetail);
  });
}

function initDate() {
  el("currentDate").value = new Date().toISOString().slice(0, 10);
}

function maybeAutoUpdate() {
  const date = todayKey();
  if (state.lastAutoRunDate !== date) {
    runDailyUpdate(true);
  }
}

async function startApp() {
  initDate();
  bindEvents();
  await loadSharedState({ quiet: true });
  maybeAutoUpdate();
  render();
  window.setInterval(() => {
    loadSharedState({ quiet: true });
  }, 4000);
}

startApp();
