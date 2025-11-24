/**
 * Xtream Codes API Cloudflare Worker
 * Stellt eine Xtream Codes API für M3U Playlists bereit
 *
 * HINWEIS: Credentials werden aus Environment Variables geladen (GitHub Secrets)
 * Fallback auf hardcoded Werte wenn keine Env Variables gesetzt sind
 */

// Default Konfiguration (Fallback)
const DEFAULT_CONFIG = {
  PLAYLIST_URL: 'https://raw.githubusercontent.com/Rosenweg/tv7/main/playlist.m3u',
  WORKER_URL: 'https://xtream-api.workers.dev',
  CREDENTIALS: [
    { username: 'user1', password: 'pass1' },
    { username: 'admin', password: 'secret123' }
  ]
};

/**
 * Lädt Konfiguration aus Environment Variables oder verwendet Defaults
 */
function getConfig(env) {
  // Playlist URL
  const playlistUrl = env.PLAYLIST_URL || DEFAULT_CONFIG.PLAYLIST_URL;
  const workerUrl = env.WORKER_URL || DEFAULT_CONFIG.WORKER_URL;

  // Credentials: Versuche JSON aus Environment Variable zu parsen
  let credentials = DEFAULT_CONFIG.CREDENTIALS;
  if (env.CREDENTIALS) {
    try {
      credentials = JSON.parse(env.CREDENTIALS);
    } catch (e) {
      console.error('Failed to parse CREDENTIALS env var, using defaults');
    }
  }

  return {
    PLAYLIST_URL: playlistUrl,
    CREDENTIALS: credentials,
    SERVER_INFO: {
      url: workerUrl,
      port: '443',
      https_port: '443',
      server_protocol: 'https',
      rtmp_port: '',
      timezone: 'Europe/Zurich',
      timestamp_now: Math.floor(Date.now() / 1000),
      time_now: new Date().toISOString()
    }
  };
}

/**
 * Haupthandler für alle Requests
 */
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  }
};

/**
 * Request Handler
 */
async function handleRequest(request, env) {
  const CONFIG = getConfig(env);
  const url = new URL(request.url);
  const params = url.searchParams;

  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Authentifizierung
  const username = params.get('username');
  const password = params.get('password');

  if (!authenticateUser(username, password, CONFIG)) {
    return jsonResponse({ error: 'Invalid credentials' }, 401, corsHeaders);
  }

  // Route zu entsprechendem Endpoint
  const pathname = url.pathname;

  if (pathname.includes('player_api.php')) {
    return handlePlayerAPI(params, corsHeaders, CONFIG);
  } else if (pathname.includes('get.php')) {
    return handleGetPlaylist(params, corsHeaders, CONFIG);
  } else {
    return htmlResponse(getWelcomePage(CONFIG), corsHeaders);
  }
}

/**
 * Authentifizierung
 */
function authenticateUser(username, password, CONFIG) {
  return CONFIG.CREDENTIALS.some(
    cred => cred.username === username && cred.password === password
  );
}

/**
 * Player API Handler
 */
async function handlePlayerAPI(params, corsHeaders, CONFIG) {
  const action = params.get('action');

  if (!action) {
    // Server Info
    return jsonResponse({
      user_info: {
        username: params.get('username'),
        password: params.get('password'),
        message: 'Welcome to Xtream Codes API',
        auth: 1,
        status: 'Active',
        exp_date: '1893456000', // Jahr 2030
        is_trial: '0',
        active_cons: '0',
        created_at: '1609459200',
        max_connections: '5',
        allowed_output_formats: ['m3u8', 'ts']
      },
      server_info: CONFIG.SERVER_INFO
    }, 200, corsHeaders);
  }

  // Lade M3U Playlist
  const playlist = await fetchPlaylist(CONFIG);
  const streams = parseM3U(playlist);

  switch (action) {
    case 'get_live_categories':
      return jsonResponse(getLiveCategories(streams), 200, corsHeaders);

    case 'get_live_streams':
      return jsonResponse(getLiveStreams(streams, params.get('category_id')), 200, corsHeaders);

    case 'get_vod_categories':
      return jsonResponse([], 200, corsHeaders);

    case 'get_vod_streams':
      return jsonResponse([], 200, corsHeaders);

    case 'get_series_categories':
      return jsonResponse([], 200, corsHeaders);

    case 'get_series':
      return jsonResponse([], 200, corsHeaders);

    default:
      return jsonResponse({ error: 'Unknown action' }, 400, corsHeaders);
  }
}

/**
 * M3U Playlist Handler
 */
async function handleGetPlaylist(params, corsHeaders, CONFIG) {
  const type = params.get('type') || 'm3u';
  const output = params.get('output') || 'ts';

  // Lade Original Playlist
  const playlist = await fetchPlaylist(CONFIG);

  return new Response(playlist, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/x-mpegurl',
      'Content-Disposition': 'attachment; filename="playlist.m3u"'
    }
  });
}

/**
 * Lädt die M3U Playlist von GitHub
 */
async function fetchPlaylist(CONFIG) {
  const response = await fetch(CONFIG.PLAYLIST_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch playlist');
  }
  return await response.text();
}

/**
 * Parst M3U Playlist
 */
function parseM3U(content) {
  const streams = [];
  const lines = content.split('\n');

  let currentStream = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF line
      const tvgId = extractAttribute(line, 'tvg-id');
      const tvgName = extractAttribute(line, 'tvg-name');
      const tvgLogo = extractAttribute(line, 'tvg-logo');
      const groupTitle = extractAttribute(line, 'group-title');

      // Extract name (nach letztem Komma)
      const nameMatch = line.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown';

      currentStream = {
        num: streams.length + 1,
        name: name,
        stream_type: 'live',
        stream_id: streams.length + 1,
        stream_icon: tvgLogo,
        epg_channel_id: tvgId,
        category_id: groupTitle ? hashCode(groupTitle) : 1,
        category_name: groupTitle || 'Uncategorized',
        tvg_id: tvgId,
        tvg_name: tvgName || name
      };
    } else if (line && !line.startsWith('#') && currentStream) {
      // URL Zeile
      currentStream.url = line;
      streams.push(currentStream);
      currentStream = null;
    }
  }

  return streams;
}

/**
 * Extrahiert Attribut aus EXTINF Zeile
 */
function extractAttribute(line, attr) {
  const regex = new RegExp(`${attr}="([^"]*)"`, 'i');
  const match = line.match(regex);
  return match ? match[1] : '';
}

/**
 * Hash-Funktion für Kategorie-IDs
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Gibt Live Kategorien zurück
 */
function getLiveCategories(streams) {
  const categoriesMap = new Map();

  streams.forEach(stream => {
    if (!categoriesMap.has(stream.category_id)) {
      categoriesMap.set(stream.category_id, {
        category_id: stream.category_id.toString(),
        category_name: stream.category_name,
        parent_id: 0
      });
    }
  });

  return Array.from(categoriesMap.values());
}

/**
 * Gibt Live Streams zurück
 */
function getLiveStreams(streams, categoryId) {
  let filtered = streams;

  if (categoryId) {
    filtered = streams.filter(s => s.category_id.toString() === categoryId);
  }

  return filtered.map(stream => ({
    num: stream.num,
    name: stream.name,
    stream_type: stream.stream_type,
    stream_id: stream.stream_id,
    stream_icon: stream.stream_icon,
    epg_channel_id: stream.epg_channel_id,
    added: '1609459200',
    category_id: stream.category_id.toString(),
    custom_sid: '',
    tv_archive: 0,
    direct_source: stream.url,
    tv_archive_duration: 0
  }));
}

/**
 * JSON Response Helper
 */
function jsonResponse(data, status = 200, additionalHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
  });
}

/**
 * HTML Response Helper
 */
function htmlResponse(html, additionalHeaders = {}) {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      ...additionalHeaders
    }
  });
}

/**
 * Welcome Page
 */
function getWelcomePage(CONFIG) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Xtream Codes API Server</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 { color: #333; }
    code {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
    .endpoint {
      background: #f9f9f9;
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #007bff;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎬 Xtream Codes API Server</h1>
    <p>Serverless Xtream Codes API powered by Cloudflare Workers</p>

    <h2>📡 IPTV Smarters Pro Setup</h2>
    <div class="endpoint">
      <strong>Server URL:</strong> <code>${CONFIG.SERVER_INFO.url}</code><br>
      <strong>Username:</strong> <code>user1</code><br>
      <strong>Password:</strong> <code>pass1</code>
    </div>

    <h2>🔗 API Endpoints</h2>
    <div class="endpoint">
      <strong>Server Info:</strong><br>
      <code>${CONFIG.SERVER_INFO.url}/player_api.php?username=X&password=Y</code>
    </div>

    <div class="endpoint">
      <strong>Live Streams:</strong><br>
      <code>${CONFIG.SERVER_INFO.url}/player_api.php?username=X&password=Y&action=get_live_streams</code>
    </div>

    <div class="endpoint">
      <strong>M3U Playlist:</strong><br>
      <code>${CONFIG.SERVER_INFO.url}/get.php?username=X&password=Y&type=m3u_plus&output=ts</code>
    </div>

    <p><small>Powered by Cloudflare Workers | <a href="https://github.com/Rosenweg/tv7">GitHub</a></small></p>
  </div>
</body>
</html>
  `;
}
