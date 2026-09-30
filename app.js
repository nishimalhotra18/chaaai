const API_URL = window.CHAAAI_API_URL || "";
const MAX_QUESTIONS = 3;
let questionCount = 0;
let history = [];

const locateBtn = document.querySelector("#locateBtn");
const conversation = document.querySelector("#conversation");
const askForm = document.querySelector("#askForm");
const question = document.querySelector("#question");
const budget = document.querySelector("#budget");
const sessionState = document.querySelector("#sessionState");

const escapeHTML = (s) => s.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

function addMessage(who, body, extra="") {
  conversation.classList.remove("hidden");
  const el = document.createElement("div");
  el.className = `message message--${who.toLowerCase()} ${extra}`;
  el.innerHTML = `<div class="message__who">${escapeHTML(who.toUpperCase())}:</div><div class="message__body">${escapeHTML(body)}</div>`;
  conversation.appendChild(el);
  el.scrollIntoView({behavior:"smooth",block:"nearest"});
  return el;
}

function addExit() {
  const el = document.createElement("div");
  el.className = "message message--dobby exit";
  el.innerHTML = `<div class="message__who">DOBBY:</div>
  <div class="message__body">Dobby was not hired for this.
Master Chai barely gave Dobby enough compute to manage his own life.
Perhaps the humans at <a class="workers" href="https://workers.io" target="_blank" rel="noopener noreferrer">Workers.io ↗</a> can help.</div>
  <div class="terminated">SESSION TERMINATED.<span class="cursor"></span></div>`;
  conversation.appendChild(el);
  askForm.classList.add("hidden");
  sessionState.textContent = "TERMINATED";
  budget.textContent = "0";
  el.scrollIntoView({behavior:"smooth",block:"nearest"});
}

function staticCommand(input) {
  const cmd = input.trim().toLowerCase();
  if (cmd === "help") return "Available commands: help, whoami, status, sudo. Everything else goes through Dobby.";
  if (cmd === "whoami") return "An unidentified human with suspiciously many questions.";
  if (cmd === "status") return "Master Chai: UNAVAILABLE\nDobby: ONLINE\nMeetings: CRITICAL\nSleep: DEGRADED\nWorkers.io: BUILDING";
  if (cmd.startsWith("sudo")) return "Permission denied. Master Chai does not trust you that much.";
  return null;
}

async function askDobby(text) {
  const local = staticCommand(text);
  if (local) return local;

  if (!API_URL) {
    return "Dobby's language model is not connected yet. Master Chai appears to have consumed all available compute.";
  }

  const response = await fetch(API_URL, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({message:text, history})
  });
  if (!response.ok) throw new Error("Dobby unavailable");
  const data = await response.json();
  return data.reply;
}

locateBtn.addEventListener("click", () => {
  locateBtn.disabled = true;
  locateBtn.classList.add("hidden");
  document.querySelector(".subtitle").textContent = "Locating Master Chai...";
  setTimeout(() => {
    addMessage("Dobby", "Master Chai is currently unavailable.\n\nHe is either building, talking to a founder, or explaining why deterministic simulation would have caught this earlier.");
    document.querySelector(".subtitle").textContent = "Dobby has entered the chat.";
    askForm.classList.remove("hidden");
    question.focus();
  }, 650);
});

askForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = question.value.trim();
  if (!text || questionCount >= MAX_QUESTIONS) return;
  question.value = "";
  addMessage("visitor", text);
  question.disabled = true;

  try {
    const reply = await askDobby(text);
    addMessage("Dobby", reply);
    history.push({role:"user",content:text},{role:"assistant",content:reply});
  } catch {
    addMessage("Dobby", "ERROR 503: Dobby is currently unavailable.\nMaster Chai appears to have consumed all available compute.");
  } finally {
    questionCount += 1;
    budget.textContent = String(Math.max(0, MAX_QUESTIONS - questionCount));
    question.disabled = false;
    if (questionCount >= MAX_QUESTIONS) {
      setTimeout(addExit, 450);
    } else {
      question.focus();
    }
  }
});