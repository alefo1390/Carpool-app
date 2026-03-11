// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey:"AIzaSyDTCYs2tS8wKzMDVW4BgBAD0SkmswfLmgI",
  authDomain: "carpool-app-3e8d5.firebaseapp.com",
  projectId: "carpool-app-3e8d5",
  storageBucket: "carpool-app-3e8d5.firebasestorage.app",
  messagingSenderId: "462538199019",
  appId: "1:462538199019:web:9e8127f6ad1642d53393ae"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// --- COLLEGHI ---
const colleghi = [
  "Alessio",
  "Sebastiano",
  "Andrea",
  "Francesca",
  "Rosario"
];

let ultimoDriver = null;


// --- DATA OGGI ---
function getToday(){
  return new Date().toISOString().split("T")[0];
}


// --- CALCOLO GUIDATORE ---
function calcolaGuidatore(){

  const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
  const presenti = Array.from(checkboxes).map(c => c.value);

  if(presenti.length === 0){

    document.getElementById("risultato").innerHTML =
    "Seleziona almeno un collega";

    return;
  }

  db.collection("carpool")
  .orderBy("timestamp","desc")
  .limit(1)
  .get()

  .then(snapshot => {

    if(!snapshot.empty){

      snapshot.forEach(doc => {
        ultimoDriver = doc.data().driver || null;
      });

    }else{

      ultimoDriver = null;

    }

    let index = ultimoDriver ? colleghi.indexOf(ultimoDriver) : -1;
    let driver = null;

    for(let i=1;i<=colleghi.length;i++){

      let prossimo = colleghi[(index+i)%colleghi.length];

      if(presenti.includes(prossimo)){
        driver = prossimo;
        break;
      }

    }

    if(driver){

      const today = getToday();

      db.collection("carpool").doc(today).set({

        driver: driver,
        presenti: presenti,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()

      });

      document.getElementById("risultato").innerHTML =
      "🚗 Guidatore di oggi: " + driver;

      renderStorico();

    }else{

      document.getElementById("risultato").innerHTML =
      "Nessun guidatore disponibile";

    }

  });

}


// --- SIMULA DOMANI ---
function simulaDomani(){

  const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
  const presenti = Array.from(checkboxes).map(c => c.value);

  if(presenti.length === 0){

    document.getElementById("risultato").innerHTML =
    "Seleziona almeno un collega";

    return;
  }

  db.collection("carpool")
  .orderBy("timestamp","desc")
  .limit(1)
  .get()

  .then(snapshot => {

    let ultimoDriver = null;

    if(!snapshot.empty){
      snapshot.forEach(doc => {
        ultimoDriver = doc.data().driver || null;
      });
    }

    let index = ultimoDriver ? colleghi.indexOf(ultimoDriver) : -1;
    let driver = null;

    for(let i=1;i<=colleghi.length;i++){

      let prossimo = colleghi[(index+i)%colleghi.length];

      if(presenti.includes(prossimo)){
        driver = prossimo;
        break;
      }

    }

    if(driver){

      const passeggeri = presenti.filter(nome => nome !== driver);

      document.getElementById("risultato").innerHTML =
      `🔮 Domani guiderebbe: ${driver}<br>
      👥 Passeggeri: ${passeggeri.join(", ")}`;

    }else{

      document.getElementById("risultato").innerHTML =
      "Nessun guidatore disponibile";

    }

  });

}


// --- OGGI NON VENGO ---
function oggiNonVengo(){

  const today = getToday();

  db.collection("carpool").doc(today).set({

    driver: null,
    presenti: [],
    timestamp: firebase.firestore.FieldValue.serverTimestamp()

  });

  document.getElementById("risultato").innerHTML =
  "❌ Oggi non vieni";

  renderStorico();

}


// --- STORICO 90 GIORNI CON PASSEGGERI ---
function renderStorico(){

  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "Caricamento...";

  db.collection("carpool")
  .orderBy("timestamp","desc")
  .limit(90)
  .get()

  .then(snapshot => {

    calendario.innerHTML = "";

    let meseCorrente = "";

    snapshot.forEach(doc => {

      const data = doc.id;
      const info = doc.data();

      const dataObj = new Date(data);

      const mese = dataObj.toLocaleDateString('it-IT',{
        month:'long',
        year:'numeric'
      });

      const giorno = dataObj.toLocaleDateString('it-IT',{
        weekday:'short',
        day:'numeric'
      });

      if(mese !== meseCorrente){

        meseCorrente = mese;

        calendario.innerHTML += `<h3>${mese.toUpperCase()}</h3>`;

      }

      const driver = info.driver || "Nessun guidatore";

      let passeggeri = [];

      if(info.presenti){
        passeggeri = info.presenti.filter(nome => nome !== driver);
      }

      calendario.innerHTML += `
      <div style="margin-bottom:10px">
        <b>${giorno}</b> — 🚗 ${driver}<br>
        👥 Passeggeri: ${passeggeri.length ? passeggeri.join(", ") : "—"}
      </div>
      `;

    });

  });

}


// --- AGGIORNAMENTO TEMPO REALE ---
db.collection("carpool")
.doc(getToday())
.onSnapshot(doc => {

  if(doc.exists){

    const data = doc.data();

    document.getElementById("risultato").innerHTML =
    "🚗 Guidatore di oggi: " + (data.driver || "—");

  }

});


// primo caricamento
renderStorico();


// --- SERVICE WORKER ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}
