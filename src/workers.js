const API = "https://www.googleapis.com/drive/v3/files";
const FOLDER = "application/vnd.google-apps.folder";
const VISIBLE = `(mimeType = '${FOLDER}' or not mimeType contains 'application/vnd.google-apps.')`;
const T = "text/plain; charset=utf-8";

const ALLOWED = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp",
    avif: "image/avif", bmp: "image/bmp", svg: "image/svg+xml", ico: "image/x-icon", heic: "image/heic",
    mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mkv: "video/x-matroska", mov: "video/quicktime", avi: "video/x-msvideo",
    mp3: "audio/mpeg", m4a: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", opus: "audio/ogg", wav: "audio/wav", flac: "audio/flac",
    pdf: "application/pdf", vtt: "text/vtt; charset=utf-8",
    rtf: "application/rtf", epub: "application/epub+zip",
    doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    odt: "application/vnd.oasis.opendocument.text",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ods: "application/vnd.oasis.opendocument.spreadsheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    odp: "application/vnd.oasis.opendocument.presentation",
    zip: "application/zip", rar: "application/vnd.rar", "7z": "application/x-7z-compressed", tar: "application/x-tar", gz: "application/gzip",
    apk: "application/vnd.android.package-archive", iso: "application/x-iso9660-image",
};
"txt md csv tsv json log srt ass lrc xml yml yaml ini toml conf cfg properties nfo diff patch html htm css scss less js mjs ts jsx tsx py java kt kts c h cpp hpp cs go rs php rb sh bat ps1 sql lua swift gradle tex r dart vue svelte".split(" ").forEach(e => { ALLOWED[e] = T; });

const ERROR_PAGE = "<html>\r\n<head><title>403 Forbidden</title></head>\r\n<body>\r\n<center><h1>403 Forbidden</h1></center>\r\n<hr><center>nginx</center>\r\n</body>\r\n</html>\r\n";
const INDEX_PATHS = new Set(["/", "/index", "/index.html", "/index.htm", "/index.php"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FAVICON = '<svg width="800" height="741.3696" viewBox="0 0 800 741.3696" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="a" width="168" height="154" x="12" y="18" maskUnits="userSpaceOnUse"><path fill="#fff" d="M63.09 37c14.626-25.333 51.193-25.334 65.819 0l45.033 78c14.626 25.334-3.657 57.001-32.91 57.001H50.967c-29.253 0-47.536-31.667-32.91-57.001Z"/></mask><g mask="url(#a)" transform="matrix(4.8140532,0,0,4.8140532,-62.146701,-86.652356)"><path fill="url(#b)" d="M206.905 172.02h-91.888l-19.015-32.934 45.944-79.578Z"/><path fill="url(#c)" d="M-14.919 172.006 50.04 59.494v.002L31.032 92.422h38.02L115 172.004l-129.918.001Z"/><path fill="url(#d)" d="M96.007-20.085 141.954 59.5l-19.011 32.928H31.048Z"/></g><defs><linearGradient id="b" x1="193.6" x2="103.09" y1="165.6" y2="111.21" gradientUnits="userSpaceOnUse"><stop offset=".09" stop-color="#ffe921"/><stop offset="1" stop-color="#fec700"/></linearGradient><linearGradient id="c" x1="114.4" x2="15.53" y1="181.61" y2="121.8" gradientUnits="userSpaceOnUse"><stop offset=".15" stop-color="#a9a8ff"/><stop offset=".33" stop-color="#6d97ff"/><stop offset=".48" stop-color="#3186ff"/></linearGradient><linearGradient id="d" x1="128.88" x2="28.7" y1="37.88" y2="84.64" gradientUnits="userSpaceOnUse"><stop offset=".55" stop-color="#0ebc5f"/><stop offset=".85" stop-color="#78c9ff"/></linearGradient></defs></svg>';

const appIcon = m => {
    const w = m ? 330 : 410, h = w * 741.3696 / 800, x = (512 - w) / 2, y = (512 - h) / 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><rect width="512" height="512"${m ? "" : ' rx="112"'} fill="#ffffff"/>` +
        FAVICON.replace('<svg width="800" height="741.3696"', `<svg x="${x}" y="${y}" width="${w}" height="${h}"`) + "</svg>";
};
const manifestFor = cfg => ({
    id: "/",
    name: cfg.name,
    short_name: cfg.name.slice(0, 12),
    description: cfg.name,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: cfg.favicon
        ? [{ src: cfg.favicon, sizes: "192x192 512x512", purpose: "any" }]
        : [
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
            { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
    shortcuts: [
        { name: "Shared", url: "/#/shared", icons: [] },
        { name: "Starred", url: "/#/starred", icons: [] },
        { name: "Recent", url: "/#/recent", icons: [] },
    ].map(s => ({ name: s.name, url: s.url })),
});
const SW_JS = `const V = "v1", C = "app-" + V, X = "ext-" + V;
const EXT = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.tailwindcss.com"];
const swr = async (r, name) => {
    const c = await caches.open(name);
    const h = await c.match(r);
    const f = fetch(r).then(n => { if (n.ok || n.type === "opaque") c.put(r, n.clone()); return n; }).catch(() => h);
    return h || f;
};
self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", e => {
    e.waitUntil((async () => {
        for (const k of await caches.keys()) if (k !== C && k !== X) await caches.delete(k);
        await self.clients.claim();
    })());
});
self.addEventListener("fetch", e => {
    const r = e.request;
    if (r.method !== "GET") return;
    const u = new URL(r.url);
    if (u.origin === location.origin) {
        if (r.mode === "navigate" && (u.pathname === "/" || u.pathname === "/index.html")) {
            e.respondWith((async () => {
                try {
                    const n = await fetch(r);
                    if (n.ok) { const c = await caches.open(C); c.put("/", n.clone()); }
                    return n;
                } catch (x) {
                    const c = await caches.match("/");
                    return c || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
                }
            })());
            return;
        }
        if (u.pathname === "/favicon.svg" || u.pathname === "/icon.svg" || u.pathname === "/icon-maskable.svg" || u.pathname === "/manifest.webmanifest") e.respondWith(swr(r, C));
        return;
    }
    if (EXT.includes(u.hostname)) e.respondWith(swr(r, X));
});
`;

let usageCache = { value: null, expires: 0 };
let tokenCache = { value: null, expires: 0 };
let dirsCache = { value: null, expires: 0 };
let usersCache = { value: null, expires: 0 };
let secretCache = null;
let setupDoneAt = 0;
const isDone = () => setupDoneAt > Date.now();
const markDone = () => { setupDoneAt = Date.now() + 30000; };
const resetCaches = () => {
    usageCache = { value: null, expires: 0 }; tokenCache = { value: null, expires: 0 }; dirsCache = { value: null, expires: 0 };
    usersCache = { value: null, expires: 0 }; cfgCache = { value: null, expires: 0 }; secretCache = null;
    folderCache.clear(); fileCache.clear(); metaCache.clear(); scopeCache.clear(); okCache.clear();
};
const SETUP_TYPES = ["root", "folder", "shared_drive"];
let rootId = null;
const folderCache = new Map();
const fileCache = new Map();
const metaCache = new Map();
const scopeCache = new Map();
const okCache = new Map();
const fails = new Map();
const enc = new TextEncoder();

let cfgCache = { value: null, expires: 0 };
const DEFAULT_CFG = { name: "Drive", favicon: "" };
const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function cleanConfig(c) {
    const name = String((c && c.name) || "").trim().slice(0, 40);
    const favicon = String((c && c.favicon) || "").trim();
    if (!name) return null;
    if (favicon) {
        if (favicon.length > 500) return null;
        try { if (!/^https?:$/.test(new URL(favicon).protocol)) return null; } catch (e) { return null; }
    }
    return { name, favicon };
}
async function getConfig(env) {
    if (!env.gdrive) return DEFAULT_CFG;
    if (cfgCache.value && cfgCache.expires > Date.now()) return cfgCache.value;
    const c = cleanConfig(await kvJson(env, "config")) || DEFAULT_CFG;
    cfgCache = { value: c, expires: Date.now() + 60000 };
    return c;
}
function brand(html, cfg) {
    return html
        .replaceAll("__NAME_JSON__", JSON.stringify(cfg.name).replace(/</g, "\\u003c"))
        .replaceAll("__NAME__", escHtml(cfg.name));
}

function page(body, status, headers = {}) {
    return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Server": "nginx", ...headers } });
}
function json(data, status = 200, headers = {}) {
    return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Server": "nginx", "Cache-Control": "no-store", ...headers } });
}

const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
const uid = u => String((u && (u.email || u.username)) || "").trim().toLowerCase();
const canEditU = u => !!u && (u.allowedit === true || u.allowedit === "true");

function safeEq(a, b) {
    a = String(a); b = String(b);
    let d = a.length ^ b.length;
    for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    return d === 0;
}
async function getSecret(env) {
    if (secretCache) return secretCache;
    let s = env.SESSION_SECRET || await env.gdrive.get("session_secret");
    if (!s) {
        s = b64u(crypto.getRandomValues(new Uint8Array(32)));
        await env.gdrive.put("session_secret", s);
    }
    return (secretCache = s);
}
async function sign(env, msg) {
    const key = await crypto.subtle.importKey("raw", enc.encode(await getSecret(env)), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return b64u(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
}
async function getUsers(env) {
    if (usersCache.value && usersCache.expires > Date.now()) return usersCache.value;
    let u;
    try { u = await env.gdrive.get("users", "json"); } catch (e) { throw new Error("users"); }
    usersCache = { value: Array.isArray(u) ? u : [], expires: Date.now() + 60000 };
    return usersCache.value;
}
async function readUsersRaw(env) {
    const u = await env.gdrive.get("users", "json");
    return Array.isArray(u) ? u : [];
}
async function saveUsers(env, list) {
    await env.gdrive.put("users", JSON.stringify(list));
    usersCache = { value: null, expires: 0 };
}
const cookieHeader = list => (list.length
    ? `sid=${list.join("~")}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
    : "sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
async function accounts(request, env) {
    const c = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)sid=([^;]*)/);
    if (!c) return [];
    const users = await getUsers(env);
    const out = [];
    for (const tk of c[1].split("~")) {
        const [u, exp, sig] = tk.split(".");
        if (!u || !sig || Number(exp) < Date.now()) continue;
        if (!safeEq(await sign(env, u + "." + exp), sig)) continue;
        let name;
        try { name = new TextDecoder().decode(unb64u(u)); } catch (e) { continue; }
        if (users.some(x => uid(x) === name) && !out.some(o => o.name === name)) out.push({ name, token: tk });
    }
    return out;
}
async function session(request, env, url, any) {
    const list = await accounts(request, env);
    if (!list.length) return null;
    if (any) return list[0].name;
    const raw = request.headers.get("X-U") ?? (url && url.searchParams.get("u"));
    const i = raw == null || raw === "" ? 0 : Number(raw);
    return list[i] ? list[i].name : null;
}
async function currentUser(request, env, url) {
    const name = await session(request, env, url);
    if (!name) return null;
    const u = (await getUsers(env)).find(x => uid(x) === name);
    return u ? { name, allowedit: canEditU(u) } : null;
}
async function apiLogout(request, env) {
    const list = await accounts(request, env);
    const raw = request.headers.get("X-U");
    const i = raw == null || raw === "" ? 0 : Number(raw);
    const rest = list.filter((_, k) => k !== i);
    return json({ users: rest.map(a => a.name) }, 200, { "Set-Cookie": cookieHeader(rest.map(a => a.token)) });
}
async function apiUsage(env) {
    if (usageCache.value && usageCache.expires > Date.now()) return json(usageCache.value);
    const token = await getToken(env);
    const j = await authFetch(token, "https://www.googleapis.com/drive/v3/about?fields=storageQuota");
    if (!j || !j.storageQuota) return json({ error: "Usage unavailable" }, 502);
    const q = j.storageQuota;
    const v = { limit: Number(q.limit) || 0, usage: Number(q.usage) || 0, drive: Number(q.usageInDrive) || 0, trash: Number(q.usageInDriveTrash) || 0 };
    usageCache = { value: v, expires: Date.now() + 300000 };
    return json(v);
}
const clientIp = request => request.headers.get("CF-Connecting-IP") || "x";
function isLocked(ip) {
    const f = fails.get(ip);
    return !!(f && f.until > Date.now());
}
async function addFail(ip) {
    const f = fails.get(ip);
    const base = f && (f.until === 0 || f.until > Date.now()) ? f.n : 0;
    const n = base + 1;
    fails.set(ip, { n, until: n >= 5 ? Date.now() + 60000 : 0 });
    await new Promise(r => setTimeout(r, 600));
}
async function readBody(request) {
    try { return (await request.json()) || {}; } catch (e) { return {}; }
}
async function apiCheck(request, env) {
    const ip = clientIp(request);
    if (isLocked(ip)) return json({ error: "Too many attempts. Try again in a minute." }, 429);
    const body = await readBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const users = await getUsers(env);
    if (!email || !users.some(u => uid(u) === email)) {
        await addFail(ip);
        return json({ error: "Couldn't find your account." }, 404);
    }
    return json({ ok: true });
}
async function apiLogin(request, env) {
    const ip = clientIp(request);
    if (isLocked(ip)) return json({ error: "Too many attempts. Try again in a minute." }, 429);
    const body = await readBody(request);
    const email = String(body.email || "").trim().toLowerCase();
    const pass = String(body.password || "");
    let user = null;
    for (const u of await getUsers(env)) {
        const a = safeEq(uid(u), email);
        const b = safeEq(u.password, pass);
        if (a && b) user = uid(u);
    }
    if (!user) {
        await addFail(ip);
        return json({ error: "Wrong password. Try again." }, 401);
    }
    fails.delete(ip);
    const exp = Date.now() + 30 * 86400 * 1000;
    const u64 = b64u(enc.encode(user));
    const tok = u64 + "." + exp + "." + (await sign(env, u64 + "." + exp));
    const prev = await accounts(request, env);
    const list = prev.map(p => (p.name === user ? { name: user, token: tok } : p));
    if (!prev.some(p => p.name === user)) list.push({ name: user, token: tok });
    const names = list.map(p => p.name);
    return json({ user, u: names.indexOf(user), users: names }, 200, { "Set-Cookie": cookieHeader(list.map(p => p.token)) });
}

async function getToken(env) {
    const now = Date.now();
    if (tokenCache.value && tokenCache.expires > now + 30000) return tokenCache.value;
    const saved = await env.gdrive.get("drive_access", "json");
    if (saved && saved.access_token && saved.expires > now + 30000) {
        tokenCache = { value: saved.access_token, expires: saved.expires };
        return tokenCache.value;
    }
    let creds = await env.gdrive.get("gdrive_json", "json");
    if (!creds || !creds.client_id) creds = await env.gdrive.get("drive_token", "json");
    if (!creds || !creds.client_id) throw new Error("creds");
    const body = new URLSearchParams({ client_id: creds.client_id, client_secret: creds.client_secret, refresh_token: creds.refresh_token, grant_type: "refresh_token" });
    let res;
    for (let i = 0; i < 3; i++) {
        res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
        if (res.ok) break;
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
    if (!res.ok) throw new Error("token");
    const j = await res.json();
    const expires = Date.now() + 3300 * 1000;
    tokenCache = { value: j.access_token, expires };
    try { await env.gdrive.put("drive_access", JSON.stringify({ access_token: j.access_token, expires }), { expirationTtl: 3600 }); } catch (e) { console.error(String(e)); }
    return tokenCache.value;
}
async function getdirs(env) {
    if (dirsCache.value && dirsCache.expires > Date.now()) return dirsCache.value;
    const dirs = await env.gdrive.get("dirs", "json");
    if (!Array.isArray(dirs)) throw new Error("dirs");
    dirsCache = { value: dirs, expires: Date.now() + 60000 };
    return dirs;
}
const esc = s => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
const extOf = name => (name.includes(".") ? name.split(".").pop().toLowerCase() : "");

async function authFetch(token, url) {
    for (let i = 0; i < 4; i++) {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) return res.json();
        let retry = res.status === 429 || res.status >= 500;
        if (res.status === 403) retry = /rateLimit|quotaExceeded/i.test(await res.text());
        if (!retry) return null;
        await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
    return null;
}
async function findChild(token, parent, name, folder) {
    const q = `'${parent}' in parents and name = '${esc(name)}' and trashed = false and ` +
        (folder ? `mimeType = '${FOLDER}'` : `mimeType != '${FOLDER}' and mimeType != 'application/vnd.google-apps.shortcut'`);
    const params = new URLSearchParams({ q, fields: "files(id,name,size,mimeType)", includeItemsFromAllDrives: "true", supportsAllDrives: "true", pageSize: "1" });
    const j = await authFetch(token, `${API}?${params}`);
    return j && j.files && j.files[0] ? j.files[0] : null;
}
async function resolveFile(token, dirs, order, segments) {
    let parent = dirs[order].id, key = parent;
    for (const seg of segments.slice(0, -1)) {
        key += "/" + seg;
        let id = folderCache.get(key);
        if (!id) {
            const dir = await findChild(token, parent, seg, true);
            if (!dir) return null;
            id = dir.id;
            if (folderCache.size > 1000) folderCache.clear();
            folderCache.set(key, id);
        }
        parent = id;
    }
    return findChild(token, parent, segments[segments.length - 1], false);
}
async function lookupFile(token, dirs, order, segments) {
    const key = dirs[order].id + "/" + segments.join("/");
    const hit = fileCache.get(key);
    if (hit && hit.expires > Date.now()) return hit.file;
    const file = await resolveFile(token, dirs, order, segments);
    if (file) {
        if (fileCache.size > 500) fileCache.clear();
        fileCache.set(key, { file, expires: Date.now() + 600000 });
    }
    return file;
}
async function driveList(token, q, pageToken, extra = {}) {
    const params = new URLSearchParams({ q, fields: "nextPageToken,files(id,name,size,mimeType,modifiedTime,parents)", pageSize: "100", orderBy: "folder,name", includeItemsFromAllDrives: "true", supportsAllDrives: "true", ...extra });
    if (pageToken) params.set("pageToken", pageToken);
    return (await authFetch(token, `${API}?${params}`)) || { files: [] };
}
function shapeOne(f) {
    const folder = f.mimeType === FOLDER;
    if (!folder && !ALLOWED[extOf(f.name)]) return null;
    return { id: f.id, name: f.name, folder, size: Number(f.size) || 0, mime: f.mimeType, modified: f.modifiedTime };
}
async function getRootId(token) {
    if (rootId) return rootId;
    const j = await authFetch(token, `${API}/root?fields=id`);
    rootId = j && j.id;
    return rootId;
}
async function getMeta(token, id) {
    const hit = metaCache.get(id);
    if (hit) return hit;
    const j = await authFetch(token, `${API}/${id}?fields=id,name,parents,mimeType,size,modifiedTime&supportsAllDrives=true`);
    if (j) { if (metaCache.size > 2000) metaCache.clear(); metaCache.set(id, j); }
    return j;
}
function rememberMeta(f) {
    if (metaCache.size > 2000) metaCache.clear();
    metaCache.set(f.id, { id: f.id, name: f.name, parents: f.parents, mimeType: f.mimeType });
}
async function scopeIds(token, dirs) {
    return Promise.all(dirs.map(async d => (d.id === "root" ? await getRootId(token) : d.id)));
}
const pickParent = (m, scopes) => (m.parents && m.parents.length ? (m.parents.find(p => scopes.includes(p)) || m.parents[0]) : null);
async function locate(token, dirs, id, hint) {
    const scopes = await scopeIds(token, dirs);
    if (id === "root") id = await getRootId(token);
    let cur = id, chain = [], near = null;
    for (let i = 0; i < 40 && cur; i++) {
        const idx = scopes.indexOf(cur);
        if (hint != null && scopes[hint] === cur) return { disk: hint, chain: chain.slice().reverse() };
        if (idx >= 0 && !near) near = { disk: idx, chain: chain.slice().reverse() };
        if (idx >= 0 && hint == null) return near;
        const m = await getMeta(token, cur);
        if (!m) break;
        chain.push(m);
        cur = pickParent(m, scopes);
    }
    return near;
}
async function locateFile(token, dirs, id) {
    const hit = okCache.get(id);
    if (hit && hit.expires > Date.now()) return hit.f;
    const loc = await locate(token, dirs, id, null);
    if (!loc || !loc.chain.length) return null;
    const f = loc.chain[loc.chain.length - 1];
    if (f.mimeType === FOLDER || f.mimeType.startsWith("application/vnd.google-apps.")) return null;
    if (okCache.size > 500) okCache.clear();
    okCache.set(id, { f, expires: Date.now() + 300000 });
    return f;
}
async function buildPath(token, scope, file) {
    const names = [file.name];
    let pid = file.parents && file.parents[0];
    for (let i = 0; i < 30; i++) {
        if (!pid) return null;
        if (pid === scope) return names.reverse();
        const m = await getMeta(token, pid);
        if (!m) return null;
        names.push(m.name);
        pid = m.parents && (m.parents.includes(scope) ? scope : m.parents[0]);
    }
    return null;
}
async function scopeFolders(token, root) {
    const hit = scopeCache.get(root);
    if (hit && hit.expires > Date.now()) return hit.ids;
    let level = [root];
    const all = [root];
    while (level.length && all.length < 80) {
        const res = await Promise.all(level.map(id => driveList(token, `'${id}' in parents and mimeType = '${FOLDER}' and trashed = false`, null, { pageSize: "200", fields: "files(id)" })));
        level = [];
        for (const r of res) for (const f of r.files || []) if (all.length < 80) { all.push(f.id); level.push(f.id); }
    }
    scopeCache.set(root, { ids: all, expires: Date.now() + 300000 });
    return all;
}

async function apiList(url, env) {
    const [dirs, token] = await Promise.all([getdirs(env), getToken(env)]);
    const id = url.searchParams.get("id") || "";
    if (!/^[\w-]{1,100}$/.test(id)) return json({ error: "id" }, 400);
    const h = url.searchParams.get("hint");
    const hint = h !== null && h !== "" && dirs[+h] ? +h : null;
    let loc = await locate(token, dirs, id, hint);
    if (!loc && hint != null) loc = await locate(token, dirs, id, null);
    if (!loc) return json({ error: "Not found" }, 404);
    if (loc.chain.length && loc.chain[loc.chain.length - 1].mimeType !== FOLDER) return json({ error: "Not a folder" }, 400);
    const d = await driveList(token, `'${id === "root" ? await getRootId(token) : id}' in parents and trashed = false and ${VISIBLE}`, url.searchParams.get("pageToken"));
    for (const f of d.files || []) if (f.mimeType === FOLDER) rememberMeta(f);
    return json({ disk: loc.disk, crumbs: loc.chain.map(m => ({ id: m.id, name: m.name })), files: (d.files || []).map(shapeOne).filter(Boolean), next: d.nextPageToken || null });
}
async function apiSearch(url, env) {
    const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
    if (q.length < 2) return json({ files: [] });
    const [dirs, token] = await Promise.all([getdirs(env), getToken(env)]);
    const d0 = dirs[Number(url.searchParams.get("disk"))];
    if (!d0) return json({ error: "disk" }, 404);
    let query = q.split(/\s+/).slice(0, 5).map(t => `name contains '${esc(t)}'`).join(" and ") + ` and trashed = false and ${VISIBLE}`;
    const extra = { pageSize: "50" };
    let scope = d0.id;
    if (d0.type === "shared_drive") { extra.corpora = "drive"; extra.driveId = d0.id; }
    else if (d0.type === "folder") {
        const ids = await scopeFolders(token, d0.id);
        query += " and (" + ids.map(i => `'${i}' in parents`).join(" or ") + ")";
        extra.corpora = "allDrives";
    } else { extra.corpora = "user"; extra.includeItemsFromAllDrives = "false"; scope = await getRootId(token); }
    const d = await driveList(token, query, null, extra);
    const rows = await Promise.all((d.files || []).map(async f => {
        const s = shapeOne(f);
        if (!s) return null;
        const names = await buildPath(token, scope, f);
        if (!names) return null;
        s.path = names.join("/");
        return s;
    }));
    return json({ files: rows.filter(Boolean) });
}

function sameOrigin(request, url) {
    const sfs = request.headers.get("Sec-Fetch-Site");
    if (sfs) return sfs === "same-origin";
    try { return new URL(request.headers.get("Referer") || "").host === url.host; } catch (e) { return false; }
}

async function streamFile(request, token, f, inline, extra = {}) {
    const ext = extOf(f.name);
    if (!ALLOWED[ext]) return page(ERROR_PAGE, 403);
    const headers = { Authorization: `Bearer ${token}` };
    const range = request.headers.get("Range");
    if (range) headers["Range"] = range;
    let res;
    for (let i = 0; i < 3; i++) {
        res = await fetch(`${API}/${f.id}?alt=media&supportsAllDrives=true`, { method: "GET", headers });
        if (res.ok || res.status === 416 || res.status === 404) break;
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
    if (res.status === 404) return page(ERROR_PAGE, 404);
    if (!res.ok && res.status !== 416) return page(ERROR_PAGE, 403);
    const out = new Headers();
    out.set("Server", "nginx");
    out.set("Content-Type", ALLOWED[ext]);
    out.set("Content-Disposition", `${inline ? "inline" : "attachment"}; filename="${f.name.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(f.name)}`);
    out.set("Accept-Ranges", "bytes");
    out.set("X-Content-Type-Options", "nosniff");
    out.set("Referrer-Policy", "no-referrer");
    if (ext === "svg") out.set("Content-Security-Policy", "sandbox; default-src 'none'; style-src 'unsafe-inline'");
    for (const k in extra) out.set(k, extra[k]);
    const len = res.headers.get("Content-Length");
    if (len) out.set("Content-Length", len);
    else if (f.size && !range) out.set("Content-Length", f.size);
    const cr = res.headers.get("Content-Range");
    if (cr) out.set("Content-Range", cr);
    if (request.method === "HEAD") return new Response(null, { status: res.status, headers: out });
    return new Response(res.body, { status: res.status, headers: out });
}

async function apiShare(request, env, me) {
    const body = await readBody(request);
    const [dirs, token] = await Promise.all([getdirs(env), getToken(env)]);
    if (!/^[\w-]{10,100}$/.test(body.id || "")) return json({ error: "id" }, 400);
    const f = await locateFile(token, dirs, body.id);
    if (!f || !ALLOWED[extOf(f.name)]) return json({ error: "Cannot share this file" }, 400);

    if (Array.isArray(body.to)) {
        const users = (await getUsers(env)).map(uid);
        const want = [...new Set(body.to.map(e => String(e || "").trim().toLowerCase()).filter(Boolean))];
        const bad = want.filter(e => !users.includes(e));
        if (bad.length) return json({ error: "No user found: " + bad.slice(0, 3).join(", ") }, 404);
        const targets = want.filter(e => e !== me);
        if (!targets.length) return json({ error: "Choose at least one other user." }, 400);
        const entry = { id: f.id, name: f.name, size: Number(f.size) || 0, mime: f.mimeType || "", modified: f.modifiedTime || null, from: me, at: Date.now() };
        for (const e of targets) {
            const cur = await kvJson(env, "shared:" + e);
            const list = (Array.isArray(cur) ? cur : []).filter(x => x && x.id !== f.id);
            list.unshift(entry);
            await env.gdrive.put("shared:" + e, JSON.stringify(list.slice(0, 300)));
        }
        return json({ ok: true, count: targets.length });
    }

    const days = [0, 1, 7, 30].includes(Number(body.days)) ? Number(body.days) : 7;
    const tok = b64u(crypto.getRandomValues(new Uint8Array(18)));
    const opts = days ? { expirationTtl: days * 86400 } : {};
    await env.gdrive.put("share:" + tok, JSON.stringify({ id: f.id, created: Date.now(), days }), opts);
    return json({ url: new URL(request.url).origin + "/share/" + tok });
}
async function apiShared(env, me) {
    const cur = await kvJson(env, "shared:" + me);
    const files = (Array.isArray(cur) ? cur : []).filter(Boolean).map(s => ({
        id: s.id, name: s.name, folder: false, size: Number(s.size) || 0, mime: s.mime || "", modified: s.modified || null,
        disk: 0, loc: "Shared by " + s.from, from: s.from, at: s.at,
    }));
    return json({ files });
}
async function apiUnshare(request, env, me) {
    const b = await readBody(request);
    const cur = await kvJson(env, "shared:" + me);
    const list = (Array.isArray(cur) ? cur : []).filter(x => x && x.id !== b.id);
    await env.gdrive.put("shared:" + me, JSON.stringify(list));
    return json({ ok: true });
}
async function apiUsers(env, me) {
    const users = await getUsers(env);
    return json({ users: users.map(uid).filter(e => e && e !== me) });
}
function cleanItems(arr, max) {
    if (!Array.isArray(arr)) return [];
    const out = [], seen = new Set();
    for (const f of arr) {
        if (!f || typeof f !== "object") continue;
        const id = String(f.id || "");
        if (!/^[\w-]{1,100}$/.test(id) || seen.has(id)) continue;
        seen.add(id);
        out.push({
            id, disk: Number(f.disk) || 0, name: String(f.name || "").slice(0, 255), folder: !!f.folder,
            size: Number(f.size) || 0, mime: String(f.mime || "").slice(0, 100),
            modified: f.modified ? String(f.modified).slice(0, 40) : null, loc: String(f.loc || "").slice(0, 500),
        });
        if (out.length >= max) break;
    }
    return out;
}
async function apiUserDataGet(env, me) {
    const ud = await kvJson(env, "ud:" + me);
    return json({ init: !!ud, stars: (ud && ud.stars) || [], recent: (ud && ud.recent) || [] });
}
async function apiUserDataPost(request, env, me) {
    const b = await readBody(request);
    await env.gdrive.put("ud:" + me, JSON.stringify({ stars: cleanItems(b.stars, 500), recent: cleanItems(b.recent, 30), t: Date.now() }));
    return json({ ok: true });
}
async function handleShare(request, env, tok, kind) {
    const hdr = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
    if (!kind) return page(brand(SHARE_PAGE, await getConfig(env)), 200, hdr);
    const s = await env.gdrive.get("share:" + tok, "json");
    if (!s) return json({ error: "This link has expired or been removed." }, 404, hdr);
    const token = await getToken(env);
    const f = await getMeta(token, s.id);
    if (!f) return json({ error: "File not found." }, 404, hdr);
    if (kind === "info") return json({ name: f.name, size: Number(f.size) || 0, modified: f.modifiedTime }, 200, hdr);
    return streamFile(request, token, f, kind === "raw", hdr);
}

async function apiManageGet(env, me) {
    const [dirs, users] = await Promise.all([getdirs(env), getUsers(env)]);
    const list = me.allowedit ? users : users.filter(u => uid(u) === me.name);
    return json({
        me: me.name,
        canEdit: me.allowedit,
        config: await getConfig(env),
        dirs: dirs.map(d => ({ id: d.id, name: d.name, type: d.type || "root", protect: !!d.protect_file_link })),
        users: list.map(u => ({ email: uid(u), allowedit: canEditU(u) })),
    });
}
async function apiManagePost(request, env, url, me) {
    const sub = url.pathname.slice("/api/manage/".length);
    const b = await readBody(request);

    if (sub === "password") {
        const pass = String(b.password || "");
        if (pass.length < 4) return json({ error: "Password must be at least 4 characters." }, 400);
        const list = await readUsersRaw(env);
        const i = list.findIndex(u => uid(u) === me.name);
        if (i < 0) return json({ error: "Account not found." }, 404);
        if (!safeEq(list[i].password, String(b.current || ""))) {
            await addFail(clientIp(request));
            return json({ error: "Current password is incorrect." }, 403);
        }
        list[i].password = pass;
        await saveUsers(env, list);
        return json({ ok: true });
    }

    if (!me.allowedit) return json({ error: "You don't have permission to do this." }, 403);

    if (sub === "config") {
        const c = cleanConfig(b);
        if (!c) return json({ error: "Enter a project name and a valid http(s) favicon URL." }, 400);
        await env.gdrive.put("config", JSON.stringify(c));
        cfgCache = { value: null, expires: 0 };
        return json({ ok: true });
    }

    if (sub === "users") {
        const list = await readUsersRaw(env);
        const email = String(b.email || "").trim().toLowerCase();
        const pass = String(b.password || "");
        const idx = list.findIndex(u => uid(u) === email);
        const al = !!b.allowedit;
        if (b.action === "add") {
            if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid email address." }, 400);
            if (idx >= 0) return json({ error: "This user already exists." }, 409);
            if (pass.length < 4) return json({ error: "Password must be at least 4 characters." }, 400);
            list.push({ email, password: pass, allowedit: al });
        } else if (b.action === "update") {
            if (idx < 0) return json({ error: "User not found." }, 404);
            if (pass && pass.length < 4) return json({ error: "Password must be at least 4 characters." }, 400);
            if (email === me.name && !al) return json({ error: "You can't remove your own edit access." }, 400);
            if (pass) list[idx].password = pass;
            list[idx].allowedit = al;
        } else if (b.action === "delete") {
            if (idx < 0) return json({ error: "User not found." }, 404);
            if (email === me.name) return json({ error: "You can't delete your own account." }, 400);
            list.splice(idx, 1);
        } else return json({ error: "Bad request" }, 400);
        if (!list.some(canEditU)) return json({ error: "At least one user must keep edit access." }, 400);
        await saveUsers(env, list);
        return json({ ok: true });
    }

    if (sub === "dirs") {
        const list = await env.gdrive.get("dirs", "json");
        if (!Array.isArray(list)) throw new Error("dirs");
        const d = b.dir || {};
        const name = String(d.name || "").trim().slice(0, 60);
        const type = ["root", "folder", "shared_drive", "my_drive"].includes(d.type) ? d.type : String(d.type || "folder").slice(0, 30);
        let id = String(d.id || "").trim();
        if (!id && (type === "root" || type === "my_drive")) id = "root";
        const i = Number(b.index);
        if (b.action === "add" || b.action === "update") {
            if (!name) return json({ error: "Enter a name." }, 400);
            if (!/^[\w-]{1,100}$/.test(id)) return json({ error: "Enter a valid Google Drive ID." }, 400);
            const rec = { id, name, type, protect_file_link: !!d.protect };
            if (b.action === "add") list.push(rec);
            else {
                if (!list[i]) return json({ error: "Location not found." }, 404);
                list[i] = { ...list[i], ...rec };
            }
        } else if (b.action === "delete") {
            if (!list[i]) return json({ error: "Location not found." }, 404);
            if (list.length <= 1) return json({ error: "At least one location is required." }, 400);
            list.splice(i, 1);
        } else return json({ error: "Bad request" }, 400);
        await env.gdrive.put("dirs", JSON.stringify(list));
        dirsCache = { value: null, expires: 0 };
        scopeCache.clear(); folderCache.clear(); fileCache.clear(); okCache.clear();
        return json({ ok: true });
    }

    return json({ error: "not found" }, 404);
}

async function kvJson(env, key) {
    try { return await env.gdrive.get(key, "json"); } catch (e) { return null; }
}
async function setupStatus(env) {
    if (!env.gdrive) return { bound: false, missing: { creds: true, dirs: true, users: true } };
    const [g, d, u, a] = await Promise.all([kvJson(env, "gdrive_json"), kvJson(env, "drive_token"), kvJson(env, "users"), kvJson(env, "dirs")]);
    const ok = c => !!(c && c.client_id);
    return { bound: true, missing: { creds: !(ok(g) || ok(d)), dirs: !(Array.isArray(a) && a.length), users: !(Array.isArray(u) && u.length) } };
}
async function needsSetup(env) {
    if (isDone()) return false;
    const st = await setupStatus(env);
    const open = !st.bound || st.missing.creds || st.missing.dirs || st.missing.users;
    if (open) { setupDoneAt = 0; resetCaches(); } else markDone();
    return open;
}
async function setupFinish(request, env, url, st, hdr) {
    if (!st.bound) return json({ error: "The gdrive KV namespace is not bound to this Worker." }, 400, hdr);
    if (!sameOrigin(request, url)) return json({ error: "Forbidden" }, 403, hdr);
    const b = await readBody(request);
    let token = null, creds = null, admin = null, dirs = null;

    if (st.missing.creds) {
        const c = b.creds || {};
        const client_id = String(c.client_id || "").trim();
        const client_secret = String(c.client_secret || "").trim();
        const refresh_token = String(c.refresh_token || "").trim();
        if (!client_id || !client_secret || !refresh_token) return json({ error: "Enter the client ID, client secret and refresh token." }, 400, hdr);
        let res;
        try {
            res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id, client_secret, refresh_token, grant_type: "refresh_token" }) });
        } catch (e) { return json({ error: "Could not reach Google to verify the credentials." }, 502, hdr); }
        if (!res.ok) return json({ error: "Google rejected these credentials. Check the client ID, secret and refresh token." }, 400, hdr);
        token = (await res.json()).access_token;
        creds = { client_id, client_secret, refresh_token };
    }
    if (st.missing.users) {
        const a = b.admin || {};
        const email = String(a.email || "").trim().toLowerCase();
        const password = String(a.password || "");
        if (!EMAIL_RE.test(email)) return json({ error: "Enter a valid admin email address." }, 400, hdr);
        if (password.length < 6) return json({ error: "Admin password must be at least 6 characters." }, 400, hdr);
        admin = { email, password, allowedit: true };
    }
    if (st.missing.dirs) {
        const list = Array.isArray(b.dirs) ? b.dirs.slice(0, 20) : [];
        if (!list.length) return json({ error: "Add at least one location." }, 400, hdr);
        dirs = [];
        for (const d of list) {
            const type = String(d.type || "");
            const name = String(d.name || "").trim().slice(0, 60);
            const id = type === "root" ? "root" : String(d.id || "").trim();
            if (!SETUP_TYPES.includes(type)) return json({ error: "Choose a type for every location." }, 400, hdr);
            if (!name) return json({ error: "Every location needs a name." }, 400, hdr);
            if (type !== "root" && !/^[\w-]{10,100}$/.test(id)) return json({ error: "Invalid Drive ID for “" + name + "”." }, 400, hdr);
            dirs.push({ id, name, type });
        }
        if (!token) {
            try { token = await getToken(env); } catch (e) { return json({ error: "Could not get a Google access token." }, 400, hdr); }
        }
        for (const d of dirs) {
            if (d.type === "root") continue;
            if (d.type === "shared_drive") {
                if (!(await authFetch(token, `https://www.googleapis.com/drive/v3/drives/${d.id}?fields=id`))) return json({ error: "“" + d.name + "”: shared drive not found or not accessible." }, 400, hdr);
            } else {
                const m = await authFetch(token, `${API}/${d.id}?fields=id,mimeType&supportsAllDrives=true`);
                if (!m) return json({ error: "“" + d.name + "”: folder not found or not accessible." }, 400, hdr);
                if (m.mimeType !== FOLDER) return json({ error: "“" + d.name + "”: this ID is not a folder." }, 400, hdr);
            }
        }
    }
    let config = null;
    if (b.config) {
        config = cleanConfig(b.config);
        if (!config) return json({ error: "Enter a project name and a valid http(s) favicon URL." }, 400, hdr);
    }

    if (creds) await env.gdrive.put("drive_token", JSON.stringify(creds));
    if (dirs) await env.gdrive.put("dirs", JSON.stringify(dirs));
    if (admin) await env.gdrive.put("users", JSON.stringify([admin]));
    if (config) { await env.gdrive.put("config", JSON.stringify(config)); cfgCache = { value: null, expires: 0 }; }
    tokenCache = { value: token, expires: token ? Date.now() + 3300 * 1000 : 0 };
    dirsCache = { value: null, expires: 0 };
    usersCache = { value: null, expires: 0 };
    markDone();
    return json({ ok: true }, 200, hdr);
}
async function handleSetup(request, env, url) {
    const hdr = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer" };
    const path = url.pathname.replace(/\/+$/, "");
    const isApi = path.startsWith("/setup/api/");
    const closed = () => (isApi ? json({ error: "Setup is complete." }, 404, hdr) : page(ERROR_PAGE, 404));
    if (isDone()) return closed();
    const st = await setupStatus(env);
    if (st.bound && !st.missing.creds && !st.missing.dirs && !st.missing.users) { markDone(); return closed(); }
    setupDoneAt = 0;
    resetCaches();
    if (request.method === "GET" && path === "/setup") return page(SETUP_PAGE, 200, hdr);
    if (request.method === "GET" && path === "/setup/api/status") return json(st, 200, hdr);
    if (request.method === "POST" && path === "/setup/api/finish") return setupFinish(request, env, url, st, hdr);
    return isApi ? json({ error: "not found" }, 404, hdr) : page(ERROR_PAGE, 404);
}

async function handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (path === "/favicon.svg" || path === "/favicon.ico") {
        const cfg = await getConfig(env);
        if (cfg.favicon) return Response.redirect(cfg.favicon, 302);
        return new Response(FAVICON, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
    }
    if (path === "/manifest.webmanifest") {
        return new Response(JSON.stringify(manifestFor(await getConfig(env))), { headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "no-cache", "Server": "nginx" } });
    }
    if (path === "/sw.js") {
        return new Response(SW_JS, { headers: { "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "no-cache", "Service-Worker-Allowed": "/", "Server": "nginx" } });
    }
    if (path === "/icon.svg" || path === "/icon-maskable.svg") {
        const cfg = await getConfig(env);
        if (cfg.favicon) return Response.redirect(cfg.favicon, 302);
        return new Response(appIcon(path === "/icon-maskable.svg"), { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" } });
    }
    if (path === "/setup" || path.startsWith("/setup/")) return handleSetup(request, env, url);
    if (method === "GET" && INDEX_PATHS.has(path)) {
        if (await needsSetup(env)) return Response.redirect(url.origin + "/setup", 302);
        return page(brand(APP, await getConfig(env)), 200, { "Cache-Control": "no-cache" });
    }
    if (!env.gdrive) throw new Error("binding");

    if (method === "POST") {
        if (path === "/api/check") return apiCheck(request, env);
        if (path === "/api/login") return apiLogin(request, env);
        if (path === "/api/logout") return apiLogout(request, env);
        if (path === "/api/share" || path === "/api/unshare" || path === "/api/userdata") {
            const me = await session(request, env, url);
            if (!me || !sameOrigin(request, url)) return json({ error: "auth" }, 401);
            if (path === "/api/share") return apiShare(request, env, me);
            if (path === "/api/unshare") return apiUnshare(request, env, me);
            return apiUserDataPost(request, env, me);
        }
        if (path.startsWith("/api/manage/")) {
            const me = await currentUser(request, env, url);
            if (!me || !sameOrigin(request, url)) return json({ error: "auth" }, 401);
            return apiManagePost(request, env, url, me);
        }
        return page(ERROR_PAGE, 403);
    }
    if (method !== "GET" && method !== "HEAD") return page(ERROR_PAGE, 403);
    if (INDEX_PATHS.has(path)) return page(brand(APP, await getConfig(env)), 200, { "Cache-Control": "no-cache" });

    const sm = path.match(/^\/share\/([\w-]{16,64})(?:\/(info|raw|dl))?$/);
    if (sm) return handleShare(request, env, sm[1], sm[2]);

    const m = path.match(/^\/disk-(\d+)\/(.+)$/);
    if (m) {
        let segments;
        try { segments = m[2].split("/").map(decodeURIComponent); } catch (e) { return page(ERROR_PAGE, 403); }
        if (segments.some(s => s === "" || s === "." || s === "..")) return page(ERROR_PAGE, 403);
        const filename = segments[segments.length - 1];
        if (!ALLOWED[extOf(filename)]) return page(ERROR_PAGE, 403);
        const order = Number(m[1]) - 1;
        const [dirs, token] = await Promise.all([getdirs(env), getToken(env)]);
        if (order < 0 || order >= dirs.length) return page(ERROR_PAGE, 403);
        if (dirs[order].protect_file_link && (!(await session(request, env, url, true)) || !sameOrigin(request, url))) return page(ERROR_PAGE, 403);
        const file = await lookupFile(token, dirs, order, segments);
        if (!file) return page(ERROR_PAGE, 404);
        return streamFile(request, token, file, url.searchParams.get("inline") === "1");
    }

    if (path === "/api/me") {
        const list = await accounts(request, env);
        return list.length ? json({ users: list.map(a => a.name) }) : json({ error: "auth" }, 401);
    }
    const user = await session(request, env, url);
    if (path.startsWith("/api/")) {
        if (!user) return json({ error: "auth" }, 401);
        if (path === "/api/dirs") return json((await getdirs(env)).map(d => ({ id: d.id, name: d.name, type: d.type })));
        if (path === "/api/list") return apiList(url, env);
        if (path === "/api/search") return apiSearch(url, env);
        if (path === "/api/usage") return apiUsage(env);
        if (path === "/api/userdata") return apiUserDataGet(env, user);
        if (path === "/api/shared") return apiShared(env, user);
        if (path === "/api/users") return apiUsers(env, user);
        if (path === "/api/manage") {
            const me = await currentUser(request, env, url);
            return me ? apiManageGet(env, me) : json({ error: "auth" }, 401);
        }
        return json({ error: "not found" }, 404);
    }

    const fm = path.match(/^\/file\/([\w-]{10,100})(?:\/.*)?$/);
    if (fm) {
        if (!user || !sameOrigin(request, url)) return page(ERROR_PAGE, 403);
        const [dirs, token] = await Promise.all([getdirs(env), getToken(env)]);
        const f = await locateFile(token, dirs, fm[1]);
        if (!f) return page(ERROR_PAGE, 404);
        return streamFile(request, token, f, url.searchParams.get("inline") === "1");
    }
    return page(ERROR_PAGE, 403);
}

export default {
    async fetch(request, env) {
        try {
            return await handle(request, env || {});
        } catch (e) {
            console.error(e && e.stack ? e.stack : String(e));
            let p = "";
            try { p = new URL(request.url).pathname; } catch (x) { p = ""; }
            if (p.startsWith("/api/")) {
                const known = ["users", "creds", "token", "dirs", "binding"];
                const msg = e && e.message;
                return json({ error: known.includes(msg) ? "Server error: " + msg : "Server error" }, 500);
            }
            return page(ERROR_PAGE, 403);
        }
    },
};

const SETUP_PAGE = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>Setup - Drive</title><link rel="icon" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@300..800&display=swap" rel="stylesheet">
<style>
:root{--bg:#f6f7fb;--fg:#1b1b1f;--sv:#ffffff;--sc:#eceef6;--pr:#3b5bdb;--on:#fff;--ov:#5d5f6b;--ol:#c9cbd8;--er:#b3261e;--ok:#188038}
@media(prefers-color-scheme:dark){:root{--bg:#111318;--fg:#e3e2e6;--sv:#1b1d24;--sc:#25272e;--pr:#a9b8ff;--on:#102077;--ov:#b0b2bf;--ol:#44474f;--er:#f2b8b5;--ok:#81c995}}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--fg);font-family:'Roboto Flex',system-ui,sans-serif}
.wrap{max-width:700px;margin:0 auto;padding:24px 16px 48px}
header{display:flex;align-items:center;gap:14px;margin-bottom:20px}
header img{width:40px}header h1{margin:0;font-size:24px;font-weight:500}header p{margin:2px 0 0;color:var(--ov);font-size:14px}
.steps{display:flex;list-style:none;margin:0 0 16px;padding:0;gap:6px}
.steps li{flex:1;text-align:center;font-size:12px;color:var(--ov)}
.steps li i{display:grid;place-items:center;width:30px;height:30px;margin:0 auto 6px;border-radius:50%;background:var(--sc);font-style:normal;font-weight:600;font-size:13px}
.steps li.on{color:var(--fg);font-weight:600}.steps li.on i{background:var(--pr);color:var(--on)}
.steps li.ok i{background:var(--ok);color:#fff}
.card{background:var(--sv);border-radius:28px;padding:28px}
h2{margin:0 0 6px;font-size:26px;font-weight:500}
.sub{margin:0 0 20px;color:var(--ov);font-size:15px;line-height:1.5}
code{background:var(--sc);padding:2px 6px;border-radius:6px;font-size:13px}
.tos{height:260px;overflow:auto;border:1px solid var(--ol);border-radius:18px;padding:16px 18px;font-size:14px;line-height:1.6}
.tos h3{margin:14px 0 4px;font-size:14px}.tos h3:first-child{margin-top:0}.tos p,.tos ol,.tos ul{margin:4px 0}
.hint{font-size:12px;color:var(--ov);margin:8px 2px 0}
.chk{display:flex;gap:12px;align-items:flex-start;margin:18px 0 0;font-size:14px;line-height:1.5;cursor:pointer}
.chk input{width:20px;height:20px;margin:1px 0 0;accent-color:var(--pr);flex-shrink:0}
.chk.dis{opacity:.5;cursor:default}
.nav{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:26px}
.btn{height:44px;padding:0 26px;border:0;border-radius:22px;background:var(--pr);color:var(--on);font:500 15px 'Roboto Flex',system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;transition:border-radius .4s cubic-bezier(.34,1.56,.64,1),transform .4s cubic-bezier(.34,1.56,.64,1)}
.btn:active{border-radius:12px;transform:scale(.96)}
.btn.sec{background:var(--sc);color:var(--fg)}
.btn:disabled{opacity:.4;cursor:default;transform:none}
.f{margin-bottom:14px}.f label{display:block;font-size:13px;color:var(--ov);margin:0 0 5px 4px}
input[type=text],input[type=email],input[type=password],select{width:100%;height:48px;border:1px solid var(--ol);border-radius:14px;background:transparent;color:var(--fg);padding:0 14px;font:15px 'Roboto Flex',system-ui,sans-serif;outline:none}
input:focus,select:focus{border-color:var(--pr);box-shadow:0 0 0 1px var(--pr)}
input:disabled{opacity:.55}select option{background:var(--sv);color:var(--fg)}
.sec-t{font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--ov);margin:22px 0 10px}.sec-t:first-of-type{margin-top:0}
.dir{display:grid;grid-template-columns:1fr 1.4fr 150px 40px;gap:8px;margin-bottom:8px}
.dir .x{width:40px;height:48px;border:0;border-radius:12px;background:var(--sc);color:var(--fg);cursor:pointer;font-size:16px}.dir .x:disabled{opacity:.35;cursor:default}
@media(max-width:620px){.dir{grid-template-columns:1fr 40px}.dir input,.dir select{grid-column:1}.dir .x{grid-column:2;grid-row:1}}
.stat{display:flex;align-items:center;gap:10px;padding:14px 16px;border-radius:16px;background:var(--sc);font-size:15px}
.stat.ok{color:var(--ok)}.stat.bad{color:var(--er)}
.list{margin-top:14px;border:1px solid var(--ol);border-radius:16px;overflow:hidden}
.list div{display:flex;justify-content:space-between;gap:10px;padding:12px 16px;font-size:14px}.list div+div{border-top:1px solid var(--ol)}
.list b{font-weight:500}.list .yes{color:var(--ok)}.list .no{color:var(--ov)}
.how{margin:14px 0;padding-left:20px;font-size:14px;line-height:1.7}
.err{margin-top:14px;padding:12px 16px;border-radius:14px;background:var(--sc);color:var(--er);font-size:14px}
.spin{width:18px;height:18px;border:3px solid var(--ol);border-top-color:var(--pr);border-radius:50%;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}
.sum{border:1px solid var(--ol);border-radius:16px;overflow:hidden}
.sum div{padding:12px 16px;font-size:14px;display:flex;justify-content:space-between;gap:14px}.sum div+div{border-top:1px solid var(--ol)}
.sum span{color:var(--ov);flex-shrink:0}.sum b{font-weight:500;text-align:right;word-break:break-all}
.done{text-align:center;padding:12px 0}
.done .big{width:84px;height:84px;margin:0 auto 18px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center;font-size:44px}
</style></head><body>
<div class="wrap">
<header><img src="/favicon.svg" alt=""><div><h1>Drive setup</h1><p>First-run guided setup</p></div></header>
<ol class="steps" id="steps"></ol>
<main class="card" id="card"></main>
</div>
<script>
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var E=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var NAMES=['Welcome','Storage','Name','Admin','Drive','Finish'];
var TYPES=[['root','Root (My Drive)'],['folder','Folder'],['shared_drive','Shared drive']];
var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
var S={step:1,read:false,ack:false,bound:null,closed:false,checking:false,missing:{creds:true,dirs:true,users:true},cfg:{name:'Drive',favicon:''},admin:{email:'',pw:'',pw2:''},creds:{client_id:'',client_secret:'',refresh_token:''},dirs:[{name:'',id:'',type:'folder'}],err:'',busy:false,done:false};

function stepsV(){
  $('#steps').innerHTML=NAMES.map(function(n,i){var k=i+1,c=S.done||k<S.step?'ok':k===S.step?'on':'';return '<li class="'+c+'"><i>'+(c==='ok'?'✓':k)+'</i>'+n+'</li>'}).join('');
}
function nav(back,label,act,dis){
  return '<div class="nav">'+(back?'<button class="btn sec" data-a="back">Back</button>':'<span></span>')+'<button class="btn" data-a="'+act+'"'+(dis?' disabled':'')+'>'+label+'</button></div>';
}
function errV(){return S.err?'<div class="err">'+E(S.err)+'</div>':''}
function field(id,label,type,val,f,extra){return '<div class="f"><label for="'+id+'">'+label+'</label><input id="'+id+'" type="'+type+'" data-f="'+f+'" value="'+E(val)+'" autocomplete="off" '+(extra||'')+'></div>'}

function v1(){
  return '<h2>Welcome</h2><p class="sub">Let’s get your Drive up and running. Please read the information below.</p>'+
  '<div class="tos" id="tos">'+
  '<h3>About this project</h3><p>Drive is a self-hosted web file browser for Google Drive that runs on a Cloudflare Worker. It lets signed-in users browse folders, preview images, video, audio, PDF and text, search, star files and create expiring share links.</p>'+
  '<h3>What this setup does</h3><p>The guided setup writes up to four keys to a Workers KV namespace and nothing else. It never changes anything inside your Google Drive.</p>'+
  '<ul><li><code>drive_token</code> – your Google OAuth client ID, client secret and refresh token</li><li><code>dirs</code> – the locations (root, folders or shared drives) you want to expose</li><li><code>users</code> – the accounts that may sign in; the first one is an administrator</li><li><code>config</code> – the project name and optional favicon URL</li></ul>'+
  '<h3>Before you start</h3><ol><li>A Google OAuth client ID, client secret and a refresh token that grants read access to Drive.</li><li>The IDs of the folders or shared drives you want to show (or use the root of the Drive).</li><li>A Workers KV namespace bound to this Worker, as described next.</li></ol>'+
  '<h3>Add and bind the KV namespace</h3><ol><li>Open the Cloudflare dashboard → <b>Workers &amp; Pages</b> → select this Worker.</li><li>Go to <b>Settings → Bindings → Add → KV namespace</b>.</li><li>Set the variable name to exactly <code>gdrive</code>.</li><li>Pick an existing namespace or create a new one, then save and deploy.</li></ol>'+
  '<h3>Security notes</h3><ul><li>Passwords are stored in KV exactly as entered. Restrict access to your KV namespace and Cloudflare account.</li><li>This setup page is only available while the keys <code>drive_token</code>, <code>dirs</code> and <code>users</code> are missing. Once they exist, <code>/setup</code> disappears.</li><li>Anyone who can reach this page on a fresh deployment can configure it, so finish setup right after deploying.</li></ul>'+
  '<h3>Acknowledgement</h3><p>By continuing you confirm that you have read this information and that you will bind a KV namespace named <code>gdrive</code> to this Worker.</p>'+
  '</div><p class="hint" id="hint">Scroll to the end to continue.</p>'+
  '<label class="chk '+(S.read?'':'dis')+'" id="ackl"><input type="checkbox" id="ack" '+(S.read?'':'disabled ')+(S.ack?'checked':'')+'>I have read the information above and will add and bind the <code>gdrive</code> KV namespace to this Worker.</label>'+
  '<div class="nav"><span></span><button class="btn" data-a="start" id="start" '+(S.ack?'':'disabled')+'>Guided Setup →</button></div>';
}
function row(name,key,ok){return '<div><b>'+name+' <code>'+key+'</code></b><span class="'+(ok?'yes':'no')+'">'+(ok?'✓ Found':'Will be set up')+'</span></div>'}
function v2(){
  var h='<h2>Check storage</h2><p class="sub">We look for a KV namespace bound to this Worker as <code>gdrive</code>.</p>';
  if(S.closed)return '<div class="stat ok">Setup is already complete.</div>'+'<div class="nav"><span></span><a class="btn" href="/">Open Drive</a></div>';
  if(S.checking||S.bound===null)h+='<div class="stat"><span class="spin"></span>Checking…</div>';
  else if(S.bound)h+='<div class="stat ok">✓ KV namespace <code>gdrive</code> is bound</div><div class="list">'+row('Google credentials','drive_token',!S.missing.creds)+row('Locations','dirs',!S.missing.dirs)+row('Users','users',!S.missing.users)+'</div>';
  else h+='<div class="stat bad">✕ No KV binding named <code>gdrive</code> was found</div><ol class="how"><li>Cloudflare dashboard → <b>Workers &amp; Pages</b> → this Worker.</li><li><b>Settings → Bindings → Add → KV namespace</b>.</li><li>Variable name: <code>gdrive</code>, choose a namespace, save and deploy.</li><li>Come back and press <b>Check again</b>.</li></ol><button class="btn sec" data-a="recheck">Check again</button>';
  return h+nav(true,'Next →','next',!S.bound||S.checking);
}
function vName(){
  return '<h2>Name your project</h2><p class="sub">Shown in the browser tab, sign-in page and sidebar. You can change it later in Manage.</p>'+
   field('n1','Project name','text',S.cfg.name,'cfg.name','maxlength="40"')+
   field('n2','Favicon URL (optional)','text',S.cfg.favicon,'cfg.favicon','placeholder="https://example.com/icon.png"')+
   '<p class="hint">Leave the favicon empty to use the built-in icon.</p>'+errV()+nav(true,'Next →','next');
}
function v3(){
  var h='<h2>First administrator</h2>';
  if(!S.missing.users)return h+'<p class="sub">Users already exist, so there is nothing to do here.</p>'+nav(true,'Next →','next');
  return h+'<p class="sub">Let’s add the first admin. This account gets full permission to manage users and locations; accounts you add later can be limited to viewing.</p>'+
   field('a1','Email','email',S.admin.email,'admin.email','autocapitalize="off" autocomplete="username"')+field('a2','Password (min. 6 characters)','password',S.admin.pw,'admin.pw','autocomplete="new-password"')+field('a3','Confirm password','password',S.admin.pw2,'admin.pw2','autocomplete="new-password"')+errV()+nav(true,'Next →','next');
}
function dirRow(d,i){
  var opts=TYPES.map(function(t){return '<option value="'+t[0]+'"'+(d.type===t[0]?' selected':'')+'>'+t[1]+'</option>'}).join('');
  return '<div class="dir"><input type="text" data-d="'+i+'" data-k="name" placeholder="Name" value="'+E(d.name)+'"><input type="text" data-d="'+i+'" data-k="id" placeholder="Folder or drive ID" value="'+E(d.type==='root'?'root':d.id)+'"'+(d.type==='root'?' disabled':'')+'><select data-d="'+i+'" data-k="type">'+opts+'</select><button class="x" data-a="rmdir" data-i="'+i+'" title="Remove"'+(S.dirs.length<2?' disabled':'')+'>✕</button></div>';
}
function v4(){
  var h='<h2>Connect Drive</h2>';
  if(!S.missing.creds&&!S.missing.dirs)return h+'<p class="sub">Credentials and locations already exist, so there is nothing to do here.</p>'+nav(true,'Next →','next');
  h+='<p class="sub">Tell us how to reach Google Drive and what to show.</p>';
  if(S.missing.creds)h+='<div class="sec-t">Google credentials</div>'+field('c1','Client ID','text',S.creds.client_id,'creds.client_id')+field('c2','Client secret','password',S.creds.client_secret,'creds.client_secret')+field('c3','Refresh token','password',S.creds.refresh_token,'creds.refresh_token');
  if(S.missing.dirs)h+='<div class="sec-t">Locations</div>'+S.dirs.map(dirRow).join('')+'<button class="btn sec" data-a="adddir" '+(S.dirs.length>=20?'disabled':'')+'>+ Add location</button>';
  return h+errV()+nav(true,'Next →','next');
}
function v5(){
  if(S.done)return '<div class="done"><div class="big">✓</div><h2>Setup complete</h2><p class="sub">Your Drive is ready. Sign in with the administrator account you just created. Changes can take up to a minute to reach every Cloudflare location.</p><a class="btn" href="/">Open Drive</a></div>';
  var r='<div><span>Project name</span><b>'+E(S.cfg.name.trim())+'</b></div>';
  if(S.missing.users)r+='<div><span>Administrator</span><b>'+E(S.admin.email.trim().toLowerCase())+'</b></div>';
  if(S.missing.creds)r+='<div><span>Google client ID</span><b>'+E(S.creds.client_id.trim().slice(0,12))+'…</b></div>';
  if(S.missing.dirs)S.dirs.forEach(function(d){r+='<div><span>'+E(d.name.trim())+'</span><b>'+E((TYPES.filter(function(t){return t[0]===d.type})[0]||[0,d.type])[1])+'</b></div>'});
  return '<h2>Finish setup</h2><p class="sub">Review and finish. We verify the Google credentials and each location before saving anything.</p>'+(r?'<div class="sum">'+r+'</div>':'')+errV()+
   '<div class="nav"><button class="btn sec" data-a="back"'+(S.busy?' disabled':'')+'>Back</button><button class="btn" data-a="finish"'+(S.busy?' disabled':'')+'>'+(S.busy?'Verifying…':'Finish setup')+'</button></div>';
}
function draw(){
  stepsV();
  $('#card').innerHTML=[null,v1,v2,vName,v3,v4,v5][S.step]();
  if(S.step===1){
    var t=$('#tos');
    var chk=function(){if(S.read)return;if(t.scrollTop+t.clientHeight>=t.scrollHeight-6){S.read=true;$('#ack').disabled=false;$('#ackl').classList.remove('dis');$('#hint').style.display='none'}};
    t.onscroll=chk;
    if(S.read)$('#hint').style.display='none';else chk();
  }
}
function check(){
  S.checking=true;draw();
  return fetch('/setup/api/status',{cache:'no-store'}).then(function(r){return r.json()}).then(function(j){
    S.checking=false;
    if(j.bound===undefined){S.closed=true;S.bound=false}else{S.bound=j.bound;S.missing=j.missing}
    draw();
  }).catch(function(){S.checking=false;S.bound=false;draw()});
}
function validate(){
  if(S.step===3){
    if(!S.cfg.name.trim())return 'Enter a project name.';
    var f=S.cfg.favicon.trim();
    if(f&&!/^https?:\/\/\S+$/i.test(f))return 'Favicon must be an http(s) URL.';
  }
  if(S.step===4&&S.missing.users){
    var a=S.admin;
    if(!EMAIL.test(a.email.trim()))return 'Enter a valid email address.';
    if(a.pw.length<6)return 'Password must be at least 6 characters.';
    if(a.pw!==a.pw2)return 'Passwords do not match.';
  }
  if(S.step===5){
    if(S.missing.creds){var c=S.creds;if(!c.client_id.trim()||!c.client_secret.trim()||!c.refresh_token.trim())return 'Fill in the client ID, client secret and refresh token.'}
    if(S.missing.dirs){
      if(!S.dirs.length)return 'Add at least one location.';
      for(var i=0;i<S.dirs.length;i++){
        var d=S.dirs[i];
        if(!d.name.trim())return 'Every location needs a name.';
        if(d.type!=='root'&&!/^[\w-]{10,100}$/.test(d.id.trim()))return 'Enter a valid Drive ID for “'+d.name.trim()+'”.';
      }
    }
  }
  return '';
}
function finish(){
  var b={};
  b.config={name:S.cfg.name.trim(),favicon:S.cfg.favicon.trim()};
  if(S.missing.users)b.admin={email:S.admin.email.trim().toLowerCase(),password:S.admin.pw};
  if(S.missing.creds)b.creds={client_id:S.creds.client_id.trim(),client_secret:S.creds.client_secret.trim(),refresh_token:S.creds.refresh_token.trim()};
  if(S.missing.dirs)b.dirs=S.dirs.map(function(d){return {name:d.name.trim(),id:d.type==='root'?'root':d.id.trim(),type:d.type}});
  S.busy=true;S.err='';draw();
  fetch('/setup/api/finish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||'Error '+r.status);return j})}).then(function(){
    S.busy=false;S.done=true;draw();
  }).catch(function(e){S.busy=false;S.err=e.message;draw()});
}
function setPath(p,v){var k=p.split('.');S[k[0]][k[1]]=v}
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-a]');if(!t||t.disabled)return;
  var a=t.dataset.a;
  if(a==='start'){S.step=2;S.err='';draw();check()}
  else if(a==='back'){S.step=Math.max(1,S.step-1);S.err='';draw();if(S.step===2)check()}
  else if(a==='recheck')check();
  else if(a==='next'){
    var er=validate();if(er){S.err=er;draw();return}
    S.err='';S.step++;draw();
  }
  else if(a==='adddir'){S.dirs.push({name:'',id:'',type:'folder'});draw()}
  else if(a==='rmdir'){S.dirs.splice(+t.dataset.i,1);draw()}
  else if(a==='finish')finish();
});
document.addEventListener('input',function(e){
  var t=e.target;
  if(t.dataset.f)setPath(t.dataset.f,t.value);
  else if(t.dataset.d!==undefined&&t.dataset.k!=='type')S.dirs[+t.dataset.d][t.dataset.k]=t.value;
});
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.id==='ack'){S.ack=t.checked;$('#start').disabled=!S.ack}
  else if(t.dataset.d!==undefined&&t.dataset.k==='type'){
    var d=S.dirs[+t.dataset.d];d.type=t.value;
    if(d.type==='root')d.id='root';else if(d.id==='root')d.id='';
    draw();
  }
});
draw();
})();
</script></body></html>`;

const SHARE_PAGE = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>__NAME__</title><link rel="icon" href="/favicon.svg">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@300..800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap" rel="stylesheet">
<style>
:root{--bg:#f6f7fb;--fg:#1b1b1f;--sv:#e8e9f1;--pr:#3b5bdb;--on:#fff;--ov:#5d5f6b}
@media(prefers-color-scheme:dark){:root{--bg:#111318;--fg:#e3e2e6;--sv:#25272e;--pr:#a9b8ff;--on:#102077;--ov:#b0b2bf}}
*{box-sizing:border-box}html,body{height:100%;height:100dvh;margin:0;font-family:'Roboto Flex',system-ui,sans-serif;background:var(--bg);color:var(--fg)}
.ms{font-family:'Material Symbols Rounded';font-size:24px;line-height:1;font-style:normal;font-variation-settings:'FILL' 1}
header{display:flex;align-items:center;gap:12px;padding:12px 16px;height:68px}
header img{width:32px}header h1{font-size:18px;font-weight:500;margin:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.btn{display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 24px;border-radius:22px;background:var(--pr);color:var(--on);text-decoration:none;font-weight:500;transition:border-radius .4s cubic-bezier(.34,1.56,.64,1),transform .4s cubic-bezier(.34,1.56,.64,1)}
.btn:active{border-radius:12px;transform:scale(.96)}
main{height:calc(100% - 68px);margin:0 12px 12px;border-radius:28px;background:var(--sv);display:flex;align-items:center;justify-content:center;overflow:hidden}
main img,main video{max-width:100%;max-height:100%}main iframe{width:100%;height:100%;border:0;background:#fff}
pre{margin:0;padding:20px;width:100%;height:100%;overflow:auto;font:13px/1.6 ui-monospace,monospace}
.card{text-align:center;padding:32px}.card .ms{font-size:72px;color:var(--pr)}.sub{color:var(--ov);font-size:14px;margin:6px 0 20px}
</style></head><body>
<header><img src="/favicon.svg" alt=""><h1 id="t">__NAME__</h1><a id="dl" class="btn" style="display:none"><span class="ms" style="font-size:20px">download</span>Download</a></header>
<main id="m"><div class="sub">Loading…</div></main>
<script>
(function(){
var tok=location.pathname.split('/')[2],base='/share/'+tok;
var K={image:'jpg jpeg png gif webp avif bmp svg ico',video:'mp4 m4v webm mov',audio:'mp3 m4a aac ogg opus wav flac',pdf:'pdf'};
var T='txt md csv tsv json log srt ass lrc xml yml yaml ini toml conf cfg properties nfo diff patch html htm css scss less js mjs ts jsx tsx py java kt c h cpp hpp cs go rs php rb sh bat ps1 sql lua swift gradle tex r dart vue svelte';
function kind(n){var e=' '+n.split('.').pop().toLowerCase()+' ';for(var k in K)if((' '+K[k]+' ').indexOf(e)>=0)return k;return (' '+T+' ').indexOf(e)>=0?'text':'other'}
function sz(n){var u=['B','KB','MB','GB'],i=0;while(n>=1024&&i<3){n/=1024;i++}return (i?n.toFixed(1):n)+' '+u[i]}
var m=document.getElementById('m');
fetch(base+'/info').then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error);return j})}).then(function(f){
  document.title=f.name+' - '+__NAME_JSON__;document.getElementById('t').textContent=f.name;
  var d=document.getElementById('dl');d.href=base+'/dl';d.style.display='inline-flex';
  var k=kind(f.name),u=base+'/raw';
  if(k==='image')m.innerHTML='<img src="'+u+'" alt="">';
  else if(k==='video')m.innerHTML='<video src="'+u+'" controls autoplay playsinline></video>';
  else if(k==='audio')m.innerHTML='<audio src="'+u+'" controls autoplay></audio>';
  else if(k==='pdf')m.innerHTML='<iframe src="'+u+'"></iframe>';
  else if(k==='text'){m.innerHTML='<pre></pre>';fetch(u,{headers:{Range:'bytes=0-1048575'}}).then(function(r){return r.text()}).then(function(t){m.firstChild.textContent=t})}
  else m.innerHTML='<div class="card"><span class="ms">draft</span><div style="font-size:20px;font-weight:500;word-break:break-all;margin-top:12px">'+f.name.replace(/[<>&]/g,'')+'</div><div class="sub">'+sz(f.size)+' · No preview available</div></div>';
}).catch(function(e){m.innerHTML='<div class="card"><span class="ms">link_off</span><div class="sub">'+(e.message||'Unavailable')+'</div></div>'});
})();
</script></body></html>`;

const APP = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>__NAME__</title>
<meta name="theme-color" content="#ffffff">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/icon.svg">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="__NAME__">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,300..900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=cloud&display=block" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
(function(){var c={};['primary','on-primary','primary-container','on-primary-container','secondary-container','on-secondary-container','tertiary-container','on-tertiary-container','surface','surface-low','surface-container','surface-high','surface-highest','on-surface','on-surface-variant','outline','outline-variant','error','error-container'].forEach(function(k){c[k]='var(--m-'+k+')'});
tailwind.config={theme:{extend:{colors:c,fontFamily:{sans:["'Roboto Flex'",'system-ui','sans-serif']}}}}})();
</script>
<style>
html,body{height:100%;height:100dvh;margin:0;font-family:'Roboto Flex',system-ui,sans-serif;-webkit-tap-highlight-color:transparent;overscroll-behavior:none}
body{background:var(--m-surface);color:var(--m-on-surface)}
.ms,.mso{font-family:'Material Symbols Rounded';font-weight:400;font-style:normal;font-size:24px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;direction:ltr;-webkit-font-smoothing:antialiased;font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;user-select:none}
.mso{font-family:'Material Symbols Outlined'}
.ms.fill,.mso.fill{font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24}
.ms.sm,.mso.sm{font-size:20px}.ms.lg,.mso.lg{font-size:40px}.ms.xl,.mso.xl{font-size:64px}
.ib{width:40px;height:40px;display:inline-grid;place-items:center;border-radius:9999px;cursor:pointer;flex-shrink:0;border:0;background:none;color:inherit;text-decoration:none}
.state{position:relative;overflow:hidden}
.state::after{content:"";position:absolute;inset:0;border-radius:inherit;background:currentColor;opacity:0;transition:opacity .2s;pointer-events:none}
.state:hover::after{opacity:.08}.state:active::after{opacity:.14}
.morph{transition:border-radius .45s cubic-bezier(.34,1.56,.64,1),transform .45s cubic-bezier(.34,1.56,.64,1),background-color .2s}
.morph:active{transform:scale(.97);border-radius:16px!important}
.nosb{scrollbar-width:none}.nosb::-webkit-scrollbar{display:none}
input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none;display:none}
input[type=range]{accent-color:var(--m-primary);height:28px;cursor:pointer;width:100%}
@keyframes mph{0%{border-radius:50%;transform:rotate(0)}25%{border-radius:30% 70% 70% 30%/30% 30% 70% 70%}50%{border-radius:22%;transform:rotate(180deg)}75%{border-radius:70% 30% 30% 70%/60% 40% 60% 40%}100%{border-radius:50%;transform:rotate(360deg)}}
.loader{width:44px;height:44px;background:var(--m-primary);animation:mph 2.4s ease-in-out infinite}
.art{width:min(60vw,260px);height:min(60vw,260px);background:var(--m-primary-container);color:var(--m-on-primary-container);display:grid;place-items:center;animation:mph 6s ease-in-out infinite;animation-play-state:paused}
.playing .art{animation-play-state:running}
#menu{position:fixed;z-index:56;min-width:220px}
@keyframes slidein{from{transform:translateX(-100%)}to{transform:none}}
@media(max-width:767px){
  #menu{left:0!important;right:0;top:auto!important;bottom:0;border-radius:28px 28px 0 0;padding-bottom:max(env(safe-area-inset-bottom),12px)}
  #info{display:none!important}
  .cbx{display:none!important}
  #side.open{display:flex!important;position:fixed;top:0;bottom:0;left:0;width:18rem;max-width:85vw;z-index:58;background:var(--m-surface-container);border-radius:0 28px 28px 0;box-shadow:0 8px 32px rgba(0,0,0,.3);animation:slidein .25s cubic-bezier(.2,.8,.2,1);padding-top:max(env(safe-area-inset-top),12px)}
  #profile{top:0!important;right:0!important;left:0!important;bottom:0!important;width:100%!important;max-width:none!important;max-height:none!important;height:100dvh;border-radius:0!important;z-index:70!important;box-shadow:none!important;padding:max(env(safe-area-inset-top),12px) 12px max(env(safe-area-inset-bottom),12px)!important}
  #dlg{padding-bottom:max(env(safe-area-inset-bottom),24px)}
}
@keyframes pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
#menu:not(.hidden),#dlg,#profile:not(.hidden){animation:pop .25s cubic-bezier(.34,1.56,.64,1)}
.cbx{width:24px;height:24px;border-radius:8px;border:2px solid var(--m-outline);background:var(--m-surface);color:var(--m-on-primary);display:grid;place-items:center;opacity:0;transition:opacity .15s,background .15s;z-index:2}
.item:hover .cbx,.cbx.on{opacity:1}
.sel-mode .cbx{opacity:1}
.cbx .ms{font-size:18px;opacity:0}.cbx.on{background:var(--m-primary);border-color:var(--m-primary)}.cbx.on .ms{opacity:1}
.is-sel{background:var(--m-secondary-container)!important;color:var(--m-on-secondary-container)}
.item{user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.tf{position:relative;margin-bottom:20px}
.tf input,.tf select{width:100%;height:56px;border:1px solid var(--m-outline);border-radius:14px;background:transparent;padding:0 16px;outline:none;color:inherit;font-size:16px;font-family:inherit}
.tf select option{background:var(--m-surface-container);color:var(--m-on-surface)}
.tf input:focus,.tf select:focus{border:2px solid var(--m-primary);padding:0 15px}
.tf label{position:absolute;left:12px;top:16px;padding:0 4px;background:var(--m-surface-container);color:var(--m-on-surface-variant);transition:all .15s;pointer-events:none}
.tf input:focus+label,.tf input:not(:placeholder-shown)+label,.tf select+label{top:-9px;font-size:12px}
.tf input:focus+label{color:var(--m-primary)}
.mg .tf label{background:var(--m-surface-high)}
.vnav{position:absolute;top:50%;transform:translateY(-50%);z-index:20;width:48px;height:64px;border:0;border-radius:16px;background:rgba(0,0,0,.5);color:#fff;display:grid;place-items:center;cursor:pointer}
.vnav:hover{background:rgba(0,0,0,.7)}.vnav:active{background:rgba(0,0,0,.85)}
.gfiles,.gdirs{display:grid;gap:8px;grid-template-columns:repeat(2,minmax(0,1fr))}
.gdirs>*,.gfiles>*{min-width:0}
@media(min-width:768px){.gfiles,.gdirs{gap:12px}.gfiles{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}.gdirs{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}}
.hs{touch-action:pan-x;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scroll-snap-type:x proximity}
.hs>*{flex-shrink:0}
</style>
</head>
<body>
<div id="app" class="h-[100dvh] flex overflow-hidden hidden">
  <aside id="side" class="hidden md:flex flex-col w-64 shrink-0 p-3 overflow-y-auto"></aside>
  <div class="flex-1 min-w-0 flex flex-col">
    <header class="flex items-center gap-2 px-2 md:px-4 h-16 md:h-[68px] shrink-0">
      <button id="hamb" data-a="navopen" type="button" aria-label="Menu" class="ib state md:hidden"><span class="ms">menu</span></button>
      <label class="flex items-center gap-2 md:gap-3 h-12 md:h-14 px-4 md:px-5 rounded-full bg-surface-high focus-within:bg-surface-highest flex-1 min-w-0 md:flex-none md:w-full max-w-3xl transition-colors">
        <span class="ms text-on-surface-variant shrink-0">search</span>
        <input id="q" type="search" autocomplete="off" placeholder="Search in __NAME__" class="flex-1 min-w-0 bg-transparent outline-none text-base placeholder:text-on-surface-variant">
        <button id="qc" data-a="clearq" class="ib !w-8 !h-8 hidden text-on-surface-variant" type="button"><span class="ms sm">close</span></button>
      </label>
      <span class="hidden md:block flex-1"></span>
      <button id="avatar" data-a="profile" class="w-10 h-10 shrink-0 rounded-full bg-primary text-on-primary grid place-items-center font-medium text-lg morph state" title="Account"></button>
    </header>
    <div class="flex-1 min-h-0 flex gap-3 md:pr-3 md:pb-3">
      <main id="main" class="flex-1 min-w-0 overflow-y-auto bg-surface-low md:rounded-[28px]"></main>
      <aside id="info" class="hidden w-80 shrink-0 overflow-y-auto bg-surface-low rounded-[28px]"></aside>
    </div>
    <nav id="bottom" class="md:hidden flex shrink-0 bg-surface-container" style="padding-bottom:env(safe-area-inset-bottom)"></nav>
  </div>
</div>

<div id="login" class="hidden fixed inset-0 z-[80] bg-surface items-center justify-center p-4 overflow-y-auto">
  <div class="bg-surface-container rounded-[28px] p-8 md:p-12 w-full max-w-4xl md:flex md:gap-16">
    <div class="md:w-5/12 mb-8 md:mb-0">
      <img src="/favicon.svg" alt="" class="w-12 mb-6">
      <h1 id="lh" class="text-4xl font-normal mb-3">Sign in</h1>
      <p id="lsub" class="text-base">to continue to __NAME__</p>
    </div>
    <div class="md:flex-1 md:pt-2">
      <div id="ls1">
        <div class="tf"><input id="lu" type="email" placeholder=" " autocomplete="username" autocapitalize="off" inputmode="email"><label for="lu">Email</label></div>
        <div id="lerr1" class="text-error text-sm min-h-[1.5rem] flex items-center gap-1"></div>
        <div class="flex justify-end gap-2 mt-6"><button id="lcancel" type="button" data-a="lcancel" class="hidden h-10 px-6 rounded-full text-primary font-medium state morph">Cancel</button><button id="lnext" type="button" data-a="lnext" class="h-10 px-8 rounded-full bg-primary text-on-primary font-medium state morph">Next</button></div>
      </div>
      <div id="ls2" class="hidden">
        <button type="button" data-a="lback" class="state morph inline-flex items-center gap-2 h-10 pl-2 pr-3 rounded-full border border-outline-variant text-sm font-medium mb-6 max-w-full"><span class="ms sm">account_circle</span><span id="lchip" class="truncate"></span><span class="ms sm">expand_more</span></button>
        <input id="lu2" type="email" hidden tabindex="-1" autocomplete="username">
        <div class="tf"><input id="lp" type="password" placeholder=" " autocomplete="current-password"><label for="lp">Password</label></div>
        <label class="flex items-center gap-2 text-sm mb-2 cursor-pointer"><input id="lshow" type="checkbox" class="w-4 h-4" style="accent-color:var(--m-primary)">Show password</label>
        <div id="lerr2" class="text-error text-sm min-h-[1.5rem] flex items-center gap-1"></div>
        <div class="flex justify-end mt-6"><button id="lgo" type="button" data-a="dologin" class="h-10 px-8 rounded-full bg-primary text-on-primary font-medium state morph">Sign in</button></div>
      </div>
    </div>
  </div>
</div>

<div id="navscrim" class="hidden fixed inset-0 z-[57] bg-black/40 md:hidden" data-a="closenav"></div>
<div id="mscrim" class="hidden fixed inset-0 z-[55] bg-black/40 md:bg-transparent" data-a="closemenu"></div>
<div id="menu" class="hidden bg-surface-high text-on-surface rounded-2xl py-2 shadow-xl"></div>
<div id="profile" class="hidden fixed z-[56] top-[64px] right-3 w-[min(22rem,calc(100vw-1.5rem))] max-h-[calc(100dvh-80px)] overflow-y-auto rounded-[28px] bg-surface-high text-on-surface shadow-xl p-3"></div>
<div id="dlgw" class="hidden fixed inset-0 z-[60]">
  <div class="absolute inset-0 bg-black/45" data-a="closedlg"></div>
  <div id="dlg" class="absolute left-0 right-0 bottom-0 rounded-t-[28px] md:left-1/2 md:right-auto md:top-1/2 md:bottom-auto md:-translate-x-1/2 md:-translate-y-1/2 md:w-[30rem] md:rounded-[28px] bg-surface-high text-on-surface p-6 max-h-[85vh] overflow-y-auto"></div>
</div>
<div id="viewer" class="hidden fixed inset-0 z-50 flex-col bg-black text-white"></div>
<div id="toast" class="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 translate-y-4 opacity-0 transition-all duration-300 z-[90] pointer-events-none bg-on-surface text-surface px-5 py-3 rounded-2xl text-sm"></div>

<script>
(function(){
'use strict';
var NAME=__NAME_JSON__;
var $=function(s){return document.querySelector(s)};
var E=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var ic=function(n,c){return '<span class="'+(n==='cloud'?'mso':'ms')+' '+(c||'')+'">'+n+'</span>'};
var LS={get:function(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
var cfg=Object.assign({theme:'auto',hue:230,view:'grid',info:false},LS.get('cfg',{}));
var S={me:null,dirs:[],r:{t:'home'},items:[],vis:[],next:null,loading:false,err:null,tok:0,filter:'all',sort:{k:'name',d:1},stars:[],recent:[],shared:[],allUsers:[],u:0,accts:[],usage:null,adding:false,vw:null,pl:[],rate:1,fns:[],disk:0,hint:null,crumbs:[],sel:new Set(),anchor:null,shDays:7,shMode:'people',shTo:[],txt:'',lstep:1,lemail:'',mg:null,udT:{},udDirty:{},udAt:0};
var LP={t:null,fired:false,x:0,y:0};
var EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var sz=function(n){if(!n)return '—';var u=['B','KB','MB','GB','TB'],i=0;while(n>=1024&&i<4){n/=1024;i++}return (n>=10||i===0?Math.round(n):n.toFixed(1))+' '+u[i]};
var dt=function(s){return s?new Date(s).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'};
var ext=function(n){var i=n.lastIndexOf('.');return i<0?'':n.slice(i+1).toLowerCase()};
var K={image:'jpg jpeg png gif webp avif bmp svg ico heic',video:'mp4 m4v webm mkv mov avi',audio:'mp3 m4a aac ogg opus wav flac',pdf:'pdf',text:'txt md csv tsv json log srt ass lrc xml yml yaml ini toml conf cfg properties nfo diff patch html htm css scss less js mjs ts jsx tsx py java kt kts c h cpp hpp cs go rs php rb sh bat ps1 sql lua swift gradle tex r dart vue svelte vtt',doc:'doc docx odt rtf epub',sheet:'xls xlsx ods',slides:'ppt pptx odp',archive:'zip rar 7z tar gz iso',apk:'apk'};
var KM={folder:['folder','','Folder'],image:['image','#d93025','Image'],video:['video_file','#c5221f','Video'],audio:['audio_file','#e37400','Audio'],pdf:['picture_as_pdf','#d93025','PDF'],text:['description','#5f6368','Text'],doc:['article','#1a73e8','Document'],sheet:['table_chart','#188038','Spreadsheet'],slides:['slideshow','#f9ab00','Presentation'],archive:['folder_zip','#5f6368','Archive'],apk:['android','#34a853','Android package'],other:['draft','#5f6368','File']};
var FL={all:null,folder:['folder'],docs:['pdf','text','doc','sheet','slides'],image:['image'],video:['video'],audio:['audio'],archive:['archive','apk']};
var FLN={all:'All',folder:'Folders',docs:'Documents',image:'Images',video:'Videos',audio:'Audio',archive:'Archives'};
var PV=['image','video','audio','pdf','text'];
var DT={root:'Root (My Drive)',folder:'Folder',shared_drive:'Shared drive'};
var kindOf=function(it){if(it.folder)return 'folder';var e=' '+ext(it.name)+' ';for(var k in K)if((' '+K[k]+' ').indexOf(e)>=0)return k;var mm=it.mime||'';if(mm.indexOf('image/')===0)return 'image';if(mm.indexOf('video/')===0)return 'video';if(mm.indexOf('audio/')===0)return 'audio';return 'other'};
var kicon=function(it,c){var m=KM[kindOf(it)];return '<span class="ms fill '+(c||'')+'" style="color:'+(m[1]||'var(--m-primary)')+'">'+m[0]+'</span>'};
var H=function(x){return '#/u/'+S.u+'/'+x};
var fh=function(id){return H('folders/'+encodeURIComponent(id))};
var fu=function(it,inl){return '/file/'+encodeURIComponent(it.id)+'/'+encodeURIComponent(it.name)+'?u='+S.u+(inl?'&inline=1':'')};
var par=function(p){return p.split('/').slice(0,-1).join('/')};
var isStar=function(it){return S.stars.some(function(s){return s.id===it.id})};
var slim=function(it){return {id:it.id,disk:it.disk,name:it.name,folder:it.folder,size:it.size,mime:it.mime,modified:it.modified,loc:it.loc||''}};
var dname=function(d){return S.dirs[d]?S.dirs[d].name:NAME};
var desk=function(){return matchMedia('(hover:hover) and (pointer:fine)').matches};
var kk=function(it){return it.id||('n:'+it.name)};
var uniq=function(a){var m={};return a.filter(function(x){var k=kk(x);if(m[k])return false;m[k]=1;return true})};
var selItems=function(){return S.vis.filter(function(x){return S.sel.has(kk(x))})};

function pushUD(){
  var me=S.me,u=S.u,st=S.stars,rc=S.recent;
  if(!me)return;
  S.udDirty[me]=true;clearTimeout(S.udT[me]);
  S.udT[me]=setTimeout(function(){
    api('/api/userdata',{method:'POST',headers:{'Content-Type':'application/json','X-U':String(u)},body:JSON.stringify({stars:st,recent:rc})}).then(function(){delete S.udDirty[me]}).catch(function(){setTimeout(function(){if(S.me===me&&S.udDirty[me])pushUD()},8000)});
  },800);
}
function pullUD(){
  var me=S.me;if(!me||S.udDirty[me])return;
  api('/api/userdata').then(function(d){
    if(S.me!==me||S.udDirty[me])return;
    S.udAt=Date.now();
    if(!d.init&&(S.stars.length||S.recent.length)){pushUD();return}
    var ch=JSON.stringify(d.stars)!==JSON.stringify(S.stars)||JSON.stringify(d.recent)!==JSON.stringify(S.recent);
    if(!ch)return;
    S.stars=d.stars;S.recent=d.recent;
    LS.set('stars:'+me,S.stars);LS.set('recent:'+me,S.recent);
    if(!S.vw&&(S.r.t==='home'||S.r.t==='starred'||S.r.t==='recent'))draw();
  }).catch(function(){});
}
var saveStars=function(){LS.set('stars:'+S.me,S.stars);pushUD()};
var saveRecent=function(){LS.set('recent:'+S.me,S.recent);pushUD()};
function setAccount(u){
  S.u=u;S.me=S.accts[u];
  S.stars=uniq(LS.get('stars:'+S.me,u===0?LS.get('stars',[]):[]));
  S.recent=uniq(LS.get('recent:'+S.me,u===0?LS.get('recent',[]):[]));
  S.shared=[];S.allUsers=[];
  var a=$('#avatar');if(a)a.textContent=S.me.charAt(0).toUpperCase();
  setTimeout(pullUD,0);
}

function isDark(){return cfg.theme==='dark'||(cfg.theme==='auto'&&matchMedia('(prefers-color-scheme: dark)').matches)}
function applyTheme(){
  var d=isDark(),h=cfg.hue,t2=(h+60)%360;
  var L=function(s,l){return 'hsl('+h+' '+s+'% '+l+'%)'};
  var Tt=function(s,l){return 'hsl('+t2+' '+s+'% '+l+'%)'};
  var t=d?{'primary':L(80,78),'on-primary':L(70,18),'primary-container':L(50,28),'on-primary-container':L(90,90),'secondary-container':L(22,28),'on-secondary-container':L(30,90),'tertiary-container':Tt(30,28),'on-tertiary-container':Tt(60,90),'surface':L(15,8),'surface-low':L(15,10),'surface-container':L(14,13),'surface-high':L(13,17),'surface-highest':L(12,21),'on-surface':L(15,90),'on-surface-variant':L(12,76),'outline':L(8,60),'outline-variant':L(10,30),'error':'#f2b8b5','error-container':'#8c1d18'}
   :{'primary':L(55,40),'on-primary':'#ffffff','primary-container':L(90,89),'on-primary-container':L(80,14),'secondary-container':L(40,87),'on-secondary-container':L(30,15),'tertiary-container':Tt(60,87),'on-tertiary-container':Tt(60,14),'surface':L(30,98),'surface-low':L(30,95),'surface-container':L(28,93),'surface-high':L(26,91),'surface-highest':L(24,88),'on-surface':L(15,10),'on-surface-variant':L(12,30),'outline':L(8,46),'outline-variant':L(12,80),'error':'#b3261e','error-container':'#f9dedc'};
  for(var k in t)document.documentElement.style.setProperty('--m-'+k,t[k]);
  document.documentElement.style.colorScheme=d?'dark':'light';
  var m=document.querySelector('meta[name=theme-color]');if(m)m.content=t['surface'];
}
function saveCfg(){LS.set('cfg',cfg)}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);

var tt;
function toast(m){var t=$('#toast');t.textContent=m;t.classList.remove('opacity-0','translate-y-4');clearTimeout(tt);tt=setTimeout(function(){t.classList.add('opacity-0','translate-y-4')},2600)}
function copy(t){(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast('Copied')},function(){toast('Copy failed')})}
function dl(it){var a=document.createElement('a');a.href=fu(it);a.download=it.name;document.body.appendChild(a);a.click();a.remove()}
function api(u,opt){
  opt=opt||{};opt.headers=Object.assign({'X-U':String(S.u)},opt.headers||{});
  return fetch(u,opt).then(function(r){
    return r.text().then(function(t){
      var j=null;try{j=JSON.parse(t)}catch(e){}
      if(r.status===401&&u.indexOf('/api/login')<0&&u.indexOf('/api/check')<0){showLogin();throw new Error('Signed out')}
      if(!j)throw new Error('Server error ('+r.status+')');
      if(!r.ok)throw new Error(j.error||'Error '+r.status);
      return j;
    });
  });
}
function post(u,body){return api(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
function popup(x,y,entries){
  S.fns=entries.map(function(e){return e[2]});
  var mn=$('#menu');
  mn.innerHTML=entries.map(function(e,i){return '<button data-a="mi" data-n="'+i+'" class="state w-full flex items-center gap-4 px-5 h-12 text-left text-sm font-medium">'+ic(e[0],e[3]?'fill text-primary':'')+'<span class="flex-1">'+E(e[1])+'</span></button>'}).join('');
  mn.classList.remove('hidden');$('#mscrim').classList.remove('hidden');
  mn.style.left=Math.max(8,Math.min(x,innerWidth-mn.offsetWidth-8))+'px';
  mn.style.top=Math.max(8,Math.min(y,innerHeight-mn.offsetHeight-8))+'px';
}
function closeMenu(){$('#menu').classList.add('hidden');$('#profile').classList.add('hidden');$('#mscrim').classList.add('hidden')}
function openNav(){$('#side').classList.add('open');$('#navscrim').classList.remove('hidden')}
function closeNav(){$('#side').classList.remove('open');$('#navscrim').classList.add('hidden')}
function dialog(h,wide){var d=$('#dlg');d.innerHTML=h;d.style.width=wide&&innerWidth>=768?'44rem':'';d.classList.toggle('mg',!!wide);$('#dlgw').classList.remove('hidden')}
function closeDlg(){$('#dlgw').classList.add('hidden');S.mg=null}

function lerr(m){var e=$(S.lstep===1?'#lerr1':'#lerr2');e.innerHTML=m?ic('error','sm')+E(m):''}
function loginStep(n){
  S.lstep=n;
  $('#ls1').classList.toggle('hidden',n!==1);
  $('#ls2').classList.toggle('hidden',n!==2);
  $('#lh').textContent=n===1?'Sign in':'Welcome';
  $('#lsub').textContent=n===1?'to continue to '+NAME:'Enter your password to continue';
  $('#lerr1').innerHTML='';$('#lerr2').innerHTML='';
  $('#lp').value='';$('#lp').type='password';$('#lshow').checked=false;
  setTimeout(function(){$(n===1?'#lu':'#lp').focus()},50);
}
function addAccount(){
  closeMenu();S.adding=true;$('#lu').value='';$('#lcancel').classList.remove('hidden');
  $('#login').classList.remove('hidden');$('#login').classList.add('flex');loginStep(1);
}
function cancelAdd(){S.adding=false;$('#login').classList.add('hidden');$('#login').classList.remove('flex')}
function showLogin(){
  S.me=null;S.accts=[];S.adding=false;S.tok++;closeMenu();closeNav();closeDlg();if(S.vw)closeViewer(true);
  $('#lcancel').classList.add('hidden');
  $('#app').classList.add('hidden');$('#login').classList.remove('hidden');$('#login').classList.add('flex');
  loginStep(1);
}
function doNext(){
  var u=$('#lu').value.trim().toLowerCase(),b=$('#lnext');
  if(!EMAIL.test(u)){lerr('Enter a valid email address.');return}
  b.disabled=true;lerr('');
  post('/api/check',{email:u}).then(function(){
    b.disabled=false;S.lemail=u;$('#lchip').textContent=u;$('#lu2').value=u;loginStep(2);
  }).catch(function(e){b.disabled=false;lerr(e.message)});
}
function doLogin(){
  var p=$('#lp').value,b=$('#lgo');
  if(!p){lerr('Enter your password.');return}
  b.disabled=true;lerr('');
  post('/api/login',{email:S.lemail,password:p}).then(function(d){
    b.disabled=false;S.adding=false;S.accts=d.users;setAccount(d.u);history.replaceState(null,'','#/u/'+d.u+'/home');boot();
  }).catch(function(e){b.disabled=false;lerr(e.message)});
}
function seg(a,opts,cur){
  var n=opts.length;
  return '<div class="flex gap-0.5 w-full">'+opts.map(function(o,i){
    var on=cur===o[0],rad=on?'rounded-full':i===0?'rounded-l-full rounded-r-lg':i===n-1?'rounded-r-full rounded-l-lg':'rounded-lg';
    return '<button data-a="'+a+'" data-x="'+o[0]+'" class="state morph flex-1 min-w-0 h-12 flex items-center justify-center gap-2 text-sm font-medium '+rad+' '+(on?'bg-primary text-on-primary':'bg-secondary-container text-on-secondary-container')+'">'+ic(o[2],'sm'+(on?' fill':''))+'<span class="truncate">'+o[1]+'</span></button>';
  }).join('')+'</div>';
}
function storageV(full){
  var u=S.usage;if(!u)return '';
  var q=function(n){return n?sz(n):'0 B'},pct=u.limit?Math.min(100,u.usage/u.limit*100):0,bad=pct>=90,other=Math.max(0,u.usage-u.drive);
  return '<div class="h-2 rounded-full bg-surface-highest overflow-hidden"><div class="h-full rounded-full '+(bad?'bg-error':'bg-primary')+'" style="width:'+(u.limit?Math.max(pct,u.usage?2:0):100)+'%"></div></div><div class="text-sm mt-2">'+q(u.usage)+(u.limit?' of '+q(u.limit):'')+' used</div>'+(full?'<div class="text-xs text-on-surface-variant mt-1">Drive '+q(u.drive)+' · Trash '+q(u.trash)+' · Other '+q(other)+'</div>':'');
}
function profileV(){
  var hues=[230,175,330,25,285,140].map(function(h){return '<button data-a="hue" data-x="'+h+'" class="w-10 h-10 rounded-full morph grid place-items-center" style="background:hsl('+h+' 60% 50%)">'+(cfg.hue===h?'<span class="ms sm text-white">check</span>':'')+'</button>'}).join('');
  var acc='';
  S.accts.forEach(function(m,i){if(i===S.u)return;acc+='<button data-a="swacct" data-x="'+i+'" class="state morph w-full flex items-center gap-3 h-14 px-2 rounded-2xl text-left"><span class="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container grid place-items-center font-medium shrink-0">'+E(m.charAt(0).toUpperCase())+'</span><span class="truncate text-sm font-medium">'+E(m)+'</span></button>'});
  acc+='<button data-a="addacct" class="state morph w-full flex items-center gap-3 h-14 px-2 rounded-2xl text-left"><span class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container grid place-items-center shrink-0">'+ic('person_add','sm')+'</span><span class="text-sm font-medium">Add another account</span></button>';
  var cards=[['Accounts',acc]];
  if(S.usage)cards.push(['Storage',storageV(true)]);
  cards.push(['Theme',seg('theme',[['auto','System','brightness_auto'],['light','Day','light_mode'],['dark','Night','dark_mode']],cfg.theme)]);
  cards.push(['Accent color','<div class="flex gap-2 flex-wrap">'+hues+'</div>']);
  cards.push(['Layout',seg('setview',[['grid','Grid','grid_view'],['list','List','view_list']],cfg.view)]);
  var last=cards.length-1;
  var html=cards.map(function(c,i){var r=i===0?'rounded-t-[24px] rounded-b-md':i===last?'rounded-t-md rounded-b-[24px]':'rounded-md';return '<div class="bg-surface-container '+r+' p-4"><div class="text-xs font-medium text-on-surface-variant mb-3">'+c[0]+'</div>'+c[1]+'</div>'}).join('');
  return '<div class="md:hidden flex items-center gap-2 mb-2"><button data-a="closemenu" class="ib state" aria-label="Close">'+ic('arrow_back')+'</button><span class="text-lg font-medium">Account</span></div>'+
   '<div class="grid place-items-center mt-2 mb-3"><div class="w-20 h-20 rounded-full bg-primary text-on-primary grid place-items-center text-4xl font-medium">'+E(S.me.charAt(0).toUpperCase())+'</div></div><div class="text-center text-2xl">Hi, '+E(S.me.split('@')[0])+'!</div><div class="text-center text-sm text-on-surface-variant mb-4 break-all px-2">'+E(S.me)+'</div>'+
   '<button data-a="manage" class="state morph mb-3 w-full h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center gap-2 text-sm font-medium">'+ic('settings','sm')+'Manage '+E(NAME)+'</button>'+
   '<div class="flex flex-col gap-0.5">'+html+'</div>'+
   '<button data-a="signout" class="state morph mt-3 w-full h-12 rounded-full border border-outline-variant flex items-center justify-center gap-2 text-sm font-medium">'+ic('logout','sm')+'Sign out</button>';
}

function mgLoad(){
  dialog('<div class="py-10 grid place-items-center"><div class="loader"></div></div>',true);
  api('/api/manage').then(function(d){S.mg={d:d,tab:'users',form:null};mgDraw()}).catch(function(e){
    dialog('<div class="text-error">'+E(e.message)+'</div><div class="flex justify-end mt-6"><button data-a="closedlg" class="h-10 px-6 rounded-full bg-primary text-on-primary font-medium state morph">Close</button></div>');
  });
}
function mgField(id,label,val,type,extra){return '<div class="tf"><input id="'+id+'" type="'+(type||'text')+'" placeholder=" " value="'+E(val||'')+'" autocomplete="off" '+(extra||'')+'><label for="'+id+'">'+label+'</label></div>'}
function mgCheck(id,label,on,dis){return '<label class="flex items-center gap-3 text-sm mb-4 '+(dis?'opacity-60':'cursor-pointer')+'"><input id="'+id+'" type="checkbox" class="w-5 h-5" style="accent-color:var(--m-primary)" '+(on?'checked ':'')+(dis?'disabled':'')+'>'+label+'</label>'}
function mgFormV(){
  var m=S.mg,f=m.form,h='',title='';
  if(f.t==='user'){
    if(f.mode==='self'){
      title='Change password';
      h=mgField('mg-cur','Current password','','password')+mgField('mg-pw','New password','','password');
    }else{
      var self=f.mode==='edit'&&f.email===m.d.me;
      title=f.mode==='add'?'Add user':'Edit user';
      h=mgField('mg-email','Email',f.email,'email',f.mode==='edit'?'readonly':'')+mgField('mg-pw',f.mode==='add'?'Password':'New password (leave blank to keep)','','password')+mgCheck('mg-ed','Allow editing users and locations',f.allowedit,self);
    }
  }else{
    var d=f.dir,types=Object.keys(DT);
    if(types.indexOf(d.type)<0)types.push(d.type);
    title=f.mode==='add'?'Add location':'Edit location';
    h=mgField('mg-name','Name',d.name)+mgField('mg-id','Google Drive ID',d.id)+'<div class="tf"><select id="mg-type">'+types.map(function(t){return '<option value="'+E(t)+'"'+(t===d.type?' selected':'')+'>'+E(DT[t]||t)+'</option>'}).join('')+'</select><label>Type</label></div>'+mgCheck('mg-pr','Protect direct file links (signed-in users only)',d.protect);
  }
  return '<h3 class="text-lg font-medium mb-4">'+title+'</h3>'+h+'<div id="mgerr" class="text-error text-sm min-h-[1.5rem] mb-2"></div><div class="flex justify-end gap-2"><button data-a="mgcancel" class="h-10 px-6 rounded-full text-primary font-medium state morph">Cancel</button><button data-a="mgsave" class="h-10 px-8 rounded-full bg-primary text-on-primary font-medium state morph">Save</button></div>';
}
function mgListV(){
  var m=S.mg,d=m.d,h='';
  var ib=function(a,i,icon,t){return '<button data-a="'+a+'" data-i="'+i+'" title="'+t+'" class="ib state">'+ic(icon,'sm')+'</button>'};
  if(m.tab==='cfg'){
    h+=mgField('mg-cname','Project name',d.config.name)+mgField('mg-cfav','Favicon URL (optional)',d.config.favicon)+
     '<button data-a="mgcfg" class="state morph h-11 px-6 rounded-full bg-primary text-on-primary text-sm font-medium">Save</button>';
  }else if(m.tab==='users'){
    h+=d.users.map(function(u,i){
      var self=u.email===d.me;
      return '<div class="flex items-center gap-3 p-3 rounded-2xl bg-surface-container mb-2"><span class="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container grid place-items-center font-medium shrink-0">'+E(u.email.charAt(0).toUpperCase())+'</span><div class="min-w-0 flex-1"><div class="truncate text-sm font-medium">'+E(u.email)+(self?' (you)':'')+'</div><div class="text-xs text-on-surface-variant">'+(u.allowedit?'Can edit':'View only')+'</div></div>'+
       (d.canEdit?ib('mguedit',i,'edit','Edit')+(self?'':ib('mgudel',i,'delete','Delete')):'<button data-a="mgpass" class="h-9 px-4 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium state morph">Change password</button>')+'</div>';
    }).join('');
    if(d.canEdit)h+='<button data-a="mguadd" class="state morph mt-2 h-11 px-5 rounded-full bg-primary text-on-primary text-sm font-medium inline-flex items-center gap-2">'+ic('person_add','sm')+'Add user</button>';
  }else{
    h+=d.dirs.map(function(x,i){
      return '<div class="flex items-center gap-3 p-3 rounded-2xl bg-surface-container mb-2"><span class="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container grid place-items-center shrink-0">'+ic(x.type==='folder'?'folder':'cloud','sm')+'</span><div class="min-w-0 flex-1"><div class="truncate text-sm font-medium">'+E(x.name)+'</div><div class="truncate text-xs text-on-surface-variant">'+E(DT[x.type]||x.type)+(d.canEdit?' · '+E(x.id):'')+'</div></div>'+
       (d.canEdit?ib('mgdedit',i,'edit','Edit')+ib('mgddel',i,'delete','Delete'):'')+'</div>';
    }).join('');
    if(d.canEdit)h+='<button data-a="mgdadd" class="state morph mt-2 h-11 px-5 rounded-full bg-primary text-on-primary text-sm font-medium inline-flex items-center gap-2">'+ic('add','sm')+'Add location</button>';
  }
  return h;
}
function mgDraw(){
  var m=S.mg,d=m.d;
  var h='<div class="flex items-center gap-3 mb-4">'+ic('settings','lg text-primary')+'<h2 class="text-2xl flex-1">Manage '+E(NAME)+'</h2><button data-a="closedlg" class="ib state">'+ic('close')+'</button></div>';
  if(m.form)h+=mgFormV();
  else h+=seg('mgtab',[['users',d.canEdit?'Users':'Account','group'],['dirs','Locations','folder']].concat(d.canEdit?[['cfg','General','tune']]:[]),m.tab)+'<div class="mt-4">'+mgListV()+'</div>';
  dialog(h,true);
}
function mgErr(msg){var e=$('#mgerr');if(e)e.textContent=msg}
function mgRun(url,body,after){
  return post(url,body).then(function(){return api('/api/manage')}).then(function(d){
    if(!S.mg)return;S.mg.d=d;S.mg.form=null;mgDraw();toast('Saved');
    if(after)after();
  }).catch(function(e){if(S.mg&&S.mg.form)mgErr(e.message);else toast(e.message)});
}
function refreshDirs(){
  api('/api/dirs').then(function(d){S.dirs=d;buildNav();if(S.r.t==='home'||S.r.t==='my')draw()}).catch(function(){});
}
function mgSave(){
  var m=S.mg,f=m.form,v=function(id){var e=$('#'+id);return e?e.value:''};
  if(f.t==='user'){
    if(f.mode==='self')mgRun('/api/manage/password',{current:v('mg-cur'),password:v('mg-pw')});
    else mgRun('/api/manage/users',{action:f.mode,email:v('mg-email'),password:v('mg-pw'),allowedit:$('#mg-ed').checked});
  }else{
    mgRun('/api/manage/dirs',{action:f.mode,index:f.i,dir:{name:v('mg-name'),id:v('mg-id'),type:v('mg-type'),protect:$('#mg-pr').checked}},refreshDirs);
  }
}

function menuFor(it){
  var e=[],sl=S.sel.has(kk(it));
  e.push([it.folder?'folder_open':'visibility','Open',function(){openItem(it)}]);
  if(!it.folder)e.push(['share','Share',function(){shareDialog(it)}]);
  e.push([sl?'check_circle':'radio_button_unchecked',sl?'Deselect':'Select',function(){toggleSel(it)},sl]);
  e.push(['star',isStar(it)?'Remove from Starred':'Add to Starred',function(){toggleStar(it)},isStar(it)]);
  if(S.r.t==='shared')e.push(['person_remove','Remove from Shared',function(){unshare(it)}]);
  e.push(['info','Details',function(){showInfo(it)}]);
  return e;
}
function unshare(it){
  post('/api/unshare',{id:it.id}).then(function(){S.shared=S.shared.filter(function(x){return x.id!==it.id});S.sel=new Set();draw();toast('Removed')}).catch(function(e){toast(e.message)});
}
function toggleStar(it){
  if(isStar(it))S.stars=S.stars.filter(function(s){return s.id!==it.id});else S.stars.unshift(slim(it));
  saveStars();toast(isStar(it)?'Added to Starred':'Removed from Starred');
  if(S.r.t==='starred'){draw()}else{updateSel()}if(S.vw)renderViewer();
}
function addRecent(it){if(it.folder)return;S.recent=S.recent.filter(function(s){return s.id!==it.id});S.recent.unshift(slim(it));S.recent=S.recent.slice(0,30);saveRecent()}
function rowKV(a,b){return '<div class="flex justify-between gap-4 py-2.5 border-b border-outline-variant text-sm"><span class="text-on-surface-variant shrink-0">'+a+'</span><span class="text-right break-words min-w-0">'+E(b)+'</span></div>'}
function infoRows(it){return rowKV('Type',KM[kindOf(it)][2])+(it.folder?'':rowKV('Size',sz(it.size)))+(it.modified?rowKV('Modified',dt(it.modified)):'')+rowKV('Location',it.loc||dname(it.disk))}
function details(it){
  dialog('<div class="flex items-center gap-4 mb-4">'+kicon(it,'xl')+'<div class="text-xl font-semibold break-words min-w-0">'+E(it.name)+'</div></div>'+infoRows(it)+
   '<div class="flex justify-end gap-2 mt-6">'+(it.folder?'':'<button data-a="dlg-dl" class="h-10 px-6 rounded-full bg-secondary-container text-on-secondary-container font-medium state morph">Download</button>')+'<button data-a="closedlg" class="h-10 px-6 rounded-full bg-primary text-on-primary font-medium state morph">Close</button></div>');
  S.dlgItem=it;
}
function showInfo(it){if(desk()&&!S.vw){cfg.info=true;saveCfg();S.sel=new Set([kk(it)]);updateSel()}else details(it)}

function shareDialog(it){
  S.shIt=it;S.shTo=[];
  if(!S.allUsers.length)api('/api/users').then(function(d){S.allUsers=d.users||[];if(!$('#dlgw').classList.contains('hidden')&&S.shIt===it)drawShare()}).catch(function(){});
  drawShare();
}
function drawShare(){
  var it=S.shIt,ppl=S.shMode==='people',keep='';
  var inp=$('#shemail');if(inp)keep=inp.value;
  var h='<h2 class="text-2xl mb-4 break-words">Share “'+E(it.name)+'”</h2>'+seg('shmode',[['people','People','group'],['link','Anyone','public']],S.shMode)+'<div class="mt-4">';
  if(ppl){
    var chips=S.shTo.map(function(e,i){return '<span class="inline-flex items-center gap-1 h-9 pl-3 pr-1 rounded-full bg-secondary-container text-on-secondary-container text-sm max-w-full"><span class="truncate">'+E(e)+'</span><button data-a="shrm" data-i="'+i+'" class="ib !w-7 !h-7 state">'+ic('close','sm')+'</button></span>'}).join('');
    var sugg=S.allUsers.filter(function(u){return S.shTo.indexOf(u)<0}).slice(0,6).map(function(u){return '<button data-a="shpick" data-x="'+E(u)+'" class="state morph h-9 px-3 rounded-xl border border-outline-variant text-sm text-on-surface-variant max-w-full truncate">'+E(u)+'</button>'}).join('');
    h+='<div class="flex gap-2 mb-3"><input id="shemail" type="email" list="shlist" autocomplete="off" autocapitalize="off" placeholder="Add email" class="flex-1 min-w-0 h-12 rounded-xl border border-outline px-3 bg-transparent text-sm outline-none"><datalist id="shlist">'+S.allUsers.map(function(u){return '<option value="'+E(u)+'">'}).join('')+'</datalist><button data-a="shadd" class="h-12 px-5 rounded-full bg-secondary-container text-on-secondary-container font-medium state morph">Add</button></div>'+
     (chips?'<div class="flex gap-2 flex-wrap mb-3">'+chips+'</div>':'')+(sugg?'<div class="text-xs text-on-surface-variant mb-2">Users</div><div class="flex gap-2 flex-wrap mb-3">'+sugg+'</div>':'')+
     '<div class="flex items-center gap-3 p-3 rounded-2xl bg-surface-container text-sm text-on-surface-variant">'+ic('lock','sm')+'They will see it in their Shared tab.</div><div id="shres" class="text-error text-sm mt-2 min-h-[1.25rem]"></div>'+
     '<div class="flex justify-end gap-2 mt-3"><button data-a="closedlg" class="h-10 px-6 rounded-full text-primary font-medium state morph">Cancel</button><button data-a="shsend" class="h-10 px-6 rounded-full bg-primary text-on-primary font-medium state morph flex items-center gap-2">'+ic('send','sm')+'Share</button></div>';
  }else{
    var dch=[[1,'1 day'],[7,'7 days'],[30,'30 days'],[0,'Never']].map(function(o){return '<button data-a="shdays" data-x="'+o[0]+'" class="state morph h-9 px-4 rounded-xl text-sm font-medium '+(S.shDays===o[0]?'bg-secondary-container text-on-secondary-container':'border border-outline-variant text-on-surface-variant')+'">'+o[1]+'</button>'}).join('');
    h+='<div class="flex items-center gap-4 p-4 rounded-2xl bg-surface-container mb-4">'+ic('public','lg text-primary')+'<div><div class="font-medium">Anyone with the link</div><div class="text-sm text-on-surface-variant">Can view and download this file</div></div></div><div class="text-sm font-medium mb-2">Link expires</div><div class="flex gap-2 flex-wrap mb-4">'+dch+'</div><div id="shres"></div>'+
     '<div class="flex justify-end gap-2 mt-5"><button data-a="closedlg" class="h-10 px-6 rounded-full text-primary font-medium state morph">Done</button><button data-a="mkshare" class="h-10 px-6 rounded-full bg-primary text-on-primary font-medium state morph flex items-center gap-2">'+ic('link','sm')+'Create link</button></div>';
  }
  dialog(h+'</div>');
  var ni=$('#shemail');if(ni&&keep)ni.value=keep;
}
function shAdd(){
  var inp=$('#shemail');if(!inp)return true;
  var v=inp.value.trim().toLowerCase();if(!v)return true;
  if(!EMAIL.test(v)){toast('Enter a valid email');return false}
  if(S.allUsers.length&&S.allUsers.indexOf(v)<0){toast('No user with that email');return false}
  if(S.shTo.indexOf(v)<0)S.shTo.push(v);
  inp.value='';drawShare();return true;
}
function shSend(){
  if(!shAdd())return;
  if(!S.shTo.length){toast('Add at least one person');return}
  post('/api/share',{id:S.shIt.id,to:S.shTo}).then(function(d){S.shTo=[];closeDlg();toast('Shared with '+d.count+(d.count===1?' person':' people'))}).catch(function(e){var r=$('#shres');if(r)r.textContent=e.message});
}
function mkShare(){
  var it=S.shIt;$('#shres').innerHTML='<div class="loader mx-auto !w-8 !h-8"></div>';
  post('/api/share',{id:it.id,days:S.shDays}).then(function(d){
    $('#shres').innerHTML='<div class="flex gap-2 items-center"><input id="shurl" readonly value="'+E(d.url)+'" class="flex-1 min-w-0 h-12 rounded-xl border border-outline px-3 bg-transparent text-sm outline-none"><button data-a="cpshare" class="h-12 px-5 rounded-full bg-secondary-container text-on-secondary-container font-medium state morph">Copy</button></div>';
    copy(d.url);
  }).catch(function(e){$('#shres').innerHTML='<div class="text-error text-sm">'+E(e.message)+'</div>'});
}

function buildNav(){
  var r=S.r;
  var item=function(href,icon,label,on){return '<a href="'+href+'" class="state morph flex items-center gap-3 h-12 px-5 rounded-full text-sm font-medium '+(on?'bg-secondary-container text-on-secondary-container':'text-on-surface-variant')+'">'+ic(icon,on?'fill':'')+'<span class="truncate">'+E(label)+'</span></a>'};
  var st=S.usage?'<div class="mt-auto p-4 rounded-[24px] bg-surface-container"><div class="flex items-center gap-2 text-sm font-medium mb-3">'+ic('cloud','sm')+'Storage</div>'+storageV(false)+'</div>':'';
  $('#side').innerHTML='<div class="flex items-center gap-3 px-4 h-14 mb-3"><img src="/favicon.svg" class="w-8" alt=""><span class="text-2xl truncate">'+E(NAME)+'</span></div>'+
   item(H('home'),'home','Home',r.t==='home')+item(H('my-drive'),'cloud','My Drive',r.t==='my'||r.t==='f'||r.t==='s')+item(H('shared'),'group','Shared',r.t==='shared')+item(H('starred'),'star','Starred',r.t==='starred')+item(H('recent'),'schedule','Recent',r.t==='recent')+st;
  var b=function(href,icon,label,on){return '<a href="'+href+'" class="flex-1 min-w-0 flex flex-col items-center gap-1 pt-3 pb-4 text-xs"><span class="h-8 w-16 grid place-items-center rounded-full morph '+(on?'bg-secondary-container text-on-secondary-container':'text-on-surface-variant')+'">'+ic(icon,on?'fill':'')+'</span><span class="'+(on?'font-bold':'font-medium text-on-surface-variant')+'">'+label+'</span></a>'};
  $('#bottom').innerHTML=b(H('home'),'home','Home',r.t==='home')+b(H('starred'),'star','Starred',r.t==='starred')+b(H('shared'),'group','Shared',r.t==='shared')+b(H('my-drive'),'folder','Files',r.t==='my'||r.t==='f'||r.t==='s'||r.t==='recent');
}

function crumbLoc(){return [dname(S.disk)].concat(S.crumbs.map(function(c){return c.name})).join(' / ')}
function loadFolder(more){
  var r=S.r,tok=more?S.tok:++S.tok;
  if(!more){S.items=[];S.next=null;S.sel=new Set()}
  S.loading=true;S.err=null;draw();
  api('/api/list?id='+encodeURIComponent(r.id)+(S.hint!=null?'&hint='+S.hint:'')+(more&&S.next?'&pageToken='+encodeURIComponent(S.next):'')).then(function(d){
    if(tok!==S.tok)return;
    S.disk=d.disk;S.hint=d.disk;S.crumbs=d.crumbs;var loc=crumbLoc();
    d.files.forEach(function(f){f.disk=d.disk;f.loc=loc});
    S.items=S.items.concat(d.files);S.next=d.next||null;S.loading=false;
    document.title=(d.crumbs.length?d.crumbs[d.crumbs.length-1].name:dname(d.disk))+' - '+NAME;
    buildNav();draw();
  }).catch(function(e){if(tok!==S.tok)return;S.err=e.message;S.loading=false;draw()});
}
function loadShared(){
  var tok=++S.tok;S.loading=true;S.err=null;draw();
  api('/api/shared').then(function(d){if(tok!==S.tok)return;S.shared=d.files||[];S.loading=false;draw()}).catch(function(e){if(tok!==S.tok)return;S.err=e.message;S.loading=false;draw()});
}
function doSearch(q){
  var tok=++S.tok;S.items=[];S.next=null;S.loading=true;S.err=null;S.sel=new Set();draw();
  Promise.all(S.dirs.map(function(d,i){return api('/api/search?disk='+i+'&q='+encodeURIComponent(q)).then(function(r){return r.files.map(function(f){f.disk=i;f.loc=dname(i)+(par(f.path)?' / '+par(f.path).split('/').join(' / '):'');return f})}).catch(function(){return []})})).then(function(rs){
    if(tok!==S.tok)return;S.items=[].concat.apply([],rs);S.loading=false;draw();
  });
}
function diskItems(){return S.dirs.map(function(d,i){return {id:d.id,name:d.name,folder:true,home:true,disk:i,size:0,modified:null,loc:''}})}
function homeItems(){return diskItems().concat(S.recent.slice(0,12))}

function vis(src){
  var a=src.slice(),f=FL[S.filter];
  if(f)a=a.filter(function(x){return f.indexOf(kindOf(x))>=0});
  var k=S.sort.k,d=S.sort.d;
  if(S.r.t==='f'||S.r.t==='s')a.sort(function(x,y){
    if(x.folder!==y.folder)return x.folder?-1:1;
    var r=k==='name'?x.name.localeCompare(y.name,undefined,{numeric:true}):k==='size'?x.size-y.size:String(x.modified).localeCompare(String(y.modified));
    return r*d});
  return a;
}
function subOf(it){
  if(S.r.t==='f')return it.folder?dt(it.modified):sz(it.size)+' · '+dt(it.modified);
  if(S.r.t==='shared')return (it.loc||'')+' · '+sz(it.size);
  return it.loc||'';
}
function cbx(i,on,pos){return '<span class="cbx '+(on?'on ':'')+pos+'" data-a="cb" data-i="'+i+'">'+ic('check')+'</span>'}
function fileCard(it,i,cls){
  var on=S.sel.has(kk(it)),k=kindOf(it),pv=k==='image'&&ext(it.name)!=='heic'&&(S.r.t==='f'||S.r.t==='s')?'<img loading="lazy" decoding="async" class="w-full h-full object-cover" data-fb="'+E(kicon(it,'xl'))+'" src="'+fu(it,true)+'" alt="">':kicon(it,'xl');
  return '<div class="item state morph bg-surface-container rounded-[24px] md:rounded-[28px] cursor-pointer min-w-0 '+(on?'is-sel ':'')+(cls||'')+'" data-a="item" data-i="'+i+'"><div class="relative h-28 md:h-32 bg-surface-high grid place-items-center overflow-hidden m-2 rounded-[18px] md:rounded-[22px]">'+pv+cbx(i,on,'absolute left-2 top-2')+'</div>'+
   '<div class="flex items-center gap-1 pl-3 md:pl-4 pr-1 pb-2 pt-1"><div class="min-w-0 flex-1"><div class="truncate text-sm font-medium">'+E(it.name)+'</div><div class="truncate text-xs opacity-70">'+E(subOf(it))+'</div></div><button data-a="menu" data-i="'+i+'" class="ib state">'+ic('more_vert')+'</button></div></div>';
}
function folderCard(it,i){
  var on=S.sel.has(kk(it));
  return '<div class="item state morph bg-surface-container rounded-full cursor-pointer flex items-center gap-2 md:gap-3 pl-3 md:pl-4 pr-1 md:pr-2 h-14 min-w-0 '+(on?'is-sel':'')+'" data-a="item" data-i="'+i+'">'+cbx(i,on,'absolute left-4 top-1/2 -translate-y-1/2')+ic('folder','fill text-on-surface-variant shrink-0')+'<span class="flex-1 min-w-0 truncate font-medium text-sm">'+E(it.name)+'</span><button data-a="menu" data-i="'+i+'" class="ib state">'+ic('more_vert')+'</button></div>';
}
function row(it,i){
  var on=S.sel.has(kk(it));
  return '<div class="item state morph grid grid-cols-[1fr_auto] md:grid-cols-[1fr_150px_100px_40px] items-center gap-4 pl-4 pr-2 py-2 rounded-2xl cursor-pointer hover:bg-surface-high '+(on?'is-sel':'')+'" data-a="item" data-i="'+i+'">'+
   '<div class="flex items-center gap-4 min-w-0">'+cbx(i,on,'absolute left-4 top-1/2 -translate-y-1/2')+kicon(it)+'<div class="min-w-0"><div class="truncate font-medium text-sm flex items-center gap-1">'+E(it.name)+(isStar(it)?ic('star','fill sm text-primary'):'')+'</div><div class="truncate text-xs opacity-70 '+(S.r.t==='f'?'md:hidden':'')+'">'+E(subOf(it))+'</div></div></div>'+
   '<span class="hidden md:block text-sm opacity-70">'+dt(it.modified)+'</span><span class="hidden md:block text-sm opacity-70">'+(it.folder?'—':sz(it.size))+'</span>'+
   '<button data-a="menu" data-i="'+i+'" class="ib state">'+ic('more_vert')+'</button></div>';
}
var GF='gfiles';
var GD='gdirs';
function bodyV(a){
  var sh=S.r.t==='shared',lst=sh?S.shared:S.items;
  if(S.err)return '<div class="text-center py-20">'+ic('error','xl text-error')+'<div class="mt-3 mb-5">'+E(S.err)+'</div><button data-a="retry" class="h-10 px-6 rounded-full bg-primary text-on-primary font-medium state morph">Retry</button></div>';
  if(S.loading&&!lst.length&&(S.r.t==='f'||S.r.t==='s'||sh)){
    var sk='';for(var i=0;i<10;i++)sk+='<div class="h-44 rounded-[28px] bg-surface-high animate-pulse"></div>';
    return '<div class="'+GF+'">'+sk+'</div>';
  }
  if(!a.length)return '<div class="text-center py-24 text-on-surface-variant">'+ic(S.r.t==='s'?'search_off':S.r.t==='starred'?'star':sh?'group':'folder_open','xl')+'<div class="mt-3 text-lg">'+(S.r.t==='s'?'No results found':S.r.t==='starred'?'Nothing starred yet':S.r.t==='recent'?'No recent files':sh?'Nothing shared with you yet':S.r.t==='my'?'No folders available':'This folder is empty')+'</div></div>';
  var h='';
  if(cfg.view==='list'){
    h+='<div class="hidden md:grid grid-cols-[1fr_150px_100px_40px] gap-4 px-4 py-2 text-xs font-semibold text-on-surface-variant"><span>Name</span><span>Modified</span><span>Size</span><span></span></div><div class="flex flex-col">'+a.map(row).join('')+'</div>';
  }else{
    var fo=[],fi=[];a.forEach(function(x,i){(x.folder?fo:fi).push(x.folder?folderCard(x,i):fileCard(x,i))});
    if(fo.length)h+='<h3 class="text-sm font-medium text-on-surface-variant mb-3 mt-1">Folders</h3><div class="'+GD+' mb-6">'+fo.join('')+'</div>';
    if(fi.length)h+='<h3 class="text-sm font-medium text-on-surface-variant mb-3">Files</h3><div class="'+GF+'">'+fi.join('')+'</div>';
  }
  if(S.next)h+='<div id="sent" class="grid place-items-center py-8">'+(S.loading?'<div class="loader"></div>':'')+'</div>';
  return h;
}
function toolsV(){
  if(S.sel.size){
    var s=selItems(),one=s.length===1,files=s.filter(function(x){return !x.folder}),ab=function(a,icon,t){return '<button data-a="sact" data-x="'+a+'" title="'+t+'" class="ib state">'+ic(icon)+'</button>'};
    return '<div class="flex items-center gap-1 h-14 px-2 rounded-full bg-secondary-container text-on-secondary-container mb-4">'+ab('clear','close','Clear selection')+'<span class="font-medium text-sm mr-2 flex-1 truncate">'+S.sel.size+' selected</span>'+
     (one?(s[0].folder?ab('open','folder_open','Open'):ab('open','visibility','Preview')+ab('dl','download','Download')+ab('share','share','Share')):(files.length?ab('dl','download','Download '+files.length+' files'):''))+ab('star','star','Star')+(one?ab('info','info','Details'):'')+'</div>';
  }
  var chips=Object.keys(FLN).map(function(k){var on=S.filter===k;return '<button data-a="filter" data-x="'+k+'" class="state morph h-9 px-4 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 '+(on?'bg-secondary-container text-on-secondary-container':'border border-outline-variant text-on-surface-variant')+'">'+(on?ic('check','sm align-middle mr-1'):'')+FLN[k]+'</button>'}).join('');
  var vb=function(v,icon,cls){var on=cfg.view===v;return '<button data-a="setview" data-x="'+v+'" class="state morph h-10 w-12 grid place-items-center '+cls+' '+(on?'bg-primary text-on-primary':'bg-secondary-container text-on-secondary-container')+'" title="'+v+'">'+ic(icon,on?'fill':'')+'</button>'};
  var sortL={name:'Name',modified:'Modified',size:'Size'}[S.sort.k];
  return '<div class="mb-3 md:mb-4 md:flex md:items-center md:gap-2 md:min-h-[56px]"><div class="hs flex gap-2 overflow-x-auto nosb min-w-0 md:flex-1 py-1 -mx-4 px-4 md:mx-0 md:px-0">'+chips+'</div>'+
   '<div class="flex items-center gap-2 mt-2 md:mt-0">'+
   (S.r.t==='f'||S.r.t==='s'?'<button data-a="sortmenu" class="state morph h-10 pl-4 pr-3 rounded-full bg-surface-high text-sm font-medium flex items-center gap-1 shrink-0">'+sortL+ic(S.sort.d>0?'arrow_upward':'arrow_downward','sm')+'</button>':'')+
   '<div class="flex gap-0.5 shrink-0 ml-auto">'+vb('list','view_list','rounded-l-full rounded-r-md')+vb('grid','grid_view','rounded-r-full rounded-l-md')+'</div>'+
   '<button data-a="infotoggle" title="View details" class="ib state shrink-0 hidden md:inline-grid '+(cfg.info?'bg-secondary-container text-on-secondary-container':'')+'">'+ic('info',cfg.info?'fill':'')+'</button></div></div>';
}
function crumbsV(){
  var h='<div class="flex items-center gap-0.5 overflow-x-auto nosb mb-2 text-lg md:text-xl whitespace-nowrap">',d=S.dirs[S.disk];
  if(!d)return '';
  h+='<a href="'+H('my-drive')+'" class="px-3 py-1.5 rounded-full hover:bg-surface-high text-on-surface-variant">My Drive</a>'+ic('chevron_right','text-on-surface-variant')+'<a href="'+fh(d.id)+'" class="px-3 py-1.5 rounded-full hover:bg-surface-high '+(S.crumbs.length?'text-on-surface-variant':'')+'">'+E(d.name)+'</a>';
  S.crumbs.forEach(function(c,i){h+=ic('chevron_right','text-on-surface-variant')+(i<S.crumbs.length-1?'<a href="'+fh(c.id)+'" class="px-3 py-1.5 rounded-full hover:bg-surface-high text-on-surface-variant">'+E(c.name)+'</a>':'<span class="px-3 py-1.5">'+E(c.name)+'</span>')});
  return h+'</div>';
}
function infoV(){
  var s=selItems(),head='<div class="flex items-center gap-2 px-5 pt-4 pb-2"><span class="flex-1 text-lg font-medium">Details</span><button data-a="infotoggle" class="ib state">'+ic('close')+'</button></div>';
  if(s.length>1)return head+'<div class="text-center py-16 text-on-surface-variant">'+ic('select_all','xl')+'<div class="mt-3">'+s.length+' items selected</div></div>';
  var it=s[0];
  if(!it&&S.r.t==='f'&&S.crumbs.length){var c=S.crumbs[S.crumbs.length-1];it={id:c.id,name:c.name,folder:true,disk:S.disk,loc:[dname(S.disk)].concat(S.crumbs.slice(0,-1).map(function(x){return x.name})).join(' / ')}}
  else if(!it&&S.r.t==='f'){it={id:'',name:dname(S.disk),folder:true,disk:S.disk,loc:''}}
  if(!it)return head+'<div class="text-center py-16 px-6 text-on-surface-variant">'+ic('info','xl')+'<div class="mt-3">Select an item to see its details</div></div>';
  var k=kindOf(it),pv=k==='image'&&ext(it.name)!=='heic'&&(S.r.t==='f'||S.r.t==='s')?'<img class="w-full h-full object-cover" data-fb="'+E(kicon(it,'xl'))+'" src="'+fu(it,true)+'" alt="">':kicon(it,'xl');
  var pb=function(a,icon,t){return '<button data-a="sact" data-x="'+a+'" class="state morph h-10 px-4 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium flex items-center gap-1.5">'+ic(icon,'sm')+t+'</button>'};
  return head+'<div class="px-5 pb-6"><div class="h-40 rounded-[24px] bg-surface-high grid place-items-center overflow-hidden mb-4">'+pv+'</div><div class="text-base font-medium break-words mb-3">'+E(it.name)+'</div>'+
   (it.folder||!it.id?'':'<div class="flex gap-2 flex-wrap mb-3">'+pb('dl','download','Download')+pb('share','share','Share')+(S.sel.size?pb('star','star',isStar(it)?'Unstar':'Star'):'')+'</div>')+
   '<div class="text-sm font-medium mt-4 mb-1">'+(it.folder?'Folder':'File')+' details</div>'+infoRows(it)+'</div>';
}
function drawTools(){var t=$('#tools');if(t)t.innerHTML=toolsV()}
function drawInfo(){var p=$('#info');if(cfg.info&&S.r.t!=='x'){p.classList.remove('hidden');p.innerHTML=infoV()}else p.classList.add('hidden')}
function updateSel(){
  document.querySelectorAll('#body [data-a=item]').forEach(function(el){
    var it=S.vis[+el.dataset.i];if(!it)return;var on=S.sel.has(kk(it));
    el.classList.toggle('is-sel',on);var c=el.querySelector('.cbx');if(c)c.classList.toggle('on',on);
  });
  var bd=$('#body');if(bd)bd.classList.toggle('sel-mode',S.sel.size>0);
  drawTools();drawInfo();
}
var io=new IntersectionObserver(function(e){if(e[0].isIntersecting&&S.next&&!S.loading&&S.r.t==='f')loadFolder(true)},{rootMargin:'400px'});
function draw(){
  var r=S.r,src=r.t==='home'?homeItems():r.t==='my'?diskItems():r.t==='starred'?S.stars:r.t==='recent'?S.recent:r.t==='shared'?S.shared:S.items,a=vis(src);S.vis=a;
  var sc=$('#tools')?$('#tools').scrollLeft:0;
  $('#main').innerHTML='<div class="px-4 md:px-6 pt-4 pb-28 md:pb-10 min-h-full">'+(r.t==='f'?crumbsV():'')+'<div id="tools">'+toolsV()+'</div><div id="body">'+bodyV(a)+'</div></div>';
  drawInfo();
  var bd=$('#body');if(bd)bd.classList.toggle('sel-mode',S.sel.size>0);
  io.disconnect();var s=$('#sent');if(s)io.observe(s);
  var act=document.querySelector('#tools [data-a=filter].bg-secondary-container');if(act&&act.scrollIntoView&&S.filter!=='all')act.scrollIntoView({inline:'center',block:'nearest'});
}
function parseHash(){
  var p=location.hash.replace(/^#\/?/,'').split('/'),u=null;
  if(p[0]==='u'&&/^\d+$/.test(p[1]||'')){u=+p[1];p=p.slice(2)}
  var t=p[0]||'home';
  t={'my-drive':'my','folders':'f','f':'f','search':'s','s':'s'}[t]||t;
  return {u:u,t:t,a:p[1],rest:p.join('/')};
}
function route(){
  var h=parseHash();
  if(h.u===null||!S.accts[h.u]){location.replace('#/u/'+(h.u!==null&&S.accts[h.u]?h.u:S.u)+'/'+h.rest);return}
  if(h.u!==S.u)setAccount(h.u);
  var t=h.t;
  closeMenu();closeNav();closeDlg();if(S.vw)closeViewer(true);
  S.tok++;S.sel=new Set();S.anchor=null;S.filter='all';
  if(t==='f'){
    var id=decodeURIComponent(h.a||'root'),di=S.dirs.findIndex(function(d){return d.id===id});if(di>=0)S.hint=di;
    S.r={t:'f',id:id};$('#q').value='';buildNav();loadFolder();
  }else if(t==='s'){var q=decodeURIComponent(h.a||'');S.r={t:'s',q:q};$('#q').value=q;document.title=q+' - '+NAME;buildNav();doSearch(q)}
  else{
    S.r={t:t==='starred'||t==='recent'||t==='my'||t==='shared'?t:'home'};S.items=[];S.loading=false;S.err=null;
    document.title=S.r.t==='my'?'My Drive - '+NAME:S.r.t==='shared'?'Shared - '+NAME:NAME;
    $('#q').value='';buildNav();draw();
    if(S.r.t==='shared')loadShared();
  }
  $('#qc').classList.toggle('hidden',!$('#q').value);
  $('#main').scrollTop=0;
}

function openItem(it){if(it.folder){S.hint=it.disk;location.hash=fh(it.id)}else openViewer(it)}
function toggleSel(it){if(S.sel.has(kk(it)))S.sel.delete(kk(it));else S.sel.add(kk(it));S.anchor=S.vis.indexOf(it);updateSel()}
function clickItem(e,i){
  var it=S.vis[i];
  if(e.ctrlKey||e.metaKey){toggleSel(it);return}
  if(e.shiftKey&&S.sel.size&&S.anchor!=null){var a=Math.min(S.anchor,i),b=Math.max(S.anchor,i);S.sel=new Set(S.vis.slice(a,b+1).map(kk));updateSel();return}
  if(S.sel.size){toggleSel(it);return}
  openItem(it);
}

function openViewer(it){
  S.pl=S.vis.filter(function(x){return !x.folder&&PV.indexOf(kindOf(x))>=0});
  S.vw={it:it};history.pushState({v:1},'');
  var v=$('#viewer');v.classList.remove('hidden');v.classList.add('flex');
  renderViewer();addRecent(it);
}
function closeViewer(fromPop){
  if(!S.vw)return;
  var m=$('#media');if(m){m.pause();m.removeAttribute('src');m.load()}
  if(document.fullscreenElement)document.exitFullscreen();
  var v=$('#viewer');v.classList.add('hidden');v.classList.remove('flex','playing');v.innerHTML='';S.vw=null;
  if(!fromPop)history.back();
}
window.addEventListener('popstate',function(){if(S.vw)closeViewer(true)});
function plIdx(){
  if(!S.vw)return -1;
  var id=S.vw.it.id;
  for(var i=0;i<S.pl.length;i++)if(S.pl[i].id===id)return i;
  return -1;
}
function step(d,auto){
  if(!S.vw||S.pl.length<2)return;
  var i=plIdx();if(i<0)return;
  var n=i+d;
  if(n<0||n>=S.pl.length){if(auto)return;n=(n+S.pl.length)%S.pl.length}
  var nx=S.pl[n];
  if(auto&&['video','audio'].indexOf(kindOf(nx))<0)return;
  var m=$('#media');if(m){m.pause();m.removeAttribute('src');m.load()}
  S.vw.it=nx;renderViewer();addRecent(nx);
}
function vbtn(a,icon,t){return '<button data-a="'+a+'" title="'+t+'" class="ib state text-white">'+ic(icon)+'</button>'}
function ctl(video){
  var b=function(a,icon,big){return '<button data-a="'+a+'" class="state morph grid place-items-center text-white '+(big?'w-24 h-16 rounded-full bg-primary-container text-on-primary-container':'w-12 h-12 rounded-full')+'">'+ic(icon,big?'lg fill':'')+'</button>'};
  return '<div class="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 shrink-0" style="padding-bottom:max(env(safe-area-inset-bottom),24px)"><input id="seek" type="range" min="0" max="1000" value="0"><div class="flex justify-between text-xs text-white/70 -mt-1"><span id="tc">0:00</span><span id="td">0:00</span></div>'+
   '<div class="flex items-center justify-center gap-1 sm:gap-3 mt-1">'+b('vprev','skip_previous')+b('vback','replay_10')+b('vplay','play_arrow',true)+b('vfwd','forward_10')+b('vnext','skip_next')+'</div>'+
   '<div class="flex items-center justify-center gap-3 mt-2"><button data-a="vspeed" class="state morph h-10 px-4 rounded-full bg-white/10 text-sm font-medium">'+S.rate+'x</button><button data-a="vmute" class="ib state text-white">'+ic('volume_up')+'</button><input id="vol" type="range" min="0" max="100" value="100" class="!w-28">'+(video?vbtn('vpip','picture_in_picture_alt','Picture in picture')+vbtn('vfs','fullscreen','Fullscreen'):'')+'</div></div>';
}
function renderViewer(){
  var it=S.vw.it,k=kindOf(it),u=fu(it,true),d=fu(it),st='',nav='',c='';
  if(k==='archive'&&ext(it.name)==='zip'&&it.size&&it.size<=26214400)k='zip';
  var multi=S.pl.length>1&&plIdx()>=0;
  if(k==='image')st='<img id="vimg" data-a="vzoom" src="'+u+'" alt="" class="max-w-full max-h-full object-contain cursor-zoom-in">';
  else if(k==='video'){st='<video id="media" data-a="vplay" src="'+u+'" playsinline autoplay class="max-w-full max-h-full"></video>';c=ctl(true)}
  else if(k==='audio'){st='<audio id="media" src="'+u+'" autoplay></audio><div class="flex flex-col items-center gap-6 px-6 text-center"><div class="art rounded-full">'+ic('music_note','xl fill')+'</div><div><div class="text-2xl font-bold break-words">'+E(it.name.replace(/\.[^.]+$/,''))+'</div><div class="text-white/60 text-sm mt-1">'+E(dname(it.disk))+'</div></div></div>';c=ctl(false)}
  else if(k==='pdf')st='<iframe src="'+u+'" class="w-full h-full bg-white border-0"></iframe>';
  else if(k==='text')st='<div id="txt" class="w-full h-full flex flex-col"><div class="m-auto text-white/60">Loading…</div></div>';
  else if(k==='zip')st='<div id="zip" class="w-full h-full flex flex-col bg-surface-low text-on-surface"><div class="m-auto"><div class="loader"></div></div></div>';
  else{
    var big=k==='archive'&&ext(it.name)==='zip';
    st='<div class="bg-surface-container text-on-surface rounded-[40px] p-8 text-center max-w-md mx-4 w-full">'+kicon(it,'xl')+'<div class="mt-4 text-lg font-semibold break-words">'+E(it.name)+'</div><div class="text-sm text-on-surface-variant mt-1">'+KM[k][2]+' · '+sz(it.size)+'</div><div class="mt-6 text-xl">Preview not available</div><p class="text-sm text-on-surface-variant mt-2 mb-6">'+(big?'Zip files over 25 MB can’t be previewed in the browser.':'This file type can’t be previewed in the browser.')+' Download it to open on your device, or share a link so others can get it.</p><div class="flex gap-2 justify-center flex-wrap"><a href="'+d+'" download class="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-primary text-on-primary font-medium state morph">'+ic('download','sm')+'Download</a><button type="button" data-a="vshare" class="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-secondary-container text-on-secondary-container font-medium state morph">'+ic('share','sm')+'Share</button></div></div>';
  }
  if(multi)nav='<button type="button" data-a="vprev" title="Previous" class="vnav" style="left:12px">'+ic('chevron_left','lg')+'</button><button type="button" data-a="vnext" title="Next" class="vnav" style="right:12px">'+ic('chevron_right','lg')+'</button>';
  var tb='<div class="flex items-center gap-0 sm:gap-1 px-1 sm:px-2 h-16 shrink-0 z-10">'+vbtn('vclose','arrow_back','Close')+'<span class="mx-1 sm:mx-2 min-w-0 flex-1 truncate font-medium">'+E(it.name)+'</span>'+
   (multi?'<span class="hidden sm:inline text-xs text-white/60 mr-2">'+(plIdx()+1)+' / '+S.pl.length+'</span>':'')+
   '<button data-a="vstar" class="ib state text-white">'+ic('star',isStar(it)?'fill text-yellow-300':'')+'</button>'+vbtn('vinfo','info','Details')+vbtn('vshare','share','Share')+
   '<a class="ib state text-white hidden sm:inline-grid" href="'+u+'" target="_blank" rel="noopener" title="Open in new tab">'+ic('open_in_new')+'</a><a class="ib state text-white" href="'+d+'" download title="Download">'+ic('download')+'</a></div>';
  var v=$('#viewer');v.classList.remove('playing');
  v.innerHTML=tb+'<div id="stage" class="flex-1 min-h-0 relative flex items-center justify-center overflow-hidden bg-black">'+st+nav+'</div>'+c;
  if(k==='video'||k==='audio')mountMedia();
  if(k==='image'){
    var im=$('#vimg');if(im)im.onerror=function(){toast('Could not display this image')};
    [1,-1].forEach(function(o){var nb=S.pl[plIdx()+o];if(nb&&kindOf(nb)==='image'&&ext(nb.name)!=='heic'){var pi=new Image();pi.src=fu(nb,true)}});
    var sg=$('#stage'),sx=null;
    sg.ontouchstart=function(e){sx=e.touches.length===1?e.touches[0].clientX:null};
    sg.ontouchend=function(e){
      if(sx==null)return;
      var dx=e.changedTouches[0].clientX-sx;sx=null;
      var z=$('#vimg');
      if(Math.abs(dx)>60&&!(z&&z.classList.contains('zoomed')))step(dx<0?1:-1);
    };
  }
  if(k==='zip')fetch(u).then(function(r){if(!r.ok)throw new Error('Could not load the file');return r.arrayBuffer()}).then(function(buf){if(!S.vw||S.vw.it!==it)return;S.zip={buf:buf,ents:zipParse(buf)};renderZip()}).catch(function(er){var z=$('#zip');if(z)z.innerHTML='<div class="m-auto text-center p-6">'+ic('error','xl text-error')+'<div class="mt-3">'+E(er.message)+'</div></div>'});
  if(k==='text')fetch(u,{headers:{Range:'bytes=0-1048575'}}).then(function(r){return r.text()}).then(function(t){if(S.vw&&S.vw.it===it){S.txt=t;renderText(it,false)}}).catch(function(){var e=$('#txt');if(e)e.textContent='Could not load file.'});
}
function zipParse(buf){
  var dv=new DataView(buf),n=buf.byteLength,e=-1,i,pad=function(x){return (x<10?'0':'')+x};
  for(i=n-22;i>=Math.max(0,n-65558);i--){if(dv.getUint32(i,true)===0x06054b50){e=i;break}}
  if(e<0)throw new Error('This is not a valid zip file');
  var cnt=dv.getUint16(e+10,true),p=dv.getUint32(e+16,true);
  if(cnt===0xFFFF||p===0xFFFFFFFF)throw new Error('Zip64 archives are not supported');
  var out=[],u8=new Uint8Array(buf),old=new TextDecoder('windows-1252');
  for(i=0;i<cnt&&out.length<5000;i++){
    if(p+46>n||dv.getUint32(p,true)!==0x02014b50)break;
    var fl=dv.getUint16(p+8,true),tm=dv.getUint16(p+12,true),dd=dv.getUint16(p+14,true),nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),nb=u8.subarray(p+46,p+46+nl),nm;
    try{nm=new TextDecoder('utf-8',{fatal:true}).decode(nb)}catch(x){nm=old.decode(nb)}
    out.push({name:nm,dir:nm.charAt(nm.length-1)==='/',enc:!!(fl&1),method:dv.getUint16(p+10,true),csize:dv.getUint32(p+20,true),usize:dv.getUint32(p+24,true),off:dv.getUint32(p+42,true),date:dd?((dd>>9)+1980)+'-'+pad((dd>>5)&15)+'-'+pad(dd&31)+' '+pad(tm>>11)+':'+pad((tm>>5)&63):''});
    p+=46+nl+el+cl;
  }
  return out;
}
function zipExtract(ent){
  var buf=S.zip.buf,dv=new DataView(buf),o=ent.off;
  if(dv.getUint32(o,true)!==0x04034b50)return Promise.reject(new Error('Corrupt entry'));
  var start=o+30+dv.getUint16(o+26,true)+dv.getUint16(o+28,true),bl=new Blob([buf.slice(start,start+ent.csize)]);
  if(ent.method===0)return Promise.resolve(bl);
  if(ent.method===8&&window.DecompressionStream)return new Response(bl.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob();
  return Promise.reject(new Error('Unsupported compression'));
}
function renderZip(){
  var z=S.zip,tot=0,files=0;
  z.ents.forEach(function(e){if(!e.dir){files++;tot+=e.usize}});
  var rows=z.ents.map(function(e,i){
    var base=e.name.replace(/\/$/,''),k=base.lastIndexOf('/'),dir=k<0?'':base.slice(0,k+1),nm=k<0?base:base.slice(k+1);
    var icn=e.dir?'<span class="ms fill" style="color:var(--m-on-surface-variant)">folder</span>':kicon({name:nm,folder:false});
    return '<div class="flex items-center gap-3 px-4 h-12 rounded-xl hover:bg-surface-high"><span class="shrink-0">'+icn+'</span><div class="min-w-0 flex-1 truncate text-sm"><span class="text-on-surface-variant">'+E(dir)+'</span><span class="font-medium">'+E(nm)+'</span></div><span class="hidden sm:block text-xs text-on-surface-variant w-20 text-right">'+(e.dir?'':sz(e.usize))+'</span><span class="hidden md:block text-xs text-on-surface-variant w-36 text-right">'+E(e.date)+'</span>'+(e.dir?'<span class="w-10 shrink-0"></span>':'<button data-a="zdl" data-i="'+i+'" class="ib state" title="'+(e.enc?'Encrypted':'Download')+'"'+(e.enc?' disabled style="opacity:.4"':'')+'>'+ic(e.enc?'lock':'download')+'</button>')+'</div>';
  }).join('');
  $('#zip').innerHTML='<div class="flex items-center gap-2 px-5 h-12 shrink-0 text-sm text-on-surface-variant">'+ic('folder_zip','sm')+'<span class="flex-1">'+files+' files · '+sz(tot)+' uncompressed</span></div><div class="flex-1 overflow-auto px-2 pb-4">'+(rows||'<div class="text-center py-16 text-on-surface-variant">Empty archive</div>')+'</div>';
}
function csvRows(t){var rows=[],r=[],c='',q=false;for(var i=0;i<t.length&&rows.length<500;i++){var ch=t[i];if(q){if(ch==='"'){if(t[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}else if(ch==='"')q=true;else if(ch===','){r.push(c);c=''}else if(ch==='\n'){r.push(c.replace(/\r$/,''));rows.push(r);r=[];c=''}else c+=ch}if(c||r.length){r.push(c);rows.push(r)}return rows}
function renderText(it,table){
  var t=S.txt,lines=t.split('\n'),trunc=it.size>1048576||lines.length>5000;
  if(lines.length>5000)lines=lines.slice(0,5000);
  S.txtTable=table;
  var h='<div class="flex items-center gap-2 px-4 h-12 bg-white/5 shrink-0 text-sm"><span class="text-white/60 flex-1">'+lines.length+' lines'+(trunc?' · preview truncated, download for the full file':'')+'</span>'+(ext(it.name)==='csv'?'<button data-a="txtmode" class="h-8 px-4 rounded-full bg-white/10">'+(table?'Text':'Table')+'</button>':'')+'<button data-a="txtcopy" class="h-8 px-4 rounded-full bg-white/10">Copy</button></div>';
  if(table){
    var rows=csvRows(t);
    h+='<div class="flex-1 overflow-auto"><table class="text-sm min-w-full">'+rows.map(function(r,i){return '<tr class="'+(i?'border-t border-white/10':'sticky top-0 bg-neutral-900 font-semibold')+'">'+r.map(function(c){return '<td class="px-3 py-2 whitespace-nowrap max-w-xs truncate">'+E(c)+'</td>'}).join('')+'</tr>'}).join('')+'</table></div>';
  }else{
    h+='<div class="flex-1 overflow-auto font-mono text-[13px] leading-6 flex"><div class="select-none text-right text-white/35 px-3 py-3 sticky left-0 bg-black/90 shrink-0">'+lines.map(function(_,i){return i+1}).join('<br>')+'</div><pre class="py-3 pr-6 m-0 text-white/90">'+E(lines.join('\n'))+'</pre></div>';
  }
  $('#txt').innerHTML=h;
}
function T(s){if(!isFinite(s))return '0:00';s=Math.floor(s);var h=Math.floor(s/3600),m=Math.floor(s%3600/60),ss=s%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(ss).padStart(2,'0')}
function mountMedia(){
  var m=$('#media'),seek=$('#seek'),tc=$('#tc'),td=$('#td'),vol=$('#vol'),dragging=false;
  var pb=function(){return document.querySelector('[data-a=vplay] .ms')};
  m.playbackRate=S.rate;
  m.ontimeupdate=function(){if(!dragging&&m.duration)seek.value=m.currentTime/m.duration*1000;tc.textContent=T(m.currentTime)};
  m.onloadedmetadata=function(){td.textContent=T(m.duration)};
  m.onplay=function(){var p=pb();if(p)p.textContent='pause';$('#viewer').classList.add('playing')};
  m.onpause=function(){var p=pb();if(p)p.textContent='play_arrow';$('#viewer').classList.remove('playing')};
  m.onended=function(){step(1,true)};
  m.onerror=function(){toast('This format cannot be played in your browser')};
  seek.onpointerdown=function(){dragging=true};seek.onpointerup=function(){dragging=false};
  seek.oninput=function(){if(m.duration)m.currentTime=seek.value/1000*m.duration};
  vol.oninput=function(){m.volume=vol.value/100;m.muted=false};
  var pr=m.play();if(pr&&pr.catch)pr.catch(function(){});
}

function setSort(k){if(S.sort.k===k)S.sort.d*=-1;else S.sort={k:k,d:1};draw()}
function selAct(x){
  var s=selItems(),it=s[0];
  if(x==='clear'){S.sel=new Set();updateSel();return}
  if(!it)return;
  if(x==='open')openItem(it);
  else if(x==='dl'){
    var fs=s.filter(function(i){return !i.folder});
    fs.forEach(function(f,n){setTimeout(function(){dl(f)},n*600)});
    if(fs.length>1)toast('Downloading '+fs.length+' files');
  }
  else if(x==='share')shareDialog(it);
  else if(x==='info'){if(desk()){cfg.info=true;saveCfg();updateSel()}else details(it)}
  else if(x==='star'){if(s.length===1)toggleStar(it);else{var all=s.every(isStar);s.forEach(function(i){if(all)S.stars=S.stars.filter(function(z){return z.id!==i.id});else if(!isStar(i))S.stars.unshift(slim(i))});saveStars();toast(all?'Removed from Starred':'Added to Starred');if(S.r.t==='starred')draw();else updateSel()}}
}
document.addEventListener('touchstart',function(e){
  var el=e.target.closest('[data-a=item]');
  clearTimeout(LP.t);LP.fired=false;
  if(!el||e.target.closest('[data-a=menu]')||e.touches.length!==1)return;
  var tc=e.touches[0];LP.x=tc.clientX;LP.y=tc.clientY;
  LP.t=setTimeout(function(){
    var it=S.vis[+el.dataset.i];
    if(!it)return;
    LP.fired=true;toggleSel(it);
    if(navigator.vibrate)navigator.vibrate(15);
  },450);
},{passive:true});
document.addEventListener('touchmove',function(e){
  if(!LP.t)return;
  var tc=e.touches[0];
  if(Math.abs(tc.clientX-LP.x)>10||Math.abs(tc.clientY-LP.y)>10){clearTimeout(LP.t);LP.t=null}
},{passive:true});
['touchend','touchcancel'].forEach(function(n){document.addEventListener(n,function(){clearTimeout(LP.t);LP.t=null},{passive:true})});
document.addEventListener('click',function(e){
  if(e.target.closest('#side a'))closeNav();
  var t=e.target.closest('[data-a]');
  if(!t){if(desk()&&S.sel.size&&e.target.closest('#body')){S.sel=new Set();updateSel()}return}
  var a=t.dataset.a,x=t.dataset.x,m=$('#media'),it=S.vis[+t.dataset.i],mg=S.mg,mi=+t.dataset.i;
  switch(a){
    case 'item':if(LP.fired){LP.fired=false;break}clickItem(e,+t.dataset.i);break;
    case 'cb':e.stopPropagation();toggleSel(it);break;
    case 'menu':e.stopPropagation();var b=t.getBoundingClientRect();popup(b.left-160,b.bottom,menuFor(it));break;
    case 'mi':var f=S.fns[+t.dataset.n];closeMenu();if(f)f();break;
    case 'closemenu':closeMenu();break;
    case 'navopen':openNav();break;
    case 'closenav':closeNav();break;
    case 'closedlg':closeDlg();break;
    case 'dlg-dl':dl(S.dlgItem);break;
    case 'profile':var pf=$('#profile');if(pf.classList.contains('hidden')){pf.innerHTML=profileV();pf.classList.remove('hidden');$('#mscrim').classList.remove('hidden')}else closeMenu();break;
    case 'manage':closeMenu();mgLoad();break;
    case 'mgtab':mg.tab=x;mg.form=null;mgDraw();break;
    case 'mgcfg':mgRun('/api/manage/config',{name:$('#mg-cname').value,favicon:$('#mg-cfav').value},function(){location.reload()});break;
    case 'mguadd':mg.form={t:'user',mode:'add',email:'',allowedit:false};mgDraw();break;
    case 'mguedit':mg.form={t:'user',mode:'edit',email:mg.d.users[mi].email,allowedit:mg.d.users[mi].allowedit};mgDraw();break;
    case 'mgpass':mg.form={t:'user',mode:'self'};mgDraw();break;
    case 'mgudel':if(confirm('Delete '+mg.d.users[mi].email+'?'))mgRun('/api/manage/users',{action:'delete',email:mg.d.users[mi].email});break;
    case 'mgdadd':mg.form={t:'dir',mode:'add',dir:{name:'',id:'',type:'folder',protect:false}};mgDraw();break;
    case 'mgdedit':mg.form={t:'dir',mode:'update',i:mi,dir:Object.assign({},mg.d.dirs[mi])};mgDraw();break;
    case 'mgddel':if(confirm('Remove location '+mg.d.dirs[mi].name+'?'))mgRun('/api/manage/dirs',{action:'delete',index:mi},refreshDirs);break;
    case 'mgsave':mgSave();break;
    case 'mgcancel':mg.form=null;mgDraw();break;
    case 'signout':api('/api/logout',{method:'POST'}).then(function(d){
      closeMenu();
      if(!d.users.length){showLogin();return}
      S.accts=d.users;var nu=Math.min(S.u,d.users.length-1);setAccount(nu);var hh=H('home');if(location.hash===hh)route();else location.hash=hh;
    }).catch(showLogin);break;
    case 'swacct':closeMenu();location.hash='#/u/'+(+x)+'/home';break;
    case 'addacct':addAccount();break;
    case 'lcancel':cancelAdd();break;
    case 'lnext':doNext();break;
    case 'lback':loginStep(1);break;
    case 'dologin':doLogin();break;
    case 'sortmenu':var r=t.getBoundingClientRect();popup(r.left,r.bottom,[['sort_by_alpha','Name',function(){setSort('name')},S.sort.k==='name'],['schedule','Modified',function(){setSort('modified')},S.sort.k==='modified'],['straighten','Size',function(){setSort('size')},S.sort.k==='size']]);break;
    case 'filter':S.filter=x;S.sel=new Set();draw();break;
    case 'setview':cfg.view=x;saveCfg();draw();if(!$('#profile').classList.contains('hidden'))$('#profile').innerHTML=profileV();break;
    case 'theme':cfg.theme=x;saveCfg();applyTheme();$('#profile').innerHTML=profileV();break;
    case 'hue':cfg.hue=+x;saveCfg();applyTheme();$('#profile').innerHTML=profileV();break;
    case 'infotoggle':cfg.info=!cfg.info;saveCfg();drawTools();drawInfo();break;
    case 'sact':selAct(x);break;
    case 'clearq':$('#q').value='';$('#qc').classList.add('hidden');$('#q').focus();break;
    case 'retry':route();break;
    case 'shmode':S.shMode=x;drawShare();break;
    case 'shdays':S.shDays=+x;drawShare();break;
    case 'shadd':shAdd();break;
    case 'shrm':S.shTo.splice(mi,1);drawShare();break;
    case 'shpick':if(S.shTo.indexOf(x)<0)S.shTo.push(x);drawShare();break;
    case 'shsend':shSend();break;
    case 'mkshare':mkShare();break;
    case 'cpshare':copy($('#shurl').value);break;
    case 'vclose':closeViewer();break;
    case 'vprev':e.stopPropagation();step(-1);break;
    case 'vnext':e.stopPropagation();step(1);break;
    case 'vplay':if(m)m.paused?m.play():m.pause();break;
    case 'vback':if(m)m.currentTime=Math.max(0,m.currentTime-10);break;
    case 'vfwd':if(m)m.currentTime=Math.min(m.duration||1e9,m.currentTime+10);break;
    case 'vspeed':var R=[1,1.25,1.5,2,0.75];S.rate=R[(R.indexOf(S.rate)+1)%R.length];if(m)m.playbackRate=S.rate;t.textContent=S.rate+'x';break;
    case 'vmute':if(m){m.muted=!m.muted;t.firstChild.textContent=m.muted?'volume_off':'volume_up'}break;
    case 'vfs':var sg=$('#stage');document.fullscreenElement?document.exitFullscreen():sg.requestFullscreen&&sg.requestFullscreen();break;
    case 'vpip':if(m&&m.requestPictureInPicture)m.requestPictureInPicture().catch(function(){});break;
    case 'vinfo':details(S.vw.it);break;
    case 'vshare':shareDialog(S.vw.it);break;
    case 'vstar':toggleStar(S.vw.it);break;
    case 'zdl':var ze=S.zip&&S.zip.ents[+t.dataset.i];if(ze&&!ze.enc){toast('Preparing…');zipExtract(ze).then(function(bl){var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=ze.name.split('/').pop();document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},4000)}).catch(function(er){toast(er.message)})}break;
    case 'txtmode':renderText(S.vw.it,!S.txtTable);break;
    case 'txtcopy':copy(S.txt);break;
    case 'vzoom':var z=t.classList.toggle('zoomed');t.style.maxWidth=z?'none':'';t.style.maxHeight=z?'none':'';t.classList.toggle('cursor-zoom-out',z);t.classList.toggle('cursor-zoom-in',!z);t.parentNode.style.overflow=z?'auto':'hidden';break;
  }
});
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'&&t.dataset&&t.dataset.fb){var sp=document.createElement('span');sp.innerHTML=t.dataset.fb;t.replaceWith(sp.firstChild)}},true);
document.addEventListener('contextmenu',function(e){
  var t=e.target.closest('[data-a=item]');if(!t)return;e.preventDefault();
  if(!desk())return;
  var it=S.vis[+t.dataset.i];
  popup(e.clientX,e.clientY,menuFor(it));
});
document.addEventListener('keydown',function(e){
  var tg=e.target.tagName,typing=tg==='INPUT'&&e.target.type!=='range'&&e.target.type!=='checkbox'||tg==='TEXTAREA'||tg==='SELECT';
  if(!$('#login').classList.contains('hidden')){if(e.key==='Enter'){e.preventDefault();if(S.lstep===1)doNext();else doLogin()}return}
  if(e.key==='Enter'&&e.target.id==='shemail'){e.preventDefault();shAdd();return}
  if(e.key==='Escape'){
    if(!$('#dlgw').classList.contains('hidden'))closeDlg();else if(!$('#menu').classList.contains('hidden')||!$('#profile').classList.contains('hidden'))closeMenu();else if($('#side').classList.contains('open'))closeNav();else if(S.vw)closeViewer();else if(typing)e.target.blur();else if(S.sel.size){S.sel=new Set();updateSel()}return;
  }
  if(typing)return;
  if(e.key==='/'){e.preventDefault();$('#q').focus();return}
  if(!S.vw){
    if((e.ctrlKey||e.metaKey)&&e.key==='a'&&S.vis.length){e.preventDefault();S.sel=new Set(S.vis.map(kk));updateSel()}
    else if(e.key==='Enter'&&S.sel.size===1)openItem(selItems()[0]);
    return;
  }
  var m=$('#media'),k=kindOf(S.vw.it);
  if(e.key==='ArrowRight'){e.preventDefault();if(m)m.currentTime+=5;else step(1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();if(m)m.currentTime-=5;else step(-1)}
  else if(e.key==='n'||e.key==='PageDown')step(1);
  else if(e.key==='p'||e.key==='PageUp')step(-1);
  else if(m&&(e.key===' '||e.key==='k')){e.preventDefault();m.paused?m.play():m.pause()}
  else if(m&&e.key==='m'){m.muted=!m.muted}
  else if(k==='video'&&e.key==='f'){var sg=$('#stage');document.fullscreenElement?document.exitFullscreen():sg.requestFullscreen()}
});
var qt;
$('#q').addEventListener('input',function(){
  var v=this.value.trim();$('#qc').classList.toggle('hidden',!this.value);clearTimeout(qt);
  if(v.length>=2)qt=setTimeout(function(){var h=H('search/'+encodeURIComponent(v));if(location.hash!==h)location.replace(h)},500);
});
$('#q').addEventListener('keydown',function(e){if(e.key==='Enter'){var v=this.value.trim();if(v){clearTimeout(qt);location.hash=H('search/'+encodeURIComponent(v))}this.blur()}});
$('#lshow').addEventListener('change',function(){$('#lp').type=this.checked?'text':'password'});
window.addEventListener('hashchange',function(){if(S.me)route()});
document.addEventListener('visibilitychange',function(){
  if(document.hidden||!S.me)return;
  if(Date.now()-S.udAt>20000)pullUD();
  if(S.r.t==='shared'&&!S.vw)loadShared();
});

function boot(){
  $('#login').classList.add('hidden');$('#login').classList.remove('flex');$('#app').classList.remove('hidden');
  $('#avatar').textContent=S.me.charAt(0).toUpperCase();
  api('/api/dirs').then(function(d){S.dirs=d;route();pullUD();api('/api/users').then(function(r){S.allUsers=r.users||[]}).catch(function(){});api('/api/usage').then(function(v){S.usage=v;buildNav();if(!$('#profile').classList.contains('hidden'))$('#profile').innerHTML=profileV()}).catch(function(){S.usage=null})}).catch(function(e){if(S.me)$('#main').innerHTML='<div class="text-center py-24">'+ic('cloud_off','xl')+'<div class="mt-3">Could not load storage locations.</div></div>'});
}
applyTheme();
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){})});
fetch('/api/me').then(function(r){return r.ok?r.json():null}).then(function(d){if(d&&d.users&&d.users.length){S.accts=d.users;var h=parseHash();setAccount(h.u!==null&&S.accts[h.u]?h.u:0);boot()}else showLogin()}).catch(showLogin);
})();
</script>
</body>
</html>`;
