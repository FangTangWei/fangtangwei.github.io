/* ===========================================================
 * sw-registration.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 * Register service worker.
 * ========================================================== */

function handleRegistration(registration){
  console.log('Service Worker Registered. ', registration)
  registration.onupdatefound = (e) => {
    const installingWorker = registration.installing;
    installingWorker.onstatechange = (e) => {
      if (installingWorker.state !== 'installed') return;
      if (navigator.serviceWorker.controller) {
        console.log('SW is updated');
      } else {
        console.log('A Visit without previous SW');
        createSnackbar({
          message: 'App ready for offline use.',
          duration: 3000
        })
      }
    };
  }
}

if(navigator.serviceWorker){
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      handleRegistration(registration);
      registration.update();
    })
    .catch((error) => {console.log('ServiceWorker registration failed: ', error)})

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // New SW took control; page will get fresh content on next navigation
  });

  navigator.serviceWorker.onmessage = (e) => {
    const data = e.data

    if(data.command == "UPDATE_FOUND"){
      console.log("UPDATE_FOUND_BY_SW", data);
      createSnackbar({
        message: "博客内容已更新",
        actionText: "刷新",
        action: function(){ location.reload() }
      })
    }
  }
}
