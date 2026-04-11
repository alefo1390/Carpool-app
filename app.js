console.log("🚀 APP CARICATA");

window.addEventListener("load", init);

function init(){

  if (!window.firebase) {
    alert("Firebase non caricato");
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.db = firebase.firestore();

  console.log("🔥 Firebase OK");

  renderStorico();
}


// =====================
// DATA
// =====================
function getToday(){
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
}


// =====================
// SIGLE
// =====================
const sigle = {
  Alessio:"A",
  Sebastiano:"S",
  Andrea:"AN",
  Francesca:"F",
  Rosario:"R"
};


// =====================
// ROTAZIONI
// =====================
const rotazioni = {
  "A":["Alessio"],
  "S":["Sebastiano"],
  "AN":["Andrea"],
  "F":["Francesca"],
  "R":["Rosario"]
};


// =====================
// TROVA ROTAZIONE
// =====================
function trovaRotazione(presenti){

  const siglePresenti = presenti.map(n => sigle[n]).sort();
  const chiave = siglePresenti.join("-");

  return {
    chiave,
    sequenza: rotazioni[chiave] || null
  };
}


// =====================
// CALCOLA GUIDATORE
// =====================
function calcolaGuidatore(){

  const presenti = Array.from(document.querySelectorAll("input:checked"))
    .map(c => c.value);

  if(presenti.length === 0){
    alert("Seleziona almeno una persona");
    return;
  }

  const commento = document.getElementById("commento").value || "";

  const {chiave, sequenza} = trovaRotazione(presenti);

  if(!sequenza){
    alert("Rotazione non trovata: " + chiave);
    return;
  }

  const today = getToday();

  db.collection("carpool").doc(today).get().then(doc => {

    if(doc.exists){
      alert("Già calcolato oggi");
      return;
    }

    const driver = sequenza[0];
    const passeggeri = presenti.filter(p => p !== driver);

    db.collection("carpool").doc(today).set({
      driver,
      presenti,
      commento,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("risultato").innerHTML =
      `🚗 ${driver}<br>👥 ${passeggeri.join(", ")}`;

    mostraRotazione(sequenza);
    renderStorico();

  });
}


// =====================
// SIMULA DOMANI
// =====================
function simulaDomani(){
  alert("Simulazione OK");
}


// =====================
// OGGI NON VENGO
// =====================
function oggiNonVengo(){
  alert("Funzione OK");
}


// =====================
// ROTAZIONE VISIVA
// =====================
function mostraRotazione(rotazione){

  document.getElementById("rotazione").innerHTML =
    "<h3>🔁 Rotazione</h3>" +
    rotazione.join("<br>");
}


// =====================
// STORICO
// =====================
function formatDate(d){
  const p = d.split("-");
  return p[2] + "-" + p[1] + "-" + p[0];
}

function renderStorico(){

  const db = window.db;
  if(!db) return;

  const calendario = document.getElementById("calendario");

  db.collection("carpool")
    .orderBy("timestamp","desc")
    .limit(30)
    .get()
    .then(snapshot => {

      calendario.innerHTML = "";

      snapshot.forEach(doc => {

        const data = doc.id;
        const info = doc.data();

        const driver = info.driver || "—";
        const passeggeri = (info.presenti || []).filter(p => p !== driver);

        calendario.innerHTML += `
          <div>
            <b>${formatDate(data)}</b><br>
            🚗 ${driver}<br>
            👥 ${passeggeri.join(", ")}
          </div>
        `;
      });

    });
}
