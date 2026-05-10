#!/usr/bin/env python3
import hashlib
import html
import json
import os
import re
import socketserver
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "4173"))
DATA_DIR = os.path.join(BASE_DIR, "data")
STATE_PATH = os.path.join(DATA_DIR, "shared-state.json")


class ReusableThreadingTCPServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


class XianyuMonitorHandler(SimpleHTTPRequestHandler):
    def end_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/health":
            self.end_json(200, {"ok": True, "service": "xianyu-crawler"})
            return
        if path == "/api/state":
            self.end_json(200, load_shared_state())
            return
        return super().do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        if path == "/api/state":
            length = int(self.headers.get("Content-Length", "0"))
            try:
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
            except json.JSONDecodeError:
                self.end_json(400, {"ok": False, "note": "请求内容不是有效 JSON"})
                return
            saved = save_shared_state(payload)
            self.end_json(200, saved)
            return

        if path != "/api/xianyu/snapshot":
            self.end_json(404, {"status": "failed", "note": "接口不存在"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError:
            self.end_json(400, {"status": "failed", "note": "请求内容不是有效 JSON"})
            return

        url = payload.get("url", "").strip()
        cookie = payload.get("cookie", "").strip()
        if not is_allowed_url(url):
            self.end_json(400, {"status": "failed", "note": "只支持闲鱼商品链接"})
            return

        try:
            try:
                snapshot = fetch_mtop_snapshot(url, cookie)
                self.end_json(200, snapshot)
                return
            except Exception as api_error:
                api_note = str(api_error)

            page = fetch_page(url, cookie)
            snapshot = parse_snapshot(page)
            if snapshot.get("status") == "failed" and api_note:
                snapshot["note"] = f"{snapshot.get('note', '采集失败')}；接口提示：{api_note}"
            self.end_json(200, snapshot)
        except urllib.error.HTTPError as error:
            if error.code in (404, 410):
                self.end_json(200, {"status": "removed", "note": "页面返回下架或不存在"})
            else:
                self.end_json(502, {"status": "failed", "note": f"闲鱼返回错误 {error.code}"})
        except TimeoutError:
            self.end_json(504, {"status": "failed", "note": "访问闲鱼超时"})
        except Exception as error:
            self.end_json(502, {"status": "failed", "note": str(error) or "采集失败"})


def load_shared_state():
    if not os.path.exists(STATE_PATH):
        return {
            "products": [],
            "lastUpdatedAt": "",
            "lastAutoRunDate": "",
            "updatedAt": 0,
            "empty": True,
        }
    try:
        with open(STATE_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError):
        return {
            "products": [],
            "lastUpdatedAt": "",
            "lastAutoRunDate": "",
            "updatedAt": 0,
            "empty": True,
        }
    data.setdefault("products", [])
    data.setdefault("lastUpdatedAt", "")
    data.setdefault("lastAutoRunDate", "")
    data.setdefault("updatedAt", 0)
    data["empty"] = False
    return data


def save_shared_state(payload):
    os.makedirs(DATA_DIR, exist_ok=True)
    products = payload.get("products", [])
    if not isinstance(products, list):
        products = []
    clean_products = []
    for product in products:
        if not isinstance(product, dict):
            continue
        clean = dict(product)
        clean.pop("checked", None)
        clean_products.append(clean)
    data = {
        "products": clean_products,
        "lastUpdatedAt": str(payload.get("lastUpdatedAt", "")),
        "lastAutoRunDate": str(payload.get("lastAutoRunDate", "")),
        "updatedAt": int(time.time() * 1000),
        "empty": False,
    }
    tmp_path = f"{STATE_PATH}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)
    os.replace(tmp_path, STATE_PATH)
    return data


def is_allowed_url(url):
    try:
        parsed = urllib.parse.urlparse(url)
    except ValueError:
        return False
    host = parsed.netloc.lower()
    return parsed.scheme in {"http", "https"} and any(name in host for name in ("goofish.com", "xianyu", "idlefish", "2.taobao.com"))


def fetch_page(url, cookie):
    clean_cookie = normalize_cookie(cookie)
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        "Referer": safe_header_value("https://www.goofish.com/"),
    }
    if clean_cookie:
        headers["Cookie"] = clean_cookie
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=18) as response:
        raw = response.read()
        charset = response.headers.get_content_charset() or "utf-8"
        return raw.decode(charset, errors="ignore")


def fetch_mtop_snapshot(url, cookie):
    item_id = extract_item_id(url)
    clean_cookie = normalize_cookie(cookie)
    if not item_id:
        raise ValueError("链接里没有识别到商品 ID")
    if not clean_cookie:
        raise ValueError("没有填写 Cookie，无法调用闲鱼详情接口")

    token = extract_mtop_token(clean_cookie)
    if not token:
        clean_cookie = bootstrap_mtop_cookie(clean_cookie, url, item_id)
        token = extract_mtop_token(clean_cookie)
    if not token:
        raise ValueError("Cookie 里缺少 _m_h5_tk；我已尝试自动获取 token，但闲鱼没有返回，请重新复制 www.goofish.com 页面里的完整 Cookie")

    last_error = None
    for api in ("mtop.taobao.idle.pc.detail", "mtop.taobao.idle.web.detail"):
        try:
            payload = call_mtop_api(api, item_id, clean_cookie, token, url)
            return parse_json_snapshot(payload)
        except Exception as error:
            last_error = error
    raise ValueError(str(last_error) or "闲鱼详情接口没有返回可识别数据")


def extract_item_id(url):
    parsed = urllib.parse.urlparse(url)
    params = urllib.parse.parse_qs(parsed.query)
    for key in ("id", "itemId", "item_id", "itemid"):
        if params.get(key):
            match = re.search(r"\d{8,}", params[key][0])
            if match:
                return match.group(0)
    match = re.search(r"(\d{8,})", url)
    return match.group(1) if match else None


def extract_mtop_token(cookie):
    match = re.search(r"(?:^|;\s*)_m_h5_tk=([^_;]+)", cookie)
    return match.group(1) if match else None


def bootstrap_mtop_cookie(cookie, referer, item_id):
    api = "mtop.taobao.idle.pc.detail"
    app_key = "12574478"
    timestamp = str(int(time.time() * 1000))
    data = json.dumps({"itemId": str(item_id)}, separators=(",", ":"), ensure_ascii=False)
    sign = hashlib.md5(f"&{timestamp}&{app_key}&{data}".encode("utf-8")).hexdigest()
    query = urllib.parse.urlencode({
        "jsv": "2.7.2",
        "appKey": app_key,
        "t": timestamp,
        "sign": sign,
        "v": "1.0",
        "type": "originaljson",
        "dataType": "json",
        "api": api,
        "data": data,
    })
    request_url = f"https://h5api.m.goofish.com/h5/{api}/1.0/?{query}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        "Origin": "https://www.goofish.com",
        "Referer": safe_header_value(referer),
        "Cookie": cookie,
    }
    request = urllib.request.Request(request_url, headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=18) as response:
            set_cookies = response.headers.get_all("Set-Cookie") or []
    except urllib.error.HTTPError as error:
        set_cookies = error.headers.get_all("Set-Cookie") or []
    return merge_cookie_headers(cookie, set_cookies)


def merge_cookie_headers(cookie, set_cookie_headers):
    merged = {}
    for part in normalize_cookie(cookie).split(";"):
        if "=" in part:
            key, value = part.strip().split("=", 1)
            merged[key] = value
    for header in set_cookie_headers:
        first = header.split(";", 1)[0].strip()
        if "=" in first:
            key, value = first.split("=", 1)
            merged[key] = safe_cookie_value(value)
    return "; ".join(f"{key}={value}" for key, value in merged.items())


def normalize_cookie(cookie):
    if not cookie:
        return ""
    text = str(cookie).strip()
    curl_cookie = re.search(r"(?:-H|--header)\s+['\"]cookie:\s*([^'\"]+)['\"]", text, re.I)
    if curl_cookie:
        text = curl_cookie.group(1)
    else:
        header_cookie = re.search(r"(^|\n)\s*cookie\s*:\s*(.+?)(?=\n\S|$)", text, re.I | re.S)
        if header_cookie:
            text = header_cookie.group(2).strip()
    text = re.sub(r"^\s*cookie\s*:\s*", "", text, flags=re.I)
    text = text.replace("\r", "\n")
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        text = "; ".join(lines)
    parts = []
    for part in text.split(";"):
        part = part.strip()
        if not part or "=" not in part:
            continue
        key, value = part.split("=", 1)
        key = re.sub(r"[^A-Za-z0-9_.$!#%&'*+^`|~-]", "", key.strip())
        value = value.strip()
        if not key:
            continue
        parts.append(f"{key}={safe_cookie_value(value)}")
    return "; ".join(parts)


def safe_cookie_value(value):
    safe_chars = "!#$%&'()*+-./0123456789:<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~"
    return "".join(char if char in safe_chars else urllib.parse.quote(char, safe="") for char in value)


def safe_header_value(value):
    try:
        value.encode("latin-1")
        return value
    except UnicodeEncodeError:
        return urllib.parse.quote(value, safe=":/?&=#%._-~;,+")


def call_mtop_api(api, item_id, cookie, token, referer):
    app_key = "12574478"
    timestamp = str(int(time.time() * 1000))
    data = json.dumps({"itemId": str(item_id)}, separators=(",", ":"), ensure_ascii=False)
    sign_src = f"{token}&{timestamp}&{app_key}&{data}"
    sign = hashlib.md5(sign_src.encode("utf-8")).hexdigest()
    query = urllib.parse.urlencode({
        "jsv": "2.7.2",
        "appKey": app_key,
        "t": timestamp,
        "sign": sign,
        "v": "1.0",
        "type": "originaljson",
        "dataType": "json",
        "api": api,
        "data": data,
    })
    request_url = f"https://h5api.m.goofish.com/h5/{api}/1.0/?{query}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "application/json,text/plain,*/*",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        "Origin": "https://www.goofish.com",
        "Referer": safe_header_value(referer),
        "Cookie": cookie,
    }
    request = urllib.request.Request(request_url, headers=headers)
    with urllib.request.urlopen(request, timeout=18) as response:
        raw = response.read().decode("utf-8", errors="ignore").strip()
    return parse_json_response(raw)


def parse_json_response(raw):
    if raw.startswith("{"):
        payload = json.loads(raw)
    else:
        match = re.search(r"\((\{.*\})\)\s*;?$", raw, re.S)
        if not match:
            raise ValueError("闲鱼接口返回内容不是 JSON")
        payload = json.loads(match.group(1))

    ret = payload.get("ret")
    if isinstance(ret, list) and ret and not str(ret[0]).startswith("SUCCESS"):
        raise ValueError(str(ret[0]))
    if isinstance(ret, str) and not ret.startswith("SUCCESS"):
        raise ValueError(ret)
    return payload


def parse_snapshot(page):
    text = html.unescape(page)
    if looks_removed(text):
        return {"status": "removed", "note": "页面疑似下架或不存在"}
    if looks_blocked(text):
        return {"status": "failed", "note": "闲鱼要求登录或出现安全验证，请在采集设置里填写 Cookie 后重试"}

    embedded = parse_embedded_json(text)
    if embedded:
        json_snapshot = parse_json_snapshot(embedded, allow_partial=True)
        if json_snapshot.get("status") == "normal":
            return json_snapshot

    title = first_text(text, TITLE_KEYS) or meta_content(text, "og:title") or page_title(text)
    account = first_text(text, ACCOUNT_KEYS) or "未识别账号"
    price = first_number(text, PRICE_KEYS) or chinese_price(text)
    wants = first_number(text, WANT_KEYS) or metric_count(text, WANT_LABELS)
    views = first_number(text, VIEW_KEYS) or metric_count(text, VIEW_LABELS)
    raw_copy = first_text(text, COPY_KEYS) or meta_content(text, "description") or ""

    title = clean_text(first_paragraph_title(raw_copy, title))
    account = clean_text(account)
    copy = clean_text(raw_copy)
    if title.endswith("-闲鱼") or title.endswith("_闲鱼"):
        title = title[:-3].strip(" -_")

    if not title or price is None:
        return {
            "status": "failed",
            "note": "没有从页面里识别到完整商品数据，可能需要登录 Cookie 或闲鱼隐藏了字段"
        }

    return {
        "status": "normal",
        "title": title,
        "account": account,
        "price": price,
        "wants": int(wants or 0),
        "views": int(views or 0),
        "copy": copy or title,
        "note": "真实采集"
    }


TITLE_KEYS = ["title", "itemTitle", "item_title", "subject", "name", "goodsTitle"]
ACCOUNT_KEYS = ["sellerNick", "sellerName", "nickName", "userNick", "nick", "userName", "accountName"]
PRICE_KEYS = ["price", "soldPrice", "reservePrice", "currentPrice", "salePrice", "priceText", "priceStr", "nowPrice"]
PRICE_CENT_KEYS = ["priceCent", "soldPriceCent", "reservePriceCent", "currentPriceCent", "salePriceCent"]
WANT_KEYS = ["wantCount", "wantedCount", "wantNum", "wantCnt", "wantQuantity", "collectCount", "favoriteCount", "want_count", "want_count_text"]
VIEW_KEYS = [
    "browseCount",
    "browseCnt",
    "browseNum",
    "browse_count",
    "browse_count_text",
    "viewCount",
    "viewCnt",
    "viewNum",
    "view_count",
    "visitCount",
    "visitCnt",
    "visitNum",
    "readCount",
    "readCnt",
    "readNum",
    "pv",
    "pageView",
    "pageViews",
    "totalViewCount",
]
COPY_KEYS = ["desc", "description", "itemDesc", "content", "detailDesc", "descText", "detail"]
WANT_LABELS = ["想要", "人想要", "want", "wanted"]
VIEW_LABELS = ["浏览", "浏览量", "次浏览", "view", "views", "browse", "browses", "pv"]


def parse_json_snapshot(payload, allow_partial=False):
    data = payload.get("data", payload) if isinstance(payload, dict) else payload
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except json.JSONDecodeError:
            data = payload

    flat_text = json.dumps(data, ensure_ascii=False)
    if looks_removed(flat_text):
        return {"status": "removed", "note": "页面疑似下架或不存在"}
    if looks_blocked(flat_text):
        return {"status": "failed", "note": "闲鱼要求登录或出现安全验证，请检查 Cookie 后重试"}

    item_do = find_dict_by_key(data, "itemDO") or find_dict_by_key(data, "item") or {}
    seller_do = find_dict_by_key(data, "sellerDO") or find_dict_by_key(data, "seller") or {}
    pair_metrics = extract_metric_pair(flat_text)

    raw_title = direct_text(item_do, TITLE_KEYS) or find_text_by_keys(data, TITLE_KEYS)
    account = clean_text(direct_text(seller_do, ACCOUNT_KEYS) or find_text_by_keys(data, ACCOUNT_KEYS)) or "未识别账号"
    price = direct_number(item_do, PRICE_KEYS) or find_number_by_keys(data, PRICE_KEYS)
    if price is None:
        cent_price = direct_number(item_do, PRICE_CENT_KEYS) or find_number_by_keys(data, PRICE_CENT_KEYS)
        price = round(cent_price / 100, 2) if cent_price is not None else None
    if price is None:
        price = chinese_price(flat_text)

    wants = direct_number(item_do, WANT_KEYS) or find_number_by_keys(data, WANT_KEYS)
    if wants is None:
        wants = pair_metrics.get("wants")
    if wants is None:
        wants = metric_count(flat_text, WANT_LABELS)
    views = direct_number(item_do, VIEW_KEYS) or find_number_by_keys(data, VIEW_KEYS)
    if views is None:
        views = pair_metrics.get("views")
    if views is None:
        views = find_number_by_key_hints(data, ["browse", "view", "visit", "read", "pv"])
    if views is None:
        views = metric_count(flat_text, VIEW_LABELS)
    raw_copy = direct_text(item_do, COPY_KEYS) or find_text_by_keys(data, COPY_KEYS)
    title = clean_text(first_paragraph_title(raw_copy, raw_title))
    copy = clean_text(raw_copy)

    if not title and not allow_partial:
        raise ValueError("接口里没有识别到商品标题")
    if price is None and not allow_partial:
        raise ValueError("接口里没有识别到红色价格")
    if wants is None and not allow_partial:
        raise ValueError("接口里没有识别到想要人数")
    if views is None and not allow_partial:
        raise ValueError("接口里没有识别到浏览量")
    if not title or price is None:
        return {"status": "failed", "note": "没有从结构化数据里识别到完整商品数据"}
    if wants is None or views is None:
        missing = "想要人数" if wants is None else "浏览量"
        return {"status": "failed", "note": f"已识别部分商品数据，但没有采集到{missing}，不会用 0 冒充真实数据"}

    return {
        "status": "normal",
        "title": title,
        "account": account,
        "price": price,
        "wants": int(wants or 0),
        "views": int(views or 0),
        "copy": copy or title,
        "note": "真实采集"
}


def find_dict_by_key(obj, target_key):
    target = target_key.lower()
    for key, value in walk_json(obj):
        if key.lower() == target and isinstance(value, dict):
            return value
    return None


def direct_text(obj, keys):
    if not isinstance(obj, dict):
        return None
    normalized = {key.lower() for key in keys}
    for key, value in obj.items():
        if str(key).lower() in normalized:
            text = stringify_value(value)
            if text:
                return text
    return None


def direct_number(obj, keys):
    text = direct_text(obj, keys)
    return parse_number(text) if text is not None else None


def parse_embedded_json(text):
    candidates = []
    for pattern in (
        r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>(.*?)</script>',
        r"window\.__INITIAL_STATE__\s*=\s*(\{.*?\})\s*</script>",
        r"window\.__NUXT__\s*=\s*(\{.*?\})\s*</script>",
    ):
        candidates.extend(re.findall(pattern, text, re.I | re.S))
    for candidate in candidates:
        try:
            return json.loads(html.unescape(candidate).strip())
        except json.JSONDecodeError:
            continue
    return None


def find_text_by_keys(obj, keys):
    normalized = {key.lower() for key in keys}
    for key, value in walk_json(obj):
        if key.lower() in normalized:
            text = stringify_value(value)
            if text:
                return text
    return None


def find_number_by_keys(obj, keys):
    normalized = {key.lower() for key in keys}
    for key, value in walk_json(obj):
        if key.lower() in normalized:
            number = parse_number(stringify_value(value))
            if number is not None:
                return number
    return None


def find_number_by_key_hints(obj, hints):
    normalized = [hint.lower() for hint in hints]
    skip = ("width", "height", "image", "pic", "avatar", "time", "timestamp", "pageNumber", "preview", "url", "uri", "schema")
    for key, value in walk_json(obj):
        key_lower = key.lower()
        if any(word.lower() in key_lower for word in skip):
            continue
        if any(hint in key_lower for hint in normalized):
            number = parse_number(stringify_value(value))
            if number is not None:
                return number
    return None


def walk_json(obj):
    if isinstance(obj, dict):
        for key, value in obj.items():
            yield str(key), value
            yield from walk_json(value)
    elif isinstance(obj, list):
        for item in obj:
            yield from walk_json(item)


def stringify_value(value):
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        for key in ("text", "value", "amount", "price", "content", "desc", "title"):
            if key in value:
                return stringify_value(value[key])
    return ""


def looks_blocked(text):
    blocked_words = ["登录", "验证码", "安全验证", "滑块", "x5sec", "punish", "captcha", "访问受限"]
    return any(word in text for word in blocked_words) and not any(word in text for word in ["商品", "价格", "想要"])


def looks_removed(text):
    return any(word in text for word in ["宝贝不存在", "商品不存在", "已下架", "页面不存在", "来晚了"])


def first_text(text, keys):
    for key in keys:
        patterns = [
            rf'"{re.escape(key)}"\s*:\s*"([^"]{{1,800}})"',
            rf"'{re.escape(key)}'\s*:\s*'([^']{{1,800}})'",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return decode_js_text(match.group(1))
    return None


def first_number(text, keys):
    for key in keys:
        patterns = [
            rf'"{re.escape(key)}"\s*:\s*"?([\d.,万]+)"?',
            rf"'{re.escape(key)}'\s*:\s*'?([\d.,万]+)'?",
        ]
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return parse_number(match.group(1))
    return None


def meta_content(text, name):
    patterns = [
        rf'<meta[^>]+property=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
        rf'<meta[^>]+name=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return match.group(1)
    return None


def page_title(text):
    match = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
    return match.group(1) if match else None


def chinese_price(text):
    match = re.search(r"[¥￥]\s*([\d.,]+)", text)
    return parse_number(match.group(1)) if match else None


def metric_count(text, labels):
    if not text:
        return None
    clean = html.unescape(str(text))
    for label in labels:
        escaped = re.escape(label)
        patterns = [
            rf"([\d.,万]+)\s*(?:人|次)?\s*{escaped}",
            rf"{escaped}\s*[:：]?\s*([\d.,万]+)",
            rf'"[^"]*{escaped}[^"]*"\s*:\s*"?([\d.,万]+)"?',
        ]
        for pattern in patterns:
            match = re.search(pattern, clean, re.I)
            if match:
                number = parse_number(match.group(1))
                if number is not None:
                    return number
    return None


def extract_metric_pair(text):
    clean = html.unescape(str(text or ""))
    patterns = [
        r"([\d.,万]+)\s*人?\s*想要\s*[|｜/、,，\s]+([\d.,万]+)\s*(?:次)?\s*浏览",
        r"想要\s*[:：]?\s*([\d.,万]+).*?浏览\s*[:：]?\s*([\d.,万]+)",
        r"want\w*[^0-9]{0,20}([\d.,万]+).*?(?:browse|view|pv)\w*[^0-9]{0,20}([\d.,万]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, clean, re.I | re.S)
        if match:
            return {
                "wants": parse_number(match.group(1)),
                "views": parse_number(match.group(2)),
            }
    return {}


def parse_number(value):
    if value is None:
        return None
    raw = str(value).replace(",", "").strip()
    raw = raw.replace("¥", "").replace("￥", "").replace("元", "").replace("+", "")
    multiplier = 10000 if "万" in raw else 1
    raw = raw.replace("万", "")
    match = re.search(r"\d+(?:\.\d+)?", raw)
    if match:
        raw = match.group(0)
    try:
        number = float(raw) * multiplier
    except ValueError:
        return None
    return int(number) if number.is_integer() else round(number, 2)


def decode_js_text(value):
    try:
        return json.loads(f'"{value}"')
    except Exception:
        return value


def clean_text(value):
    if not value:
        return ""
    return re.sub(r"\s+", " ", html.unescape(str(value))).strip()


def first_paragraph_title(copy, fallback):
    source = copy or fallback or ""
    source = html.unescape(str(source))
    source = re.sub(r"<br\s*/?>", "\n", source, flags=re.I)
    source = re.sub(r"</p\s*>", "\n", source, flags=re.I)
    source = re.sub(r"<[^>]+>", " ", source)
    parts = [clean_text(part) for part in re.split(r"\n+|\r+|\\n+", source) if clean_text(part)]
    if parts:
        return parts[0]
    return clean_text(source)


if __name__ == "__main__":
    os.chdir(BASE_DIR)
    with ReusableThreadingTCPServer(("", PORT), XianyuMonitorHandler) as httpd:
        print(f"闲鱼爆款监控已启动：http://localhost:{PORT}/index.html")
        httpd.serve_forever()
