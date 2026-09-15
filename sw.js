/* 一回開いたら、電波が無うても動くようにする。 */
var C = "aigolf-round-log-542a97da97";
var CORE = ["./", "./caddie.html","./course_rose.json","./index.html", "./range.html",
            "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(C).then(function(c){ return c.addAll(CORE); })
              .then(function(){ return self.skipWaiting(); }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){ return k===C ? null : caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

/* 手元にある物を先に返す。無かったら取りに行って、取れたら仕舞う。
   （書体のような別所の物も opaque のまま仕舞える） */
self.addEventListener("fetch", function(e){
  if(e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function(hit){
      if(hit) return hit;
      return fetch(e.request).then(function(res){
        if(res && (res.ok || res.type === "opaque")){
          var copy = res.clone();
          caches.open(C).then(function(c){ c.put(e.request, copy); });
        }
        return res;
      }).catch(function(){
        return e.request.mode === "navigate" ? caches.match("./index.html") : Response.error();
      });
    })
  );
});
