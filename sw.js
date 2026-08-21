/* ===========================================================
 * sw.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 * service worker scripting
 * ========================================================== */

// CACHE_NAMESPACE
// CacheStorage is shared between all sites under same domain.
// A namespace can prevent potential name conflicts and mis-deletion.
const CACHE_NAMESPACE = 'main-'

const CACHE = CACHE_NAMESPACE + 'precache-then-runtime-v3';
const STATIC_CACHE = CACHE_NAMESPACE + 'static-v3';
const PRECACHE_LIST = [
  "./",
  "./offline.html",
  "./js/jquery.min.js",
  "./js/bootstrap.min.js",
  "./js/hux-blog.min.js",
  "./js/simple-jekyll-search.min.js",
  "./js/snackbar.js",
  "./js/sw-registration.js",
  "./css/bootstrap.min.css",
  "./css/hux-blog.css",
  "./css/luxury-enhancements.css",
  "./img/favicon.jpg",
  "./img/404-bg.jpg",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.6.3/css/font-awesome.min.css"
]
const HOSTNAME_WHITELIST = [
  self.location.hostname,
  "huangxuan.me",
  "yanshuo.io",
  "cdnjs.cloudflare.com",
  "pagead2.googlesyndication.com"
]
const DEPRECATED_CACHES = ['precache-v1', 'runtime', 'main-precache-v1', 'main-runtime', 'main-precache-then-runtime', 'main-static-v1', 'main-precache-then-runtime-v2', 'main-static-v2']


// The Util Function to hack URLs of intercepted requests
const getCacheBustingUrl = (req) => {
  var now = Date.now();
  url = new URL(req.url)

  // 1. fixed http URL
  // Just keep syncing with location.protocol
  // fetch(httpURL) belongs to active mixed content.
  // And fetch(httpRequest) is not supported yet.
  url.protocol = self.location.protocol

  // 2. add query for caching-busting.
  // Github Pages served with Cache-Control: max-age=600
  // max-age on mutable content is error-prone, with SW life of bugs can even extend.
  // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
  // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
  url.search += (url.search ? '&' : '?') + 'cache-bust=' + now;
  return url.href
}

// The Util Function to detect and polyfill req.mode="navigate"
// request.mode of 'navigate' is unfortunately not supported in Chrome
// versions older than 49, so we need to include a less precise fallback,
// which checks for a GET request with an Accept: text/html header.
const isNavigationReq = (req) => (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept').includes('text/html')))

// The Util Function to detect if a req is end with extension
// Accordin to Fetch API spec <https://fetch.spec.whatwg.org/#concept-request-destination>
// Any HTML's navigation has consistently mode="navigate" type="" and destination="document"
// including requesting an img (or any static resources) from URL Bar directly.
// So It ends up with that regExp is still the king of URL routing ;)
// P.S. An url.pathname has no '.' can not indicate it ends with extension (e.g. /api/version/1.2/)
const endWithExtension = (req) => Boolean(new URL(req.url).pathname.match(/\.\w+$/))

// Redirect in SW manually fixed github pages arbitray 404s on things?blah
// what we want:
//    repo?blah -> !(gh 404) -> sw 302 -> repo/?blah
//    .ext?blah -> !(sw 302 -> .ext/?blah -> gh 404) -> .ext?blah
// If It's a navigation req and it's url.pathname isn't end with '/' or '.ext'
// it should be a dir/repo request and need to be fixed (a.k.a be redirected)
// Tracking https://twitter.com/Huxpro/status/798816417097224193
const shouldRedirect = (req) => (isNavigationReq(req) && new URL(req.url).pathname.substr(-1) !== "/" && !endWithExtension(req))

// The Util Function to get redirect URL
// `${url}/` would mis-add "/" in the end of query, so we use URL object.
// P.P.S. Always trust url.pathname instead of the whole url string.
const getRedirectUrl = (req) => {
  url = new URL(req.url)
  url.pathname += "/"
  return url.href
}


/**
 *  @Lifecycle Install
 *  Precache anything static to this version of your app.
 *  e.	g. App Shell, 404, JS/CSS dependencies...
 *
 *  waitUntil() : installing ====> installed
 *  skipWaiting() : waiting(installed) ====> activating
 */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(PRECACHE_LIST)
        .then(self.skipWaiting())
        .catch(err => console.log(err))
    })
  )
});


/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', event => {
  // delete old deprecated caches.
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames
        .filter(cacheName => DEPRECATED_CACHES.includes(cacheName))
        .map(cacheName => caches.delete(cacheName))
    )).then(() => {
      console.log('service worker activated.')
      return self.clients.claim();
    })
  );
});


var fetchHelper = {

  fetchThenCache: function(request){
    // Requests with mode "no-cors" can result in Opaque Response,
    // Requests to Allow-Control-Cross-Origin: * can't include credentials.
    const init = { mode: "cors", credentials: "omit" }

    const fetched = fetch(request, init)
    const fetchedCopy = fetched.then(resp => resp.clone());

    // NOTE: Opaque Responses have no hedaders so [[ok]] make no sense to them
    //       so Opaque Resp will not be cached in this case.
    Promise.all([fetchedCopy, caches.open(CACHE)])
      .then(([response, cache]) => response.ok && cache.put(request, response))
      .catch(_ => {/* eat any errors */})

    return fetched;
  },

  cacheFirst: function(url){
    return caches.match(url)
      .then(resp => resp || this.fetchThenCache(url))
      .catch(_ => {/* eat any errors */})
  },

  staticCacheFirst: function(request){
    return caches.match(request).then(function(cached) {
      if (cached) {
        // Update cache in background (stale-while-revalidate for static)
        fetch(request).then(function(resp) {
          if (resp && resp.ok) {
            caches.open(STATIC_CACHE).then(function(cache) {
              cache.put(request, resp.clone());
            });
          }
        }).catch(function() {});
        return cached;
      }
      // Not in cache, fetch and cache
      return fetch(request).then(function(resp) {
        if (resp && resp.ok) {
          var respCopy = resp.clone();
          caches.open(STATIC_CACHE).then(function(cache) {
            cache.put(request, respCopy);
          });
        }
        return resp;
      }).catch(function() {
        return caches.match('offline.html');
      });
    });
  }
}

function isStaticAsset(url) {
  return /\.(css|js|woff2?|ttf|eot|png|jpe?g|gif|svg|ico|webp|avif)(\?|$)/i.test(url.pathname);
}


/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r);
 */
self.addEventListener('fetch', event => {
  // logs for debugging
  //console.log(`fetch ${event.request.url}`)
  //console.log(` - type: ${event.request.type}; destination: ${event.request.destination}`)
  //console.log(` - mode: ${event.request.mode}, accept: ${event.request.headers.get('accept')}`)

  // Skip some of cross-origin requests, like those for Google Analytics.
  if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {

    // Redirect in SW manually fixed github pages 404s on repo?blah
    if (shouldRedirect(event.request)) {
      event.respondWith(Response.redirect(getRedirectUrl(event.request)))
      return;
    }

    // Cache-only Strategies for ys.static resources
    if (event.request.url.indexOf('ys.static') > -1){
      event.respondWith(fetchHelper.cacheFirst(event.request.url))
      return;
    }

    // Cache-first for static assets (CSS, JS, fonts, images)
    if (isStaticAsset(new URL(event.request.url))) {
      event.respondWith(fetchHelper.staticCacheFirst(event.request))
      return;
    }

    // Network-first for HTML navigation requests (always get fresh content)
    if (isNavigationReq(event.request)) {
      event.respondWith(
        fetch(getCacheBustingUrl(event.request), { cache: "no-store" })
          .then(resp => {
            var respCopy = resp.clone();
            caches.open(CACHE).then(cache => {
              cache.match(event.request).then(function(oldResp) {
                if (oldResp) {
                  Promise.all([oldResp.text(), respCopy.clone().text()]).then(function(results) {
                    if (results[0] !== results[1]) {
                      self.clients.matchAll().then(function(clients) {
                        clients.forEach(function(client) {
                          client.postMessage({ command: "UPDATE_FOUND" });
                        });
                      });
                    }
                  });
                }
                cache.put(event.request, respCopy);
              });
            });
            return resp;
          })
          .catch(() => caches.match(event.request).then(resp => resp || caches.match('offline.html')))
      );
      return;
    }

    // Stale-while-revalidate for other dynamic content
    const cached = caches.match(event.request);
    const fetched = fetch(getCacheBustingUrl(event.request), { cache: "no-store" });
    const fetchedCopy = fetched.then(resp => resp.clone());

    event.respondWith(
      Promise.race([fetched.catch(_ => cached), cached])
        .then(resp => resp || fetched)
        .catch(_ => caches.match('offline.html'))
    );

    event.waitUntil(
      Promise.all([fetchedCopy, caches.open(CACHE)])
        .then(([response, cache]) => response.ok && cache.put(event.request, response))
        .catch(_ => {/* eat any errors */ })
    );
  }
});
