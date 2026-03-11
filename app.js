alert("JS caricato");

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyDTCYs2tS8wKzMDVW4BgBAD0SkmswfLmgI",
  authDomain: "carpool-app-3e8d5.firebaseapp.com",
  projectId: "carpool-app-3e8d5",
  storageBucket: "carpool-app-3e8d5.firebasestorage.app",
  messagingSenderId: "462538199019",
  appId: "1:462538199019:web:9e8127f6ad1642d53393ae"
};

// avvio firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();


// --- COLLEGHI ---
const colleghi = ["Marco","Luca","Anna","Paolo","Giulia"];
let ultimoDriver = null;


// data di oggi
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
    } else {
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

      renderCalendario();

    } else {

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

  renderCalendario();

}


// --- CALENDARIO DAL DATABASE ---
function renderCalendario(){

  const calendario = document.getElementById("calendario");
  calendario.innerHTML = "Caricamento...";

  db.collection("carpool")
  .orderBy("timestamp","desc")
  .limit(14)
  .get()
  .then(snapshot => {

    calendario.innerHTML = "";

    snapshot.forEach(doc => {

      const data = doc.id;
      const info = doc.data();

      const giorno = new Date(data).toLocaleDateString('it-IT',{
        weekday:'short',
        day:'numeric',
        month:'numeric'
      });

      calendario.innerHTML +=
      <b>${giorno}</b> - Guidatore: ${info.driver || "—"} <br>;

    });

  });

}


// aggiornamento realtime
db.collection("carpool")
.doc(getToday())
.onSnapshot(doc => {

  if(doc.exists){

    const data = doc.data();

    document.getElementById("risultato").innerHTML =
    "🚗 Guidatore di oggi: " + (data.driver || "—");

  }

});


// primo caricamento calendario
renderCalendario();


// SERVICE WORKER
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
