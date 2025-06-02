const opciones = ["piedra", "papel", "tijera"];
const imgPaths = {
  "piedra": "img/piedra.jpg",
  "papel": "img/papel.jpg",
  "tijera": "img/tijera.jpg"
};
const handSVGs = {
  piedra: `<svg width="36" height="36" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#0ea5e9"/><text x="50%" y="60%" text-anchor="middle" fill="#fff" font-size="30" font-family="Segoe UI" dy=".3em">✊</text></svg>`,
  papel: `<svg width="36" height="36" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#facc15"/><text x="50%" y="60%" text-anchor="middle" fill="#18181b" font-size="30" font-family="Segoe UI" dy=".3em">🖐</text></svg>`,
  tijera: `<svg width="36" height="36" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#a21caf"/><text x="50%" y="60%" text-anchor="middle" fill="#fff" font-size="30" font-family="Segoe UI" dy=".3em">✌️</text></svg>`
};

let video = document.getElementById("webcam");
let canvas = document.getElementById("snapshot");
let countdownEl = document.getElementById("countdown");
let confetti = document.getElementById("confetti");
let roundSelect = document.getElementById("round-select");
let historyList = document.getElementById("history-list");
let userHandAnim = document.getElementById("user-hand-anim");
let botHandAnim = document.getElementById("bot-hand-anim");
let clickSound = document.getElementById("audio-click");
let winSound = document.getElementById("audio-win");
let loseSound = document.getElementById("audio-lose");
let drawSound = document.getElementById("audio-draw");

let player1Score = 0, player2Score = 0, draws = 0;
let totalRounds = 3;
let currentRound = 1;
let history = [];
let isTwoPlayers = false;
let turn = 1; // 1 = jugador 1, 2 = jugador 2
let player1Move = null;
let player2Move = null;

async function setupWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("No se pudo acceder a la cámara");
  }
}

function getRandomMove() {
  return opciones[Math.floor(Math.random() * opciones.length)];
}
function decidirGanador(j1, j2) {
  if (j1 === j2) return "Empate";
  if (
    (j1 === "piedra" && j2 === "tijera") ||
    (j1 === "papel" && j2 === "piedra") ||
    (j1 === "tijera" && j2 === "papel")
  ) return "Jugador 1";
  return "Jugador 2";
}
// Simula la predicción (reemplazar por modelo real)
function predecirJugada(imgData) {
  return opciones[Math.floor(Math.random() * opciones.length)];
}
function mostrarConfeti() {
  confetti.style.display = "block";
  setTimeout(() => {
    confetti.style.display = "none";
  }, 2000);
}
function playSound(result) {
  if (result === "Jugador 1") winSound.play();
  else if (result === "Jugador 2") loseSound.play();
  else drawSound.play();
}
function actualizarPuntajes() {
  document.getElementById("score-user").textContent = player1Score;
  document.getElementById("score-bot").textContent = player2Score;
  document.getElementById("score-draws").textContent = draws;
  document.getElementById("round-counter").textContent = `${currentRound} / ${totalRounds}`;
}
function actualizarHistorial() {
  historyList.innerHTML = "";
  history.slice(-10).reverse().forEach((h, i) => {
    historyList.innerHTML += `<li>
      <span class="svg-hand">${handSVGs[h.j1]}</span>
      vs
      <span class="svg-hand">${handSVGs[h.j2]}</span>
      — <b>${h.res}</b>
    </li>`;
  });
}
async function capturarFoto() {
  clickSound.currentTime = 0; clickSound.play();
  document.getElementById("result").textContent = "...";
  document.getElementById("user-move").textContent = "...";
  document.getElementById("bot-move").textContent = "...";
  userHandAnim.innerHTML = "";
  botHandAnim.innerHTML = "";
  // Conteo 3, 2, 1...
  for (let i = 3; i > 0; i--) {
    countdownEl.textContent = i;
    await new Promise(res => setTimeout(res, 800));
  }
  countdownEl.textContent = "";

  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  let photoData = canvas.toDataURL("image/png");
  if (isTwoPlayers) {
    if (turn === 1) {
      player1Move = predecirJugada(photoData);
      document.getElementById("user-move").textContent = player1Move;
      userHandAnim.innerHTML = handSVGs[player1Move];
      document.getElementById("user-photo").src = photoData;
      document.getElementById("user-photo").style.display = "block";
      document.getElementById("bot-img").style.display = "none";
      document.getElementById("result").textContent = "Turno Jugador 2: ¡Captura tu jugada!";
      turn = 2;
    } else if (turn === 2) {
      player2Move = predecirJugada(photoData);
      document.getElementById("bot-move").textContent = player2Move;
      botHandAnim.innerHTML = handSVGs[player2Move];
      document.getElementById("bot-img").src = photoData;
      document.getElementById("bot-img").style.display = "block";
      procesarResultado();
      turn = 1;
    }
  } else {
    player1Move = predecirJugada(photoData);
    document.getElementById("user-move").textContent = player1Move;
    userHandAnim.innerHTML = handSVGs[player1Move];
    document.getElementById("user-photo").src = photoData;
    document.getElementById("user-photo").style.display = "block";
    let oponente = getRandomMove();
    player2Move = oponente;
    document.getElementById("bot-move").textContent = oponente;
    botHandAnim.innerHTML = handSVGs[oponente];
    document.getElementById("bot-img").src = imgPaths[oponente];
    document.getElementById("bot-img").style.display = "block";
    procesarResultado();
  }
}
function procesarResultado() {
  let resultado = decidirGanador(player1Move, player2Move);
  let resultadoTexto = resultado;
  if (!isTwoPlayers) {
    resultadoTexto = resultado === "Jugador 1" ? "¡Ganaste!" : resultado === "Jugador 2" ? "Perdiste" : "Empate";
  } else {
    resultadoTexto = resultado === "Empate" ? "Empate" : resultado + " gana";
  }
  document.getElementById("result").textContent = resultadoTexto;
  if ((!isTwoPlayers && resultado === "Jugador 1") || (isTwoPlayers && resultado !== "Empate")) mostrarConfeti();
  playSound(resultado);

  if (resultado === "Empate") draws++;
  else if (resultado === "Jugador 1") player1Score++;
  else player2Score++;

  history.push({j1: player1Move, j2: player2Move, res: resultadoTexto});
  if (history.length > 20) history.shift();
  actualizarPuntajes();
  actualizarHistorial();

  if (currentRound < totalRounds) {
    currentRound++;
    setTimeout(() => {
      document.getElementById("result").textContent = isTwoPlayers ? "Turno Jugador 1: ¡Captura tu jugada!" : "¡Haz tu jugada!";
      document.getElementById("user-move").textContent = "...";
      document.getElementById("bot-move").textContent = "...";
      userHandAnim.innerHTML = "";
      botHandAnim.innerHTML = "";
      document.getElementById("user-photo").style.display = "none";
      document.getElementById("bot-img").style.display = "none";
      player1Move = null;
      player2Move = null;
      turn = 1;
    }, 1200);
  } else {
    setTimeout(() => {
      let final = "¡Empate!";
      if (player1Score > player2Score) final = isTwoPlayers ? "Jugador 1 gana la ronda 🎉" : "¡Ganaste la ronda! 🎉";
      else if (player2Score > player1Score) final = isTwoPlayers ? "Jugador 2 gana la ronda 🎉" : "La computadora gana la ronda 😢";
      document.getElementById("result").textContent = final;
      mostrarConfeti();
      setTimeout(resetGame, 2200);
    }, 1400);
  }
}
function resetGame() {
  player1Score = 0;
  player2Score = 0;
  draws = 0;
  currentRound = 1;
  player1Move = null;
  player2Move = null;
  turn = 1;
  document.getElementById("result").textContent = isTwoPlayers ? "Turno Jugador 1: ¡Captura tu jugada!" : "¡Haz tu jugada!";
  document.getElementById("user-move").textContent = "...";
  document.getElementById("bot-move").textContent = "...";
  userHandAnim.innerHTML = "";
  botHandAnim.innerHTML = "";
  document.getElementById("user-photo").style.display = "none";
  document.getElementById("bot-img").style.display = "none";
  actualizarPuntajes();
}
document.getElementById("capture-btn").addEventListener("click", () => {
  capturarFoto();
});
document.getElementById("mode-btn").addEventListener("click", () => {
  isTwoPlayers = !isTwoPlayers;
  document.getElementById("mode-btn").textContent = isTwoPlayers ? "Modo 1 Jugador" : "Modo 2 Jugadores";
  document.getElementById("score-bot-label").textContent = isTwoPlayers ? "Jugador 2: " : "Computadora: ";
  resetGame();
});
roundSelect.addEventListener("change", () => {
  totalRounds = parseInt(roundSelect.value, 10);
  resetGame();
});

setupWebcam();
resetGame();
actualizarHistorial();
actualizarPuntajes();