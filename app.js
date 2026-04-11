// FIREBASE

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

const d=new Date();
return d.toISOString().split("T")[0];

}


// SIGLE

const sigle={

Alessio:"A",
Sebastiano:"S",
Andrea:"AN",
Francesca:"F",
Rosario:"R"

};

const ordineSigle=["A","S","AN","F","R"];


// ROTAZIONI

const rotazioni={

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
"A-S-AN-R":["Sebastiano","Alessio","Andrea","Rosario"],
"A-S-F-R":["Alessio","Sebastiano","Francesca","Rosario"],
"A-AN-F-R":["Andrea","Francesca","Rosario","Alessio"],
"S-AN-F-R":["Francesca","Andrea","Rosario","Sebastiano"],

"A-S-AN-F-R":["Francesca","Andrea","Rosario","Alessio","Sebastiano"]

};


// TROVA ROTAZIONE

function trovaRotazione(presenti){

const siglePresenti=presenti.map(n=>sigle[n]);

const chiave=ordineSigle
.filter(s=>siglePresenti.includes(s))
.join("-");

return{

chiave:chiave,
sequenza:rotazioni[chiave]

};

}


// CALCOLA GUIDATORE

function calcolaGuidatore(){

const today=getToday();

db.collection("carpool").doc(today).get().then(doc=>{

if(doc.exists){

alert("Guidatore già calcolato");
return;

}

const presenti=
Array.from(document.querySelectorAll("input:checked"))
.map(c=>c.value);

if(presenti.length===0) return;

const {chiave,sequenza}=trovaRotazione(presenti);

db.collection("rotazioni").doc(chiave).get().then(doc=>{

let index=0;

if(doc.exists){

index=doc.data().index||0;

}

const driver=sequenza[index];

const passeggeri=presenti.filter(p=>p!==driver);

const nextIndex=(index+1)%sequenza.length;

db.collection("rotazioni").doc(chiave).set({

index:nextIndex

});

db.collection("carpool").doc(today).set({

driver:driver,
presenti:presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp()

});

document.getElementById("risultato").innerHTML=

`🚗 Guidatore: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

mostraRotazione(sequenza);

renderStorico();

});

});

}


// SIMULA DOMANI

function simulaDomani(){

const presenti=
Array.from(document.querySelectorAll("input:checked"))
.map(c=>c.value);

if(presenti.length===0) return;

const {chiave,sequenza}=trovaRotazione(presenti);

db.collection("rotazioni").doc(chiave).get().then(doc=>{

let index=0;

if(doc.exists){

index=doc.data().index||0;

}

const driver=sequenza[index];

const passeggeri=presenti.filter(p=>p!==driver);

document.getElementById("risultato").innerHTML=

`🔮 Domani guiderebbe: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

});

}


// OGGI NON VENGO

function oggiNonVengo(){

const today=getToday();

db.collection("carpool").doc(today).get().then(doc=>{

if(!doc.exists) return;

const presenti=doc.data().presenti;

const {chiave,sequenza}=trovaRotazione(presenti);

db.collection("rotazioni").doc(chiave).get().then(rotDoc=>{

if(rotDoc.exists){

let index=rotDoc.data().index||0;

let prevIndex=index-1;

if(prevIndex<0){

prevIndex=sequenza.length-1;

}

db.collection("rotazioni").doc(chiave).set({

index:prevIndex

});

}

db.collection("carpool").doc(today).delete();

document.getElementById("risultato").innerHTML="❌ Viaggio cancellato";

renderStorico();

});

});

}


// DASHBOARD

function apriDashboard(){

let html=`

<h2>📊 Dashboard rotazioni</h2>

<table>

<tr>

<th>Rotazione</th>
<th>Ultimo 🚗</th>
<th>Prossimo</th>

</tr>

`;

const chiavi=Object.keys(rotazioni);

let promises=[];

chiavi.forEach(chiave=>{

promises.push(

db.collection("rotazioni").doc(chiave).get().then(doc=>{

const sequenza=rotazioni[chiave];

let index=0;
let ultimo="—";
let prossimo=sequenza[0];

if(doc.exists){

index=doc.data().index||0;

prossimo=sequenza[index];

ultimo=index===0
? sequenza[sequenza.length-1]
: sequenza[index-1];

}

html+=`

<tr>

<td>${chiave}</td>
<td>${ultimo}</td>
<td>${prossimo}</td>

</tr>

`;

})

);

});

Promise.all(promises).then(()=>{

html+=`

</table>

<br>

<button onclick="chiudiDashboard()">Chiudi</button>

`;

const popup=document.getElementById("dashboardPopup");

popup.innerHTML=`<div class="popup-content">${html}</div>`;

popup.style.display="flex";

});

}


function chiudiDashboard(){

document.getElementById("dashboardPopup").style.display="none";

}


// ROTAZIONE VISIVA

function mostraRotazione(rotazione){

let html="<h3>🔁 Rotazione attiva</h3>";

rotazione.forEach(nome=>{

html+=nome+"<br>";

});

document.getElementById("rotazione").innerHTML=html;

}


// STORICO

function formatDate(dateString){

const parts = dateString.split("-");

return parts[2] + "-" + parts[1] + "-" + parts[0];

}

function renderStorico(){

const calendario=document.getElementById("calendario");

db.collection("carpool")

.orderBy("timestamp","desc")

.limit(90)

.get()

.then(snapshot=>{

calendario.innerHTML="";

snapshot.forEach(doc=>{

const data=doc.id;
const info=doc.data();

const driver=info.driver||"—";

const passeggeri=
(info.presenti||[]).filter(p=>p!==driver);

calendario.innerHTML+=`

<div style="margin-bottom:10px">

<b>${formatDate(data)}</b> — 🚗 ${driver}<br>

👥 Passeggeri: ${passeggeri.join(", ")}

</div>

`;

});

});

}


// AVVIO
