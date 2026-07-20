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
const sigle = {
  Alessio: "A",
  Sebastiano: "S",
  Andrea: "AN",
  Francesca: "F",
  Rosario: "R",
  Vincenzo: "V"
};

const ordineSigle = ["A", "S", "AN", "F", "R", "V"];

// ROTAZIONI
const rotazioni = {
  // Singoli
  "A": ["Alessio"],
  "S": ["Sebastiano"],
  "AN": ["Andrea"],
  "F": ["Francesca"],
  "R": ["Rosario"],
  "V": ["Vincenzo"],

  // Coppie
  "A-S": ["Sebastiano", "Alessio"],
  "A-AN": ["Alessio", "Andrea"],
  "A-F": ["Francesca", "Alessio"],
  "A-R": ["Rosario", "Alessio"],
  "S-AN": ["Andrea", "Sebastiano"],
  "S-F": ["Francesca", "Sebastiano"],
  "S-R": ["Rosario", "Sebastiano"],
  "AN-F": ["Francesca", "Andrea"],
  "AN-R": ["Andrea", "Rosario"],
  "F-R": ["Francesca", "Rosario"],
  "A-V": ["Vincenzo", "Alessio"],
  "S-V": ["Vincenzo", "Sebastiano"],
  "AN-V": ["Vincenzo", "Andrea"],
  "F-V": ["Vincenzo", "Francesca"],
  "R-V": ["Vincenzo", "Rosario"],

  // Trii
  "A-S-AN": ["Sebastiano", "Andrea", "Alessio"],
  "A-S-F": ["Francesca", "Sebastiano", "Alessio"],
  "A-S-R": ["Sebastiano", "Rosario", "Alessio"],
  "A-AN-F": ["Andrea", "Francesca", "Alessio"],
  "A-AN-R": ["Alessio", "Andrea", "Rosario"],
  "A-F-R": ["Rosario", "Alessio", "Francesca"],
  "S-AN-F": ["Andrea", "Sebastiano", "Francesca"],
  "S-AN-R": ["Sebastiano", "Rosario", "Andrea"],
  "S-F-R": ["Sebastiano", "Rosario", "Francesca"],
  "AN-F-R": ["Andrea", "Francesca", "Rosario"],
  "A-S-V": ["Sebastiano", "Vincenzo", "Alessio"],
  "A-AN-V": ["Andrea", "Vincenzo", "Alessio"],
  "A-F-V": ["Francesca", "Vincenzo", "Alessio"],
  "A-R-V": ["Rosario", "Vincenzo", "Alessio"],
  "S-AN-V": ["Andrea", "Vincenzo", "Sebastiano"],
  "S-F-V": ["Francesca", "Vincenzo", "Sebastiano"],
  "S-R-V": ["Rosario", "Vincenzo", "Sebastiano"],
  "AN-F-V": ["Andrea", "Francesca", "Vincenzo"],
  "AN-R-V": ["Andrea", "Rosario", "Vincenzo"],
  "F-R-V": ["Francesca", "Rosario", "Vincenzo"],

  // Quartetti
  "A-S-AN-F": ["Sebastiano", "Francesca", "Alessio", "Andrea"],
  "A-S-AN-R": ["Sebastiano", "Alessio", "Andrea", "Rosario"],
  "A-S-F-R": ["Alessio", "Sebastiano", "Francesca", "Rosario"],
  "A-AN-F-R": ["Andrea", "Francesca", "Rosario", "Alessio"],
  "S-AN-F-R": ["Francesca", "Andrea", "Rosario", "Sebastiano"],
  "A-S-AN-V": ["Alessio", "Andrea", "Vincenzo", "Sebastiano"],
  "A-S-F-V": ["Sebastiano", "Francesca", "Vincenzo", "Alessio"],
  "A-S-R-V": ["Sebastiano", "Rosario", "Vincenzo", "Alessio"],
  "A-AN-F-V": ["Andrea", "Francesca", "Vincenzo", "Alessio"],
  "A-AN-R-V": ["Andrea", "Rosario", "Vincenzo", "Alessio"],
  "A-F-R-V": ["Francesca", "Rosario", "Vincenzo", "Alessio"],
  "S-AN-F-V": ["Andrea", "Francesca", "Vincenzo", "Sebastiano"],
  "S-AN-R-V": ["Andrea", "Rosario", "Vincenzo", "Sebastiano"],
  "S-F-R-V": ["Francesca", "Rosario", "Vincenzo", "Sebastiano"],
  "AN-F-R-V": ["Andrea", "Francesca", "Rosario", "Vincenzo"],

  // Quintetti
  "A-S-AN-F-R": ["Francesca", "Andrea", "Rosario", "Alessio", "Sebastiano"],
  "A-S-AN-F-V": ["Vincenzo", "Andrea", "Sebastiano", "Francesca", "Alessio"],
  "A-S-AN-R-V": ["Vincenzo", "Rosario", "Sebastiano", "Alessio", "Andrea"],
  "A-S-F-R-V": ["Sebastiano", "Francesca", "Rosario", "Vincenzo", "Alessio"],
  "A-AN-F-R-V": ["Andrea", "Francesca", "Rosario", "Vincenzo", "Alessio"],
  "S-AN-F-R-V": ["Andrea", "Francesca", "Rosario", "Vincenzo", "Sebastiano"],

  // Gruppo completo (6 persone)
  "A-S-AN-F-R-V": ["Francesca", "Andrea", "Rosario", "Vincenzo", "Alessio", "Sebastiano"]
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

// DASHBOARD (NUOVA VERSIONE)
async function apriDashboard() {
  const popup = document.getElementById("dashboardPopup");
  popup.style.display = "flex";

  popup.innerHTML = `
    <div class="popup-content dashboard-modal">
      <div class="dashboard-header">
        <h2>📊 Dashboard Rotazioni</h2>
        <button class="btn-close-icon" onclick="chiudiDashboard()">✕</button>
      </div>
      <div id="dashboardList" class="dashboard-list">
        <p class="loading-text">Caricamento rotazioni...</p>
      </div>
      <div class="dashboard-footer">
        <button class="btn-secondary" onclick="chiudiDashboard()">Chiudi</button>
      </div>
    </div>
  `;

  const chiavi = Object.keys(rotazioni);

  try {
    const docs = await Promise.all(
      chiavi.map(chiave => db.collection("rotazioni").doc(chiave).get())
    );

    let listHtml = "";

    chiavi.forEach((chiave, i) => {
      const doc = docs[i];
      const sequenza = rotazioni[chiave];
      let index = 0;
      let ultimo = "—";
      let prossimo = sequenza[0];

      if (doc && doc.exists) {
        index = doc.data().index || 0;
        prossimo = sequenza[index];
        ultimo = (index === 0) 
          ? sequenza[sequenza.length - 1] 
          : sequenza[index - 1];
      }

      listHtml += `
        <div class="rotation-card">
          <div class="rotation-badge">${chiave}</div>
          <div class="rotation-details">
            <div class="driver-box driver-prev">
              <span class="driver-label">Ultimo ⏪</span>
              <span class="driver-name">${ultimo}</span>
            </div>
            
            <div class="driver-box driver-next">
              <span class="driver-label">Prossimo 🚗</span>
              <span class="driver-name">${prossimo}</span>
            </div>
          </div>
        </div>
      `;
    });

    document.getElementById("dashboardList").innerHTML = listHtml;
  } catch (error) {
    console.error("Errore nel caricamento della dashboard:", error);
    document.getElementById("dashboardList").innerHTML = `<p class="error-text">Errore nel caricamento dei dati.</p>`;
  }
}

function chiudiDashboard() {
  document.getElementById("dashboardPopup").style.display = "none";
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

renderStorico();
