// FIREBASE CONFIG
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


// DATA OGGI
function getToday(){
const d = new Date();
return d.toISOString().split("T")[0];
}



// SIGLE NOMI
const sigle = {
"Alessio":"A",
"Sebastiano":"S",
"Andrea":"AN",
"Francesca":"F",
"Rosario":"R"
};



// ROTAZIONI DECISIONE MANUALE
const rotazioni = {

"A": ["Alessio"],
"S": ["Sebastiano"],
"AN": ["Andrea"],
"F": ["Francesca"],
"R": ["Rosario"],

"A-S": ["Sebastiano","Alessio"],
"A-AN": ["Alessio","Andrea"],
"A-F": ["Francesca","Alessio"],
"A-R": ["Rosario","Alessio"],

"S-AN": ["Andrea","Sebastiano"],
"S-F": ["Francesca","Sebastiano"],
"S-R": ["Rosario","Sebastiano"],

"AN-F": ["Francesca","Andrea"],
"AN-R": ["Andrea","Rosario"],
"F-R": ["Francesca","Rosario"],

"A-S-AN": ["Sebastiano","Andrea","Alessio"],
"A-S-F": ["Francesca","Sebastiano","Alessio"],
"A-S-R": ["Sebastiano","Rosario","Alessio"],

"A-AN-F": ["Andrea","Francesca","Alessio"],
"A-AN-R": ["Alessio","Andrea","Rosario"],
"A-F-R": ["Rosario","Alessio","Francesca"],

"S-AN-F": ["Andrea","Sebastiano","Francesca"],
"S-AN-R": ["Sebastiano","Rosario","Andrea"],
"S-F-R": ["Sebastiano","Rosario","Francesca"],

"AN-F-R": ["Andrea","Francesca","Rosario"],

"A-S-AN-F": ["Sebastiano","Francesca","Alessio","Andrea"],
"A-S-AN-R": ["Rosario","Sebastiano","Alessio","Andrea"],
"A-S-F-R": ["Alessio","Sebastiano","Francesca","Rosario"],
"A-AN-F-R": ["Andrea","Francesca","Rosario","Alessio"],
"S-AN-F-R": ["Francesca","Andrea","Rosario","Sebastiano"],

"A-S-AN-F-R": ["Francesca","Andrea","Rosario","Alessio","Sebastiano"]

};



// TROVA ROTAZIONE
function trovaRotazione(presenti){

const chiave = presenti
.map(n => sigle[n])
.sort()
.join("-");

return rotazioni[chiave] || presenti;

}



// CALCOLA GUIDATORE
function calcolaGuidatore(){

  function simulaDomani(){

const checkboxes =
document.querySelectorAll("input[type=checkbox]:checked");

const presenti =
Array.from(checkboxes).map(c=>c.value);

if(presenti.length===0){

document.getElementById("risultato").innerHTML=
"Seleziona almeno un collega";

return;

}

const rotazione = trovaRotazione(presenti);

const driver = rotazione[0];

const passeggeri = presenti.filter(p=>p!==driver);

document.getElementById("risultato").innerHTML =

`🔮 Domani guiderebbe: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

mostraRotazione(rotazione);

}

const today = getToday();

db.collection("carpool").doc(today).get().then(doc=>{

if(doc.exists && doc.data().driver){

alert("Guidatore già calcolato");
return;

}

const checkboxes =
document.querySelectorAll("input[type=checkbox]:checked");

const presenti =
Array.from(checkboxes).map(c=>c.value);

if(presenti.length===0){

document.getElementById("risultato").innerHTML=
"Seleziona almeno un collega";

return;

}

const rotazione = trovaRotazione(presenti);

const driver = rotazione[0];

const passeggeri = presenti.filter(p=>p!==driver);

db.collection("carpool").doc(today).set({

driver:driver,
presenti:presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp()

});

document.getElementById("risultato").innerHTML=

`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

mostraRotazione(rotazione);

renderStorico();

});

}



// MOSTRA ROTAZIONE
function mostraRotazione(rotazione){

let html="<h3>🔁 Rotazione attiva</h3>";

rotazione.forEach(nome=>{
html+=nome+"<br>";
});

document.getElementById("rotazione").innerHTML=html;

}



// OGGI NON VENGO
function oggiNonVengo(){

const today=getToday();

const checkboxes =
document.querySelectorAll("input[type=checkbox]:checked");

const presenti =
Array.from(checkboxes).map(c=>c.value);

db.collection("carpool").doc(today).set({

driver:null,
presenti:presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp()

});

document.getElementById("risultato").innerHTML=
"❌ Presenza aggiornata";

renderStorico();

}



// STORICO 90 GIORNI
function renderStorico(){

const calendario =
document.getElementById("calendario");

calendario.innerHTML="Caricamento...";

db.collection("carpool")
.orderBy("timestamp","desc")
.limit(90)
.get()

.then(snapshot=>{

calendario.innerHTML="";

snapshot.forEach(doc=>{

const data=doc.id;
const info=doc.data();

const giorno = new Date(data)
.toLocaleDateString('it-IT',{
weekday:'short',
day:'numeric',
month:'numeric'
});

const driver=info.driver || "—";

let passeggeri=[];

if(info.presenti){

passeggeri =
info.presenti.filter(p=>p!==driver);

}

calendario.innerHTML+=`

<div style="margin-bottom:10px">
<b>${giorno}</b> — 🚗 ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ") || "—"}
</div>

`;

});

});

}



// REALTIME UPDATE
db.collection("carpool")
.doc(getToday())
.onSnapshot(doc=>{

if(doc.exists){

const data = doc.data();

const driver = data.driver || "—";

const passeggeri =
(data.presenti || [])
.filter(p=>p!==driver);

document.getElementById("risultato").innerHTML=

`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

}

});



renderStorico();



// SERVICE WORKER
if("serviceWorker" in navigator){

navigator.serviceWorker
.register("service-worker.js");

}
