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


// ---------------- CONFRONTO PRESENTI ----------------

function stessiPresenti(a,b){

if(!a || !b) return false;
if(a.length !== b.length) return false;

const aa=[...a].sort();
const bb=[...b].sort();

for(let i=0;i<aa.length;i++){
if(aa[i]!==bb[i]) return false;
}

return true;

}


// ---------------- PROSSIMO GUIDATORE ----------------

function trovaProssimoGuidatore(ultimoDriver,presenti,presentiIeri){

const rotazione = colleghi.filter(c=>presenti.includes(c));

if(rotazione.length===0) return null;


// gruppo diverso → riparte rotazione

if(!stessiPresenti(presenti,presentiIeri)){
return rotazione[0];
}


// continua rotazione

if(!ultimoDriver || !rotazione.includes(ultimoDriver)){
return rotazione[0];
}

const index = rotazione.indexOf(ultimoDriver);

return rotazione[(index+1)%rotazione.length];

}


// ---------------- MOSTRA ROTAZIONE ----------------

function mostraRotazione(presenti){

const rotazione = colleghi.filter(c=>presenti.includes(c));

let html="<h3>🔁 Rotazione attiva</h3>";

rotazione.forEach(nome=>{
html+=nome+"<br>";
});

document.getElementById("rotazione").innerHTML=html;

}



// ---------------- BLOCCO PULSANTE ----------------

let guidatoreBloccato=false;



// ---------------- CARICA GUIDATORE OGGI ----------------

function caricaGuidatoreOggi(){

const today=getToday();

db.collection("carpool")
.doc(today)
.get()
.then(doc=>{

if(doc.exists){

const data=doc.data();

if(data.driver){

guidatoreBloccato=true;

const driver=data.driver;

const passeggeri=(data.presenti||[]).filter(p=>p!==driver);

document.getElementById("risultato").innerHTML=
`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

mostraRotazione(data.presenti||[]);

}

}

});

}



// ---------------- CALCOLA GUIDATORE ----------------

function calcolaGuidatore(){

if(guidatoreBloccato){

alert("🚗 Guidatore già calcolato");

return;

}

const checkboxes=document.querySelectorAll("input[type=checkbox]:checked");

const presenti=Array.from(checkboxes).map(c=>c.value);

if(presenti.length===0){

document.getElementById("risultato").innerHTML="Seleziona almeno un collega";

return;

}

mostraRotazione(presenti);

db.collection("carpool")
.orderBy("timestamp","desc")
.limit(1)
.get()
.then(snapshot=>{

let ultimoDriver=null;
let presentiIeri=null;

if(!snapshot.empty){

snapshot.forEach(d=>{

ultimoDriver=d.data().driver || null;
presentiIeri=d.data().presenti || null;

});

}

const driver=trovaProssimoGuidatore(
ultimoDriver,
presenti,
presentiIeri
);

if(!driver){

document.getElementById("risultato").innerHTML="Nessun guidatore";

return;

}

const today=getToday();

db.collection("carpool").doc(today).set({

driver:driver,
presenti:presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp()

});

guidatoreBloccato=true;

const passeggeri=presenti.filter(p=>p!==driver);

document.getElementById("risultato").innerHTML=
`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

renderStorico();

});

}



// ---------------- SIMULA DOMANI ----------------

function simulaDomani(){

const checkboxes=document.querySelectorAll("input[type=checkbox]:checked");

const presenti=Array.from(checkboxes).map(c=>c.value);

if(presenti.length===0){

document.getElementById("risultato").innerHTML="Seleziona almeno un collega";

return;

}

mostraRotazione(presenti);

db.collection("carpool")
.orderBy("timestamp","desc")
.limit(1)
.get()
.then(snapshot=>{

let ultimoDriver=null;
let presentiIeri=null;

if(!snapshot.empty){

snapshot.forEach(d=>{

ultimoDriver=d.data().driver || null;
presentiIeri=d.data().presenti || null;

});

}

const driver=trovaProssimoGuidatore(
ultimoDriver,
presenti,
presentiIeri
);

const passeggeri=presenti.filter(p=>p!==driver);

document.getElementById("risultato").innerHTML=
`🔮 Domani guiderebbe: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

});

}



// ---------------- OGGI NON VENGO ----------------

function oggiNonVengo(){

const today=getToday();

const checkboxes=document.querySelectorAll("input[type=checkbox]:checked");

const presenti=Array.from(checkboxes).map(c=>c.value);

db.collection("carpool").doc(today).set({

driver:null,
presenti:presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp()

});

guidatoreBloccato=false;

document.getElementById("risultato").innerHTML=
"❌ Presenze aggiornate. Puoi ricalcolare il guidatore.";

mostraRotazione(presenti);

renderStorico();

}



// ---------------- STORICO ----------------

function renderStorico(){

const calendario=document.getElementById("calendario");

calendario.innerHTML="Caricamento...";

db.collection("carpool")
.orderBy("timestamp","desc")
.limit(90)
.get()
.then(snapshot=>{

calendario.innerHTML="";

let meseCorrente="";

snapshot.forEach(doc=>{

const data=doc.id;
const info=doc.data();

const dataObj=new Date(data);

const mese=dataObj.toLocaleDateString('it-IT',{
month:'long',
year:'numeric'
});

const giorno=dataObj.toLocaleDateString('it-IT',{
weekday:'short',
day:'numeric'
});

if(mese!==meseCorrente){

meseCorrente=mese;

calendario.innerHTML+=`<h3>${mese.toUpperCase()}</h3>`;

}

const driver=info.driver || "—";

let passeggeri=[];

if(info.presenti){

passeggeri=info.presenti.filter(p=>p!==driver);

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



// ---------------- AVVIO APP ----------------

renderStorico();

caricaGuidatoreOggi();



// ---------------- SERVICE WORKER ----------------

if("serviceWorker" in navigator){

navigator.serviceWorker.register("service-worker.js");

}
