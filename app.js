// =====================
// BOOT CHECK
// =====================
console.log("🚀 APP JS CARICATO");
alert("APP AVVIATA");

// =====================
// FIREBASE CHECK
// =====================
if (!firebase || !firebase.firestore) {
  alert("❌ Firebase NON caricato correttamente");
  throw new Error("Firebase missing");
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

console.log("🔥 Firebase inizializzato");


// =====================
// TEST FIRESTORE
// =====================
db.collection("carpool").limit(1).get()
  .then(() => {
    console.log("✅ FIRESTORE OK");
  })
  .catch(err => {
    console.error("❌ FIRESTORE ERRORE:", err);
    alert("FIRESTORE ERRORE: " + err.message);
  });


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
// ROTAZIONI (SAFE)
// =====================
const rotazioni = {
  "A":["Alessio"],
  "S":["Sebastiano"],
  "AN":["Andrea"],
  "F":["Francesca"],
  "R":["Rosario"]
};


// =====================
// TROVA ROTAZIONE (DEBUG)
// =====================
function trovaRotazione(presenti){

  const siglePresenti = presenti.map(n => sigle[n]).sort();
  const chiave = siglePresenti.join("-");

  console.log("🔎 chiave generata:", chiave);

  const sequenza = rotazioni[chiave];

  if(!sequenza){
    console.warn("⚠️ Rotazione NON trovata:", chiave);
  }

  return {chiave, sequenza};
}


// =====================
// TEST UI
// =====================
function testUI(){
  document.getElementById("risultato").innerHTML = "✅ JS OK";
}


// =====================
// CALCOLA GUIDATORE (MINIMO TEST)
// =====================
function calcolaGuidatore(){

  console.log("👉 click calcolaGuidatore");

  const presenti = Array.from(document.querySelectorAll("input:checked"))
    .map(c => c.value);

  console.log("presenti:", presenti);

  if(presenti.length === 0){
    alert("Seleziona almeno una persona");
    return;
  }

  const {chiave, sequenza} = trovaRotazione(presenti);

  if(!sequenza){
    alert("ROTAZIONE MANCANTE: " + chiave);
    return;
  }

  const driver = sequenza[0];

  document.getElementById("risultato").innerHTML =
    "🚗 Driver TEST: " + driver;

  console.log("✅ driver:", driver);
}


// =====================
// SIMULA DOMANI (TEST)
// =====================
function simulaDomani(){
  alert("SIMULA OK");
}


// =====================
// OGGI NON VENGO (TEST)
// =====================
function oggiNonVengo(){
  alert("NON VENGO OK");
}


// =====================
// AVVIO
// =====================
testUI();
console.log("✅ APP READY");
