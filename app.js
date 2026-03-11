// --- FIREBASE CONFIG ---

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


// --- NOME UTENTE (una volta sola)

let utente = localStorage.getItem("utente");

if(!utente){

utente = prompt("Inserisci il tuo nome");

localStorage.setItem("utente",utente);

}


// --- COLLEGHI BASE

const colleghi = ["Alessio","Sebastiano","Andrea","Francesca","Rosario"];


// --- DATA DI OGGI

function getToday(){

return new Date().toISOString().split("T")[0];

}


// --- RICHIESTA NOTIFICHE

if("Notification" in window){

Notification.requestPermission();

}


// --- FUNZIONE NOTIFICA

function inviaNotifica(driver,passeggeri){

if(Notification.permission !== "granted") return;

new Notification("🚗 Carpool",{

body:`Oggi guida ${driver}
Passeggeri: ${passeggeri.join(", ")}`

});

}


// --- CALCOLA GUIDATORE

async function calcolaGuidatore(){

const today = getToday();

const doc = await db.collection("carpool").doc(today).get();


// BLOCCO GUIDATORE SE ESISTE

if(doc.exists){

alert("Guidatore già calcolato oggi");

return;

}


// PRESENTI

const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");

const presenti = Array.from(checkboxes).map(c=>c.value);


if(presenti.length === 0){

alert("Seleziona almeno un collega");

return;

}


// PRENDE ULTIMO TURNO

const snapshot = await db.collection("carpool")
.orderBy("timestamp","desc")
.limit(1)
.get();


let ultimoDriver=null;
let ultimiPresenti=[];

snapshot.forEach(d=>{

ultimoDriver=d.data().driver;
ultimiPresenti=d.data().presenti || [];

});


// SE CAMBIANO I PRESENTI RIPARTE ROTAZIONE

let driver=null;

if(JSON.stringify(presenti.sort()) !== JSON.stringify(ultimiPresenti.sort())){

driver=presenti[0];

}else{

let index = presenti.indexOf(ultimoDriver);

driver = presenti[(index+1) % presenti.length];

}


// PASSEGGERI

const passeggeri = presenti.filter(p=>p!==driver);


// SALVA SU FIRESTORE

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


// NOTIFICA

inviaNotifica(driver,passeggeri);


// AGGIORNA STORICO

renderCalendario();

}


// --- OGGI NON VENGO

async function oggiNonVengo(){

const today = getToday();

await db.collection("carpool").doc(today).set({

driver:null,
presenti:[],
timestamp:firebase.firestore.FieldValue.serverTimestamp(),
updatedBy:utente

});

document.getElementById("risultato").innerHTML=

"❌ Hai segnato assenza";

renderCalendario();

}


// --- SIMULA DOMANI

function simulaDomani(){

const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");

const presenti = Array.from(checkboxes).map(c=>c.value);

if(presenti.length===0){

alert("Seleziona presenti");

return;

}

const driver = presenti[0];

const passeggeri = presenti.slice(1);

alert(

`DOMANI GUIDA

${driver}

Passeggeri
${passeggeri.join(", ")}`

);

}


// --- STORICO 90 GIORNI DIVISO PER MESE

async function renderCalendario(){

const calendario = document.getElementById("calendario");

calendario.innerHTML="Caricamento...";

const snapshot = await db.collection("carpool")
.orderBy("timestamp","desc")
.limit(90)
.get();

calendario.innerHTML="";

let meseCorrente="";

snapshot.forEach(doc=>{

const data = doc.id;

const info = doc.data();

const giorno = new Date(data);

const mese = giorno.toLocaleDateString('it-IT',{month:'long',year:'numeric'});

if(mese !== meseCorrente){

meseCorrente=mese;

calendario.innerHTML += `<h3>${mese}</h3>`;

}

const giornoStr = giorno.toLocaleDateString('it-IT',{

weekday:'short',
day:'numeric'

});

const driver = info.driver || "—";

const passeggeri = (info.presenti || []).filter(p=>p!==driver);

calendario.innerHTML +=

`<b>${giornoStr}</b>
🚗 ${driver}
👥 ${passeggeri.join(", ")}
<br><br>`;

});

}


// --- AGGIORNAMENTO IN TEMPO REALE

db.collection("carpool")
.doc(getToday())
.onSnapshot(doc=>{

if(doc.exists){

const data = doc.data();

const driver = data.driver || "—";

const passeggeri = (data.presenti || []).filter(p=>p!==driver);

const autore = data.updatedBy || "—";

document.getElementById("risultato").innerHTML=

`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}
<br><br>
👤 Ultimo aggiornamento
${autore}`;

}

});


// --- CARICA STORICO

renderCalendario();


// --- SERVICE WORKER

if("serviceWorker" in navigator){

navigator.serviceWorker.register("service-worker.js");

}
