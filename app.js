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
return new Date().toISOString().split("T")[0];
}


// SIGLE
const sigle = {
"Alessio":"A",
"Sebastiano":"S",
"Andrea":"AN",
"Francesca":"F",
"Rosario":"R"
};

const ordineSigle = ["A","S","AN","F","R"];


// ROTAZIONI
const rotazioni = {

"A":["Alessio"],
"S":["Sebastiano"],
"AN":["Andrea"],
"F":["Francesca"],
"R":["Rosario"],

"A-S":["Sebastiano","Alessio"],
"A-AN":["Alessio","Andrea"],
"A-F":["Francesca","Alessio"],
"A-R":["Rosario","Alessio"],

"S-AN":["Andrea","Sebastiano"],
"S-F":["Francesca","Sebastiano"],
"S-R":["Rosario","Sebastiano"],

"AN-F":["Francesca","Andrea"],
"AN-R":["Andrea","Rosario"],
"F-R":["Francesca","Rosario"],

"A-S-AN":["Sebastiano","Andrea","Alessio"],
"A-S-F":["Francesca","Sebastiano","Alessio"],
"A-S-R":["Sebastiano","Rosario","Alessio"],

"A-AN-F":["Andrea","Francesca","Alessio"],
"A-AN-R":["Alessio","Andrea","Rosario"],
"A-F-R":["Rosario","Alessio","Francesca"],

"S-AN-F":["Andrea","Sebastiano","Francesca"],
"S-AN-R":["Sebastiano","Rosario","Andrea"],
"S-F-R":["Sebastiano","Rosario","Francesca"],

"AN-F-R":["Andrea","Francesca","Rosario"],

"A-S-AN-F":["Sebastiano","Francesca","Alessio","Andrea"],
"A-S-AN-R":["Rosario","Sebastiano","Alessio","Andrea"],
"A-S-F-R":["Alessio","Sebastiano","Francesca","Rosario"],
"A-AN-F-R":["Andrea","Francesca","Rosario","Alessio"],
"S-AN-F-R":["Francesca","Andrea","Rosario","Sebastiano"],

"A-S-AN-F-R":["Francesca","Andrea","Rosario","Alessio","Sebastiano"]

};


// TROVA ROTAZIONE
function trovaRotazione(presenti){

const siglePresenti = presenti.map(n => sigle[n]);

const chiave = ordineSigle
.filter(s => siglePresenti.includes(s))
.join("-");

return {
chiave:chiave,
sequenza:rotazioni[chiave] || presenti
};

}


// CALCOLA GUIDATORE
function calcolaGuidatore(){

const today = getToday();

db.collection("carpool").doc(today).get().then(doc=>{

if(doc.exists && doc.data().driver){
alert("🚗 Guidatore già calcolato per oggi");
return;
}

const presenti =
Array.from(document.querySelectorAll("input[type=checkbox]:checked"))
.map(c=>c.value);

if(presenti.length===0){
document.getElementById("risultato").innerHTML="Seleziona almeno un collega";
return;
}

const {chiave,sequenza} = trovaRotazione(presenti);

db.collection("rotazioni").doc(chiave).get().then(rdoc=>{

let index = rdoc.exists ? rdoc.data().index || 0 : 0;

const driver = sequenza[index];

const passeggeri = presenti.filter(p=>p!==driver);

const nextIndex = (index+1)%sequenza.length;

db.collection("rotazioni").doc(chiave).set({index:nextIndex});

db.collection("carpool").doc(today).set({

driver:driver,
presenti:presenti,
rotazione:chiave,
timestamp:firebase.firestore.FieldValue.serverTimestamp()

});

document.getElementById("risultato").innerHTML =
`🚗 Guidatore di oggi: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

document.querySelector("button[onclick='calcolaGuidatore()']").disabled=true;

mostraRotazione(sequenza);

renderStorico();

});

});

}


// MOSTRA ROTAZIONE ATTIVA
function mostraRotazione(rotazione){

let html="<h3>🔁 Rotazione attiva</h3>";

rotazione.forEach(nome=>{
html+=nome+"<br>";
});

document.getElementById("rotazione").innerHTML=html;

}


// TASTO ROTAZIONI
function mostraTutteRotazioni(){

const container=document.getElementById("rotazioniComplete");

container.innerHTML="Caricamento...";

db.collection("rotazioni").get().then(snapshot=>{

container.innerHTML="";

snapshot.forEach(doc=>{

const chiave=doc.id;
const index=doc.data().index || 0;

const sequenza=rotazioni[chiave];

if(!sequenza) return;

let html="<div style='margin-bottom:15px'>";

html+="<b>"+chiave+"</b><br>";

sequenza.forEach((nome,i)=>{

let icona="";

if(i===index-1) icona=" 🚗";

if(index===0 && i===sequenza.length-1) icona=" 🚗";

html+=nome+icona+"<br>";

});

html+="</div>";

container.innerHTML+=html;

});

});

}


// OGGI NON VENGO
function oggiNonVengo(){

const today=getToday();

db.collection("carpool").doc(today).get().then(doc=>{

if(!doc.exists) return;

const presenti=doc.data().presenti;

const {chiave,sequenza}=trovaRotazione(presenti);

db.collection("rotazioni").doc(chiave).get().then(rdoc=>{

let index=rdoc.exists ? rdoc.data().index || 0 : 0;

index--;

if(index<0) index=sequenza.length-1;

db.collection("rotazioni").doc(chiave).set({index:index});

db.collection("carpool").doc(today).delete();

document.querySelector("button[onclick='calcolaGuidatore()']").disabled=false;

document.getElementById("risultato").innerHTML="❌ Viaggio annullato";

renderStorico();

});

});

}


// STORICO
function renderStorico(){

const calendario=document.getElementById("calendario");

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

const giorno=new Date(data).toLocaleDateString('it-IT',{
weekday:'short',
day:'numeric',
month:'numeric'
});

const driver=info.driver || "—";

let passeggeri=[];

if(info.presenti){
passeggeri=info.presenti.filter(p=>p!==driver);
}

calendario.innerHTML+=
`<div style="margin-bottom:10px">
<b>${giorno}</b> — 🚗 ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ") || "—"}
</div>`;

});

});

}


// BLOCCO GUIDATORE
db.collection("carpool")
.doc(getToday())
.get()
.then(doc=>{

if(doc.exists && doc.data().driver){
document.querySelector("button[onclick='calcolaGuidatore()']").disabled=true;
}

});


renderStorico();


// SERVICE WORKER
if("serviceWorker" in navigator){
navigator.serviceWorker.register("service-worker.js");
}
