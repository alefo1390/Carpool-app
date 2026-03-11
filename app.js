// ---------------- FIREBASE ----------------

const firebaseConfig = {
apiKey:"AIzaSyDTCYs2tS8wKzMDVW4BgBAD0SkmswfLmgI",
authDomain:"carpool-app-3e8d5.firebaseapp.com",
projectId:"carpool-app-3e8d5",
storageBucket:"carpool-app-3e8d5.firebasestorage.app",
messagingSenderId:"462538199019",
appId:"1:462538199019:web:9e8127f6ad1642d53393ae"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// ---------------- UTENTE ----------------

let utente = localStorage.getItem("utente");

if(!utente){

utente = prompt("Inserisci il tuo nome");
localStorage.setItem("utente",utente);

}


// ---------------- COLLEGHI ----------------

const colleghi = [
"Alessio",
"Sebastiano",
"Andrea",
"Francesca",
"Rosario"
];


// ---------------- DATA ----------------

function getToday(){

return new Date().toISOString().split("T")[0];

}


// ---------------- NOTIFICHE ----------------

if("Notification" in window){

Notification.requestPermission();

}

function inviaNotifica(driver,passeggeri){

if(Notification.permission !== "granted") return;

new Notification("🚗 Carpool",{

body:`Oggi guida ${driver}
Passeggeri: ${passeggeri.join(", ")}`

});

}


// ---------------- CALCOLA GUIDATORE ----------------

async function calcolaGuidatore(){

const today = getToday();

const doc = await db.collection("carpool").doc(today).get();


// BLOCCO SOLO SE ESISTE GIÀ UN DRIVER

if(doc.exists && doc.data().driver){

alert("Guidatore già calcolato oggi");
return;

}


// presenti selezionati

const checkboxes =
document.querySelectorAll("input[type=checkbox]:checked");

const presenti =
Array.from(checkboxes).map(c=>c.value);

if(presenti.length===0){

alert("Seleziona almeno un collega");
return;

}


// ultimo turno

const snapshot =
await db.collection("carpool")
.orderBy("timestamp","desc")
.limit(1)
.get();

let ultimoDriver=null;
let ultimiPresenti=[];

snapshot.forEach(d=>{

ultimoDriver=d.data().driver;
ultimiPresenti=d.data().presenti || [];

});


// LOGICA ROTAZIONE

let driver;

if(JSON.stringify(presenti.sort()) !== JSON.stringify(ultimiPresenti.sort())){

driver = presenti[0];

}else{

let index = presenti.indexOf(ultimoDriver);

driver = presenti[(index+1) % presenti.length];

}


// passeggeri

const passeggeri =
presenti.filter(p=>p!==driver);


// salva su firestore

await db.collection("carpool").doc(today).set({

driver:driver,
presenti:presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp(),
updatedBy:utente

});


// UI

document.getElementById("risultato").innerHTML=

`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}
<br><br>
👤 Ultimo aggiornamento
${utente}`;


// notifica

inviaNotifica(driver,passeggeri);


// aggiorna storico

renderCalendario();

}



// ---------------- OGGI NON VENGO ----------------

async function oggiNonVengo(){

const today = getToday();

const checkboxes =
document.querySelectorAll("input[type=checkbox]:checked");

let presenti =
Array.from(checkboxes).map(c=>c.value);


// rimuove chi ha premuto

presenti = presenti.filter(p=>p !== utente);


// azzera guidatore

await db.collection("carpool").doc(today).set({

driver:null,
presenti:presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp(),
updatedBy:utente

});

document.getElementById("risultato").innerHTML=

"❌ Presenza aggiornata. Premi 'Calcola guidatore'";

renderCalendario();

}



// ---------------- SIMULA DOMANI ----------------

function simulaDomani(){

const checkboxes =
document.querySelectorAll("input[type=checkbox]:checked");

const presenti =
Array.from(checkboxes).map(c=>c.value);

if(presenti.length===0){

alert("Seleziona presenti");
return;

}

let driver = presenti[0];

let passeggeri =
presenti.filter(p=>p!==driver);

alert(

`DOMANI GUIDA

${driver}

Passeggeri
${passeggeri.join(", ")}`

);

}



// ---------------- STORICO ----------------

async function renderCalendario(){

const calendario =
document.getElementById("calendario");

calendario.innerHTML="Caricamento...";

const snapshot =
await db.collection("carpool")
.orderBy("timestamp","desc")
.limit(90)
.get();

calendario.innerHTML="";

let meseCorrente="";

snapshot.forEach(doc=>{

const data = doc.id;
const info = doc.data();

const giorno = new Date(data);

const mese =
giorno.toLocaleDateString('it-IT',{
month:'long',
year:'numeric'
});

if(mese !== meseCorrente){

meseCorrente=mese;

calendario.innerHTML+=`<h3>${mese}</h3>`;

}

const giornoStr =
giorno.toLocaleDateString('it-IT',{
weekday:'short',
day:'numeric'
});

const driver =
info.driver || "—";

const passeggeri =
(info.presenti || []).filter(p=>p!==driver);

calendario.innerHTML+=

`<b>${giornoStr}</b>
🚗 ${driver}
👥 ${passeggeri.join(", ")}
<br><br>`;

});

}



// ---------------- REALTIME ----------------

db.collection("carpool")
.doc(getToday())
.onSnapshot(doc=>{

if(doc.exists){

const data = doc.data();

const driver =
data.driver || "—";

const passeggeri =
(data.presenti || [])
.filter(p=>p!==driver);

const autore =
data.updatedBy || "—";

document.getElementById("risultato").innerHTML=

`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}
<br><br>
👤 Ultimo aggiornamento
${autore}`;

}

});



// ---------------- AVVIO ----------------

renderCalendario();



// ---------------- SERVICE WORKER ----------------

if("serviceWorker" in navigator){

navigator.serviceWorker.register("service-worker.js");

}
