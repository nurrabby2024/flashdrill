
(function () {
  const STORAGE_KEY = "flashdrill-v1";
  const cards = [{"q": "One small improvement you could make today?", "a": "Pick something that takes under 10 minutes and leaves your space, code, or future self slightly better."}, {"q": "What is your single biggest priority this week?", "a": "The thing that, if done, makes other tasks easier or less important."}, {"q": "Name one thing you learned recently.", "a": "If you can explain it in one or two sentences, you actually understand it."}, {"q": "What is the next tiny step on a current project?", "a": "Shrink the step until you could do it in 5–10 focused minutes."}, {"q": "What usually distracts you the most?", "a": "Whatever it is, design one tiny speed bump between you and that distraction."}, {"q": "When do you have your best energy in the day?", "a": "Protect 1–2 of those blocks as \"no-meeting, no-scroll\" time if you can."}, {"q": "A habit you want to add?", "a": "Connect it to a habit you already do daily (habit stacking)."}, {"q": "Something you keep postponing?", "a": "Decide whether to schedule it, delegate it, or consciously drop it."}, {"q": "What does 'done' look like for your current task?", "a": "Describe the finish line so your brain knows when to stop."}, {"q": "Who could you ask for help from this week?", "a": "Even a short question to the right person can save hours."}, {"q": "What is one thing you can say no to?", "a": "Every \"no\" protects time for the things that matter more."}, {"q": "What is a recent win you can celebrate?", "a": "Write it down; your brain needs evidence that effort pays off."}, {"q": "What is one topic you would enjoy learning about?", "a": "Look up a 5–10 minute introduction video or article today."}, {"q": "When was the last time you took a real break?", "a": "Try a micro break: 3 deep breaths, stand, look away from screens."}, {"q": "What are three words that describe your ideal workday?", "a": "Use them as a filter for what to add or remove from your schedule."}, {"q": "What is cluttering your mental RAM right now?", "a": "Do a 1-minute brain dump, then choose one item to handle or park."}, {"q": "What skill would Future You thank you for practicing?", "a": "Schedule a tiny rep of that skill in the next 48 hours."}, {"q": "What is one thing you are overthinking?", "a": "Define the smallest version you would be okay shipping."}, {"q": "Who is someone you appreciate?", "a": "Send them a short message today; doesn’t have to be long or perfect."}, {"q": "What environment helps you focus?", "a": "Try to recreate one small element of that environment right now."}, {"q": "What is a tiny reward you can give yourself after a focus block?", "a": "Make it simple and immediate, like tea, music, or a stretch."}, {"q": "What belief about your productivity might be limiting you?", "a": "Test the opposite for just one day and see what happens."}, {"q": "When you feel stuck, what usually helps?", "a": "Make that your default first response instead of scrolling."}, {"q": "What is one thing you can prepare tonight for tomorrow morning?", "a": "Even a 2-minute prep can lower friction for tomorrow's start."}, {"q": "What is one habit you already do well?", "a": "Use it as proof that you can stick with habits and build from there."}, {"q": "What is something you can automate or template?", "a": "Anything you do 3+ times is a candidate for a template."}, {"q": "What do you want to remember a year from now about this season of life?", "a": "Write one sentence that captures it."}, {"q": "What is one small risk you could take this week?", "a": "Think of a low-stakes experiment rather than a huge leap."}, {"q": "What is something you could simplify?", "a": "Often you can remove a step instead of optimizing it."}, {"q": "What does \"enough\" look like for you today?", "a": "Define \"enough\" clearly so you can also stop and rest."}];

  const cardTextEl = document.getElementById("card-text");
  const cardSideLabelEl = document.getElementById("card-side-label");
  const flipHintEl = document.getElementById("flip-hint");
  const progressLabelEl = document.getElementById("progress-label");
  const streakLabelEl = document.getElementById("streak-label");

  const flipBtn = document.getElementById("flip-btn");
  const againBtn = document.getElementById("again-btn");
  const gotitBtn = document.getElementById("gotit-btn");
  const shuffleBtn = document.getElementById("shuffle-btn");

  let state = {
    order: [],
    index: 0,
    side: "front", // front = question, back = answer
    seenToday: 0,
    correctToday: 0,
    streak: 0,
    lastSessionDate: null
  };

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn("[FlashDrill] failed to load state", e);
      return null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("[FlashDrill] failed to save state", e);
    }
  }

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function initOrder() {
    const indices = cards.map((_, i) => i);
    state.order = shuffleArray(indices);
    state.index = 0;
    state.side = "front";
  }

  function ensureOrder() {
    if (!state.order || !state.order.length || state.order.some(i => typeof i !== "number")) {
      initOrder();
    }
  }

  function resetForNewDayIfNeeded() {
    const today = todayKey();
    if (!state.lastSessionDate) {
      state.lastSessionDate = today;
      return;
    }
    if (state.lastSessionDate !== today) {
      // new day: reset daily counters, maybe increment streak if previous day had activity
      if (state.seenToday > 0) {
        state.streak = (state.streak || 0) + 1;
      }
      state.seenToday = 0;
      state.correctToday = 0;
      state.lastSessionDate = today;
    }
  }

  function renderCard() {
    ensureOrder();
    const idx = state.order[state.index] || 0;
    const card = cards[idx];
    const isFront = state.side === "front";
    if (cardSideLabelEl) cardSideLabelEl.textContent = isFront ? "Question" : "Answer";
    if (cardTextEl) cardTextEl.textContent = isFront ? card.q : card.a;
    if (flipHintEl) flipHintEl.textContent = isFront
      ? "Tap Flip to see the answer."
      : "Mark Again or Got it to move forward.";
  }

  function renderStats() {
    if (progressLabelEl) {
      progressLabelEl.textContent = state.seenToday + " / " + cards.length + " today";
    }
    if (streakLabelEl) {
      streakLabelEl.textContent = "Streak: " + (state.streak || 0);
    }
  }

  function nextCard() {
    ensureOrder();
    state.index = (state.index + 1) % state.order.length;
    state.side = "front";
    renderCard();
    renderStats();
    saveState();
  }

  function markSeen(correct) {
    const today = todayKey();
    if (state.lastSessionDate !== today) {
      // new day: only count this as first activity & potentially increment streak
      resetForNewDayIfNeeded();
    }
    state.seenToday += 1;
    if (correct) {
      state.correctToday += 1;
    }
    state.lastSessionDate = today;
    renderStats();
  }

  function handleFlip() {
    state.side = state.side === "front" ? "back" : "front";
    renderCard();
    saveState();
  }

  function handleAgain() {
    // Only count as seen if we were on the answer side
    if (state.side === "back") {
      markSeen(false);
    }
    nextCard();
  }

  function handleGotIt() {
    if (state.side === "back") {
      markSeen(true);
    } else {
      // auto-flip to answer if they tap Got it on front
      state.side = "back";
      renderCard();
      saveState();
      return;
    }
    nextCard();
  }

  function handleShuffle() {
    initOrder();
    renderCard();
    renderStats();
    saveState();
  }

  function init() {
    const saved = loadState();
    if (saved) {
      state = Object.assign(state, saved);
    }
    resetForNewDayIfNeeded();
    ensureOrder();
    renderCard();
    renderStats();

    if (flipBtn) flipBtn.addEventListener("click", handleFlip);
    if (againBtn) againBtn.addEventListener("click", handleAgain);
    if (gotitBtn) gotitBtn.addEventListener("click", handleGotIt);
    if (shuffleBtn) shuffleBtn.addEventListener("click", handleShuffle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
