// =====================
// BOOT DIAGNOSTICO SICURO
// =====================
console.log("🚀 APP JS CARICATO");

window.addEventListener("load", () => {
  initApp();
});

function initApp(){

  try {

    if (!window.firebase) {
      alert("❌ Firebase non caricato (script mancante o cache)");
      return;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();

    console.log("🔥 Firebase OK");

    // test rapido connessione
    db.collection("carpool").limit(1).get()
      .then(() => console.log("✅ Firestore OK"))
      .catch(err => {
        console.error("❌ Firestore errore:", err);
        alert("Errore Firestore: " + err.message);
      });

    // esponiamo db globalmente (IMPORTANTE)
    window.db = db;

    testUI();

  } catch (e) {
    console.error("💥 ERRORE INIT:", e);
    alert("Errore inizializzazione: " + e.message);
  }
}


// =====================
// TEST UI
// =====================
function testUI(){
  const r = document.getElementById("risultato");
  if (r) r.innerHTML = "✅ APP OK";
}


// =====================
// DATA OGGI
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
// ROTAZIONI (MINIMA SICURA BASE)
// =====================
const rotazioni = {
  "A":["Alessio"],
  "S":["Sebastiano"],
  "AN":["Andrea"],
  "F":["Francesca"],
  "R":["Rosario"]
};


// =====================
// TROVA ROTAZIONE (ROBUSTA)
// =====================
function trovaRotazione(presenti){

  const siglePresenti = presenti
    .map(n => sigle[n])
    .filter(Boolean)
    .sort();

  const chiave = siglePresenti.join("-");

  const sequenza = rotazioni[chiave] || null;

  console.log("🔎 chiave:", chiave);

  return { chiave, sequenza };
}


// =====================
// CALCOLA GUIDATORE
// =====================
function calcolaGuidatore(){

  const db = window.db;
  if (!db) return alert("DB non inizializzato");

  const today = getToday();

  const presenti = Array.from(document.querySelectorAll("input:checked"))
    .map(c => c.value);

  if (presenti.length === 0) {
    alert("Seleziona almeno una persona");
    return;
  }

  const commentoEl = document.getElementById("commento");
  const commento = commentoEl ? commentoEl.value : "";

  const {chiave, sequenza} = trovaRotazione(presenti);

  if (!sequenza) {
    alert("Rotazione mancante: " + chiave);
    return;
  }

  db.collection("carpool").doc(today).get().then(doc => {

    if (doc.exists) {
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

    document.getElementById("commento").value = "";

    document.getElementById("risultato").innerHTML =
      `🚗 Guidatore: ${driver}<br>👥 Passeggeri: ${passeggeri.join(", ")}`;

    mostraRotazione(sequenza);
    renderStorico();

  });

}


// =====================
// SIMULA DOMANI
// =====================
function simulaDomani(){
  alert("Simulazione OK (versione base)");
}


// =====================
// OGGI NON VENGO
// =====================
function oggiNonVengo(){
  alert("Funzione OK (base)");
}


// =====================
// ROTAZIONE VISIVA
// =====================
function mostraRotazione(rotazione){

  const el = document.getElementById("rotazione");
  if (!el) return;

  el.innerHTML = "<h3>🔁 Rotazione</h3>" +
    rotazione.map(n => n).join("<br>");
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
  if (!db) return;

  const calendario = document.getElementById("calendario");
  if (!calendario) return;

  db.collection("carpool")
    .orderBy("timestamp","desc")
    .limit(30)
    .get()
    .then(snapshot => {

      calendario.innerHTML = "";

      snapshot.forEach(doc => {

        const d = doc.id;
        const info = doc.data();

        const driver = info.driver || "—";
        const passeggeri = (info.presenti || []).filter(p => p !== driver);

        calendario.innerHTML += `
          <div style="margin-bottom:10px">
            <b>${formatDate(d)}</b><br>
            🚗 ${driver}<br>
            👥 ${passeggeri.join(", ")}
          </div>
        `;
      });

    });
}


// =====================
// AVVIO
// =====================
renderStorico();
