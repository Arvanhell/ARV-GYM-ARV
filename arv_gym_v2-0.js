// 1. Pomocnik i Dane
const $ = (id) => document.getElementById(id);
let workoutHistory = JSON.parse(localStorage.getItem('workoutLogs')) || [];

// --- 1. POMOCNIK LICZENIA SERII ---
function getTodaySets(exerciseName) {
    const today = new Date().toLocaleDateString();
    return workoutHistory.filter(e => e.exercise === exerciseName && e.date === today).length + 1;
}

// --- 2. INTELIGENTNY RADAR ---
function showLastResult(exerciseName) {
    const infoBox = $("last-result-info");
    if (!infoBox) return;
    if (!exerciseName) {
        infoBox.innerHTML = "Select exercise to see stats...";
        return;
    }
    
    const exerciseHistory = workoutHistory.filter(e => e.exercise === exerciseName);
    const lastEntry = exerciseHistory[0]; 
    const allWeights = exerciseHistory.map(e => parseFloat(e.weight)).filter(w => !isNaN(w));
    const personalRecord = allWeights.length > 0 ? Math.max(...allWeights) : null;

    let content = `<b>Target: ${exerciseName}</b><br>`;
    
    if (lastEntry) {
        content += `⏱️ Last: <span style="color:#00f2ff">${lastEntry.weight}kg x ${lastEntry.reps}</span> (@${lastEntry.rpe})<br>`;
        if (personalRecord) content += `🏆 Personal Record: <span style="color:#ffcc00">${personalRecord}kg</span><br>`;
        
        if (parseInt(lastEntry.rpe) >= 12) {
            content += `<span style="color:#ff4444">⚠️ Extreme Burn! Keep load.</span>`;
        } else {
            content += `<span style="color:#00ff88">🚀 Solid! Try +1.25/2.5kg or +1-2 reps.</span>`;
        }
    } else {
        content += `<span style="color:#aaa">First time with this exercise!</span>`;
    }

    content += `<br><b style="color:#fff">Current Session: Set #${getTodaySets(exerciseName)}</b>`;
    infoBox.innerHTML = content;
}

// --- 3. ZAPIS SESJI ---
function saveWorkoutToLog() {
    let exType = $("exercise-type").value;
    let weight = $("weight-in").value;
    let reps = $("reps-in").value;
    let rpe = $("rpe-select").value;
    let currentUser = $("user-selector").value;

    if (!exType) return alert("Cezar, wybierz cwiczenie!");
    if (!reps) return alert("Wpisz powtorzenia!");

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const dayName = days[now.getDay()];

    if (weight === "" || weight === "0") weight = "BW";

    let entry = {
        user: currentUser,
        date: now.toLocaleDateString(),
        day: dayName,
        exercise: exType,
        weight: weight,
        reps: reps,
        rpe: rpe,
        set: getTodaySets(exType)
    };

    workoutHistory.unshift(entry);
    if (workoutHistory.length > 100) workoutHistory.pop(); 
    localStorage.setItem('workoutLogs', JSON.stringify(workoutHistory));
    
    renderLog();
    showLastResult(exType);
    startRestTimer();
    
    $("weight-in").value = "";
    $("reps-in").value = "";
}

// --- 4. WYŚWIETLANIE LISTY ---
function renderLog() {
    const listContainer = $("workout-list");
    if (!listContainer) return;
    listContainer.innerHTML = ""; 

    let titleText = (currentLang === 'pl') ? "Ostatnia Aktywnosc" : "Recent Activity";
    let html = `<h3 style="color:#00f2ff">${titleText}</h3><ul>`;
    
    workoutHistory.slice(0, 5).forEach(item => {
        let displayWeight = (item.weight === "BW") ? "BW" : item.weight + "kg";
        html += `
        <li style="border-bottom: 1px solid #333; padding: 8px 0; list-style:none; font-size:0.9em;">
            <small>${item.day} ${item.date} [${item.user}]</small><br>
            <b>${item.exercise}</b> [S#${item.set || 1}]<br>
            ${displayWeight} x ${item.reps} <span style="color:#00f2ff; float:right;">RPE ${item.rpe}</span>
        </li>`;
    });
    html += "</ul>";
    listContainer.innerHTML = html;
}

// --- 5. TIMER ---
let timerInterval;
function startRestTimer() {
    let seconds = parseInt($("training-goal").value) || 90;
    clearInterval(timerInterval);
    let timeLeft = seconds;
    const display = $("timer-display");
    const timeText = $("time-left");
    display.style.display = "block";
    timeText.innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timeText.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            display.innerHTML = "<b style='color:#00ff88; font-size:1.2em;'>🔥 GO! NEXT SET! 🔥</b>";
            if (window.navigator.vibrate) window.navigator.vibrate([300, 100, 300]);
            setTimeout(() => { display.style.display = "none"; display.innerHTML = `<span style="color:#aaa; font-size:0.8em;">RESTING...</span><br><span id="time-left" style="font-size:2.5em; color:#ffcc00; font-weight:bold;">90</span><span style="color:#ffcc00">s</span>`; }, 5000);
        }
    }, 1000);
}

// --- 6. UŻYTKOWNICY I JĘZYK ---
let currentLang = 'en';

function addNewUser() {
    const name = prompt("Add New user name (no polish chars):");
    if (name) {
        const select = $("user-selector");
        const option = document.createElement('option');
        option.value = name;
        option.text = name;
        select.add(option);
        select.value = name;

        let users = JSON.parse(localStorage.getItem('gym_users')) || ['User'];
        if (!users.includes(name)) {
            users.push(name);
            localStorage.setItem('gym_users', JSON.stringify(users));
        }
        alert("User " + name + " Welcome!");
    }
}

function loadUsers() {
    const select = $("user-selector");
    if (!select) return;
    let users = JSON.parse(localStorage.getItem('gym_users')) || ['User'];
    
    select.innerHTML = "";
    
    let defaultOpt = document.createElement('option');
    defaultOpt.text = "-- Login --";
    defaultOpt.value = "";
    select.add(defaultOpt);
    
    users.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.text = name;
        select.add(option);
    });
}

const langData = {
    en: { user: "User", focus: "Training Focus:", ex: "Choose Exercise:", weight: "Weight (kg)", reps: "Reps", save: "SAVE SESSION", recent: "Recent Activity" },
    pl: { user: "Uzytkownik", focus: "Cel Treningu:", ex: "Wybierz Cwiczenie:", weight: "Ciezar (kg)", reps: "Powtorzenia", save: "ZAPISZ TRENING", recent: "Ostatnia Aktywnosc" }
};

function changeLang(lang) {
    currentLang = lang;
    if ($("lbl-user-select")) $("lbl-user-select").innerText = langData[lang].user;
    
    // Tłumaczenie etykiet nad selectami
    const labels = document.querySelectorAll('.input-group label');
    if (labels[0]) labels[0].innerText = langData[lang].focus;
    if (labels[1]) labels[1].innerText = langData[lang].ex;

    if ($("weight-in")) $("weight-in").placeholder = langData[lang].weight;
    if ($("reps-in")) $("reps-in").placeholder = langData[lang].reps;
    
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) saveBtn.innerText = langData[lang].save;
    
    renderLog(); // Odśwież nagłówek historii
}

window.onload = () => {
    loadUsers();
    renderLog();
    changeLang('en');
};
