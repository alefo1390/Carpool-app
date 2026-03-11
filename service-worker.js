self.addEventListener("install", event => {

console.log("Service Worker installato");

});


self.addEventListener("activate", event => {

console.log("Service Worker attivo");

});


self.addEventListener("notificationclick", function(event){

event.notification.close();

event.waitUntil(

clients.openWindow("./")

);

});
