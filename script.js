document.addEventListener("DOMContentLoaded", () => {
  // --- 0. PRELOADER ENGINE ---
  window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    setTimeout(() => {
      preloader.style.opacity = "0";
      setTimeout(() => (preloader.style.display = "none"), 1000);
    }, 1500); // Give Michelle a moment to see the loading heart
  });

  // --- 0.5 PREMIUM CURSOR TRACKING ---
  const dot = document.querySelector(".cursor-dot");
  const outline = document.querySelector(".cursor-outline");

  window.addEventListener("mousemove", (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    dot.style.left = `${posX}px`;
    dot.style.top = `${posY}px`;

    // Outline follows with a slight delay for smoothness
    outline.animate(
      {
        left: `${posX}px`,
        top: `${posY}px`,
      },
      { duration: 500, fill: "forwards" },
    );
  });

  // Cursor Hover Interaction
  const interactables = document.querySelectorAll(
    "button, a, .memory-card, .reason-card, .envelope, #secret-word",
  );
  interactables.forEach((el) => {
    el.addEventListener("mouseenter", () =>
      document.body.classList.add("cursor-hover"),
    );
    el.addEventListener("mouseleave", () =>
      document.body.classList.remove("cursor-hover"),
    );
  });

  // --- 1. AUDIO & UNLOCK LOGIC ---
  const holdBtn = document.getElementById("hold-btn");
  const landing = document.getElementById("landing");
  const mainContent = document.getElementById("main-content");
  const circle = document.querySelector(".progress-ring__circle");
  const bgMusic = document.getElementById("bg-music");
  const voiceNote = document.getElementById("voice-note");
  const audioControl = document.getElementById("audio-control");

  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  let progressInterval;
  const holdDuration = 2000;
  const intervalStep = 30;
  let isEasterEggPlaying = false;
  let isMuted = false;

  // --- 1.2 AUDIO TOGGLE LOGIC ---
  audioControl.addEventListener("click", () => {
    isMuted = !isMuted;
    bgMusic.muted = isMuted;
    audioControl.classList.toggle("muted", isMuted);
  });

  // --- 1.5 DYNAMIC AUDIO ENGINE ---
  function fadeAudio(audioElement, targetVolume, duration) {
    if (!audioElement) return;
    const startVolume = audioElement.volume;
    const volumeChange = targetVolume - startVolume;
    const tickRate = 50;
    const ticks = duration / tickRate;
    const volumeStep = volumeChange / ticks;
    let currentTick = 0;

    if (audioElement.fadeInterval) clearInterval(audioElement.fadeInterval);
    audioElement.fadeInterval = setInterval(() => {
      currentTick++;
      let newVolume = startVolume + volumeStep * currentTick;
      if (newVolume > 1) newVolume = 1;
      if (newVolume < 0) newVolume = 0;
      audioElement.volume = newVolume;
      if (currentTick >= ticks) {
        clearInterval(audioElement.fadeInterval);
        audioElement.volume = targetVolume;
      }
    }, tickRate);
  }

  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  function startHold(e) {
    if (e.type === "touchstart") e.preventDefault();

    // --- MOBILE AUDIO PRIMER HACK ---
    // This instantly unlocks the audio context on her first physical touch
    if (bgMusic && bgMusic.paused) {
      // Set volume to 0 so she doesn't hear a weird blip
      bgMusic.volume = 0;
      bgMusic
        .play()
        .then(() => {
          bgMusic.pause();
        })
        .catch((err) => console.log("Mobile primer caught:", err));
    }
    // --------------------------------

    // Enforce the Easter Egg wait time
    if (isEasterEggPlaying) {
      landingInstruction.textContent = "Let the voice note finish first... 💜";
      landingInstruction.style.color = "var(--primary-pink)";
      holdBtn.textContent = "WAIT";

      if (navigator.vibrate) navigator.vibrate(100);

      return;
    }

    holdBtn.textContent = "HOLD";

    let elapsed = 0;
    progressInterval = setInterval(() => {
      elapsed += intervalStep;
      setProgress((elapsed / holdDuration) * 100);
      if (elapsed >= holdDuration) unlockStory();
    }, intervalStep);
  }

  function endHold() {
    clearInterval(progressInterval);
    setProgress(0);
  }

  function unlockStory() {
    clearInterval(progressInterval);
    holdBtn.disabled = true;
    if (voiceNote) voiceNote.pause();
    if (bgMusic) {
      bgMusic.volume = 0;
      bgMusic.play().catch((e) => console.log("Audio play prevented", e));
      fadeAudio(bgMusic, 0.3, 2000);
    }
    fireConfetti();
    landing.style.opacity = "0";
    setTimeout(() => {
      landing.style.display = "none";
      mainContent.classList.remove("hidden");
      audioControl.classList.remove("hidden-element"); // Show audio controller
      window.scrollTo(0, 0);
    }, 1000);
  }

  holdBtn.addEventListener("mousedown", startHold);
  holdBtn.addEventListener("mouseup", endHold);
  holdBtn.addEventListener("mouseleave", endHold);
  holdBtn.addEventListener("touchstart", startHold);
  holdBtn.addEventListener("touchend", endHold);
  holdBtn.addEventListener("touchcancel", endHold);

  // --- 2. HIDDEN VOICE NOTE & REVEAL ---
  const secretWord = document.getElementById("secret-word");
  const landingInstruction = document.getElementById("landing-instruction");
  const holdWrapper = document.getElementById("hold-wrapper");
  let hasFoundSecret = false;

  secretWord.addEventListener("click", () => {
    if (!hasFoundSecret) {
      hasFoundSecret = true;
      if (voiceNote) {
        isEasterEggPlaying = true;
        voiceNote.volume = 0.8;
        voiceNote
          .play()
          .catch((e) => console.log("Audio needs interaction", e));
        voiceNote.addEventListener("ended", () => {
          isEasterEggPlaying = false;
          landingInstruction.textContent = "HOLD TO UNLOCK OUR STORY";
          landingInstruction.style.color = "var(--text-muted)";
          holdBtn.textContent = "HOLD";
        });
      }
      secretWord.classList.remove("hint-glow");
      secretWord.style.color = "#fff";
      secretWord.style.textShadow = "none";
      landingInstruction.textContent = "HOLD TO UNLOCK OUR STORY";
      holdWrapper.classList.remove("hidden-element");
      holdWrapper.style.animation = "fadeIn 1.5s ease-in";
    }
  });

  // --- 2.5 3D PARALLAX LANDING ---
  landing.addEventListener("mousemove", (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) / 50;
    const moveY = (e.clientY - window.innerHeight / 2) / 50;
    landing.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
    document.getElementById("landing-content-box").style.transform =
      `translate(${-moveX}px, ${-moveY}px)`;
  });

  // Mobile Gyroscope Parallax
  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (e) => {
      const moveX = e.gamma / 2;
      const moveY = e.beta / 2;
      landing.style.backgroundPosition = `calc(50% + ${moveX}px) calc(50% + ${moveY}px)`;
    });
  }

  // --- 3. DUST PARTICLES, MEMORIES, REASONS, ETC. ---
  const particlesContainer = document.getElementById("particles-container");
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement("div");
    particle.classList.add("dust-particle");
    const size = Math.random() * 4 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.animationDuration = `${Math.random() * 10 + 10}s`;
    particle.style.animationDelay = `${Math.random() * 10}s`;
    particlesContainer.appendChild(particle);
  }

  document.querySelectorAll(".toggle-memories").forEach((btn) => {
    btn.addEventListener("click", function () {
      const grid = this.nextElementSibling;
      grid.classList.toggle("show");
      this.textContent = grid.classList.contains("show")
        ? "HIDE MEMORIES"
        : "SEE MEMORIES";
      if (grid.classList.contains("show")) {
        setTimeout(
          () => grid.scrollIntoView({ behavior: "smooth", block: "center" }),
          300,
        );
      }
    });
  });

  const reasons = [
    "You care so much.",
    "I’m not this comfortable with anyone else.",
    "You’re always there for me.",
    "You understand my silence. I don’t always explain myself well, but somehow you just get it.",
    "You stayed, even when you had all the reasons to leave the friendship.",
    "Even at last minute you always pull through for me.",
    "You're a genuinely good person and friend, you care about your friends a lot which is something I admire.",
    "We can sit in silence and it's never awkward.",
    "You support me in what I do.",
    "You’re always there to actually advise and call me out when I do something wrong.",
    "My gist partner ofc.",
    "Omo you tolerate me a lot.",
    "You’ve seen versions of me I don’t really show other people.",
    "You’ve become one of my safest places fr.",
    "You’ve made me grow fr, emotionally as well.",
    "You honestly make me feel easy.",
    "Even when we don’t talk for a while we click like nothing changed.",
    "You’ve made the last 4 years a better experience fr.",
    "If I had to re-live the last 4 years again I would still pick this friendship.",
  ];
  const reasonsContainer = document.getElementById("reasons-container");
  reasons.forEach((text, index) => {
    const card = document.createElement("div");
    card.classList.add("reason-card");
    card.innerHTML = `<div class="reason-inner"><div class="reason-front"><h4>${index + 1}</h4><span>REASON</span></div><div class="reason-back"><p>${text}</p></div></div>`;
    card.addEventListener("click", () => card.classList.toggle("flipped"));
    reasonsContainer.appendChild(card);
  });

  const modal = document.getElementById("media-modal");
  const modalContent = document.getElementById("modal-content");
  function openModal(element) {
    modalContent.innerHTML = "";
    const videoInside = element.querySelector("video");
    if (videoInside) {
      const video = document.createElement("video");
      video.src = videoInside.src;
      video.controls = true;
      video.autoplay = true;
      modalContent.appendChild(video);
    } else {
      const bgImage = window.getComputedStyle(element).backgroundImage;
      if (bgImage !== "none") {
        const img = document.createElement("img");
        img.src = bgImage.slice(4, -1).replace(/["']/g, "");
        modalContent.appendChild(img);
      }
    }
    modal.classList.add("active");
  }
  document.querySelectorAll(".memory-card").forEach((card) =>
    card.addEventListener("click", function () {
      openModal(this);
    }),
  );
  document
    .querySelector(".close-modal")
    .addEventListener("click", () => modal.classList.remove("active"));

  // --- 7. ENVELOPE & LIVE TYPING ---
  const envelope = document.getElementById("envelope");
  const envelopeWrapper = document.getElementById("envelope-wrapper");
  const outroSection = document.getElementById("outro");
  const typedTextElement = document.getElementById("typed-text");
  const closeLetterBtn = document.getElementById("close-letter");
  let isTyping = false;
  let typeTimeout, cinematicTimeout;
  const secretMessage =
    "Happy Birthday Michelle.<br><br>Words can’t describe how much I love you Michelle.<br>I love everything about you and everything about this friendship.<br>I admire you, your talents, I admire you as a person, I care so deeply for you.<br>Over the last year I’ve learned not to throw around the word “love” lightly.<br>But I genuinely LOVE you Michelle, love could be an understatement.<br>I wouldn’t give up this friendship for anything else.<br>May God Answer and grant you all your heart desires, you are a great person and deserve the best life has to offer.<br>And trust I’ll be here to see you grow into a greater woman, I’ll be here with you each step of the way.<br>I love you so much Michelle, I hope this little show would help express that as well and I wish you the best birthday ever.<br><br>Here's to you, today, tomorrow, and always. 💜";

  function typeWriter(text, i) {
    if (i < text.length && isTyping) {
      if (text.substring(i, i + 4) === "<br>") {
        typedTextElement.insertAdjacentHTML("beforeend", "<br>");
        i += 4;
      } else {
        typedTextElement.insertAdjacentText("beforeend", text.charAt(i));
        i++;
      }
      const letterContentEl = document.getElementById("letter-content");
      if (
        letterContentEl.scrollHeight > Math.ceil(letterContentEl.clientHeight)
      ) {
        letterContentEl.scrollTop = letterContentEl.scrollHeight;
      }
      typeTimeout = setTimeout(() => typeWriter(text, i), 40);
    } else if (i >= text.length && isTyping) {
      cinematicTimeout = setTimeout(triggerCinematicEnding, 1500);
    }
  }

  envelopeWrapper.addEventListener("click", () => {
    if (!envelope.classList.contains("is-open")) {
      envelope.classList.add("is-open");
      fadeAudio(bgMusic, 0.45, 1500);
      outroSection.classList.add("letter-reading-mode");
      envelopeWrapper.classList.add("elevated");
      setTimeout(() => {
        outroSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
      if (!isTyping) {
        isTyping = true;
        typedTextElement.innerHTML = "";
        document.getElementById("letter-content").scrollTop = 0;
        setTimeout(() => {
          fadeAudio(bgMusic, 0.6, 1500);
          typeWriter(secretMessage, 0);
        }, 1200);
      }
    }
  });

  closeLetterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    isTyping = false;
    clearTimeout(typeTimeout);
    clearTimeout(cinematicTimeout);
    typedTextElement.innerHTML = "";
    closeLetterBtn.style.opacity = "";
    closeLetterBtn.style.pointerEvents = "";
    envelope.classList.remove("is-open");
    outroSection.classList.remove("letter-reading-mode");
    if (bgMusic) fadeAudio(bgMusic, 0.3, 1500);
  });

  // Particles & Observer
  const heartsContainer = document.getElementById("hearts-container");
  setInterval(() => {
    if (
      document.getElementById("outro").getBoundingClientRect().top <
      window.innerHeight
    ) {
      const heart = document.createElement("div");
      heart.classList.add("heart");
      heart.innerHTML = "♥";
      heart.style.left = Math.random() * 100 + "vw";
      heart.style.animationDuration = Math.random() * 3 + 4 + "s";
      heartsContainer.appendChild(heart);
      setTimeout(() => heart.remove(), 7000);
    }
  }, 300);

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document
    .querySelectorAll(".year-block, .reason-card")
    .forEach((el) => revealObserver.observe(el));

  // --- 1.8 CONFETTI BURST ENGINE ---
  function fireConfetti() {
    const container = document.createElement("div");
    container.id = "confetti-container";
    document.body.appendChild(container);
    const colors = ["#d86c9b", "#b05a8a", "#ff9ece", "#ffffff", "#e0dced"];
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 6;
      confetti.style.backgroundColor = color;
      confetti.style.width = `${size}px`;
      confetti.style.height =
        Math.random() < 0.5 ? `${size}px` : `${size * 1.5}px`;
      if (Math.random() < 0.5) confetti.style.borderRadius = "50%";
      confetti.style.setProperty(
        "--burst-x",
        `${(Math.random() - 0.5) * 600}px`,
      );
      confetti.style.setProperty(
        "--burst-y",
        `${(Math.random() - 0.8) * 500}px`,
      );
      confetti.style.setProperty("--end-x", `${(Math.random() - 0.5) * 800}px`);
      confetti.style.setProperty("--rot1", `${Math.random() * 360}deg`);
      confetti.style.setProperty("--rot2", `${Math.random() * 1000}deg`);
      confetti.style.setProperty("--duration", `${Math.random() * 2 + 3}s`);
      container.appendChild(confetti);
    }
    setTimeout(() => container.remove(), 6000);
  }

  // --- 10. CINEMATIC ENDING ENGINE ---
  function triggerCinematicEnding() {
    if (document.getElementById("cinematic-ending")) return;
    if (bgMusic) fadeAudio(bgMusic, 0.45, 2000);
    const closeBtn = document.getElementById("close-letter");
    if (closeBtn) {
      closeBtn.style.opacity = "0";
      closeBtn.style.pointerEvents = "none";
    }
    const endingOverlay = document.createElement("div");
    endingOverlay.id = "cinematic-ending";
    endingOverlay.innerHTML = `<div class="cinematic-text-wrapper"><h1 class="cinematic-title">Happy 19th Birthday<br>Michelle</h1><p class="cinematic-subtitle">Almost four years of memories… and many more to come.</p></div>`;
    document.body.appendChild(endingOverlay);
    setTimeout(() => endingOverlay.classList.add("active"), 50);
    setTimeout(() => {
      endingOverlay.addEventListener(
        "click",
        () => {
          endingOverlay.classList.remove("active");
          if (closeBtn) {
            closeBtn.style.opacity = "";
            closeBtn.style.pointerEvents = "";
          }
          setTimeout(() => endingOverlay.remove(), 2000);
        },
        { once: true },
      );
    }, 2500);
  }
});
