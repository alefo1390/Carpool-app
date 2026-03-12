const firebaseConfig = {

apiKey:"AIzaSyDTCYs2tS8wKzMDVW4BgBAD0SkmswfLmgI",
authDomain:"carpool-app-3e8d5.firebaseapp.com",
projectId:"carpool-app-3e8d5"

};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();



function getToday(){

const d = new Date();

const year = d.getFullYear();
const month = String(d.getMonth()+1).padStart(2,"0");
const day = String(d.getDate()).padStart(2,"0");

return `${year}-${month}-${day}`;

}



const sigle={

"Alessio":"A",
"Sebastiano":"S",
"Andrea":"AN",
"Francesca":"F",
"Rosario":"R"

};



const rotazioni={

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



function trovaRotazione(presenti){

const chiave=

presenti.map(n=>sigle[n])
.sort()
.join("-");

return rotazioni[chiave] || presenti;

}



function prossimoGuidatore(rotazione,precedente){

if(!precedente) return rotazione[0];

const index=rotazione.indexOf(precedente);

return rotazione[(index+1)%rotazione.length];

}



function calcolaGuidatore(){

const today=getToday();

db.collection("carpool").doc(today).get().then(doc=>{

if(doc.exists){

alert("Guidatore già calcolato");

return;

}

const presenti=[...document.querySelectorAll("input:checked")]
.map(c=>c.value);

if(presenti.length===0) return;

const rotazione=trovaRotazione(presenti);

db.collection("carpool")
.orderBy("timestamp","desc")
.limit(1)
.get()
.then(s=>{

let precedente=null;

s.forEach(d=>precedente=d.data().driver);

const driver=prossimoGuidatore(rotazione,precedente);

const passeggeri=presenti.filter(p=>p!==driver);

db.collection("carpool").doc(today).set({

driver,
presenti,
timestamp:firebase.firestore.FieldValue.serverTimestamp()

});

document.getElementById("risultato").innerHTML=

`🚗 Guidatore: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

mostraRotazione(rotazione);

renderStorico();

});

});

}



function simulaDomani(){

const presenti=[...document.querySelectorAll("input:checked")]
.map(c=>c.value);

const rotazione=trovaRotazione(presenti);

db.collection("carpool")
.orderBy("timestamp","desc")
.limit(1)
.get()
.then(s=>{

let precedente=null;

s.forEach(d=>precedente=d.data().driver);

const driver=prossimoGuidatore(rotazione,precedente);

const passeggeri=presenti.filter(p=>p!==driver);

document.getElementById("risultato").innerHTML=

`🔮 Domani guiderebbe: ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}`;

});

}



function mostraRotazione(rotazione){

let html="<h3>🔁 Rotazione attiva</h3>";

rotazione.forEach(n=>{

html+=n+"<br>";

});

document.getElementById("rotazione").innerHTML=html;

}



function oggiNonVengo(){

const today=getToday();

db.collection("carpool").doc(today).delete();

document.getElementById("risultato").innerHTML="Viaggio annullato";

renderStorico();

}



function renderStorico(){

const calendario=document.getElementById("calendario");

calendario.innerHTML="Caricamento...";

db.collection("carpool")
.orderBy("timestamp","desc")
.limit(30)
.get()
.then(snapshot=>{

calendario.innerHTML="";

snapshot.forEach(doc=>{

const data=doc.id;

const info=doc.data();

const driver=info.driver;

const passeggeri=info.presenti.filter(p=>p!==driver);

calendario.innerHTML+=`

<b>${data}</b> — 🚗 ${driver}<br>
👥 Passeggeri: ${passeggeri.join(", ")}

<br><br>

`;

});

});

}



/* DASHBOARD */

function apriDashboard(){

const popup=document.getElementById("dashboardPopup");

popup.style.display="flex";

let html="";

Object.keys(rotazioni).forEach(r=>{

html+=`<b>${r}</b><br>${rotazioni[r].join(" → ")}<br><br>`;

});

document.getElementById("dashboardContent").innerHTML=html;

}



function chiudiDashboard(){

document.getElementById("dashboardPopup").style.display="none";

}



renderStorico();
