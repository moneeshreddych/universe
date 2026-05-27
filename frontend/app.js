// AstralVerse Main Orchestrator

document.addEventListener("DOMContentLoaded", () => {
  generateTwinklingStars();
  initSimulatorControls();
  initHamburgerSidebar();
  initPlanetsSlideshow();
  initNakshatrasGrid();
  initRasisGrid();
  initScrollReveal();

  // Initialize the Telugu Calendar engine from calendar.js
  if (typeof initCalendar === "function") {
    initCalendar();
  }
});

// 0. Scroll Reveal Animation Logic
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once revealed, we can stop observing this element
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => observer.observe(el));
}

// 1. Generate Twinkling Stars Background
function generateTwinklingStars() {
  const container = document.getElementById("stars-overlay");
  if (!container) return;
  
  const count = 120;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement("div");
    star.className = "star";
    
    // Random position, size, and animation delay
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2 + 1; // 1px to 3px
    const delay = Math.random() * 6; // 0s to 6s
    const duration = Math.random() * 4 + 3; // 3s to 7s
    
    star.style.left = `${x}%`;
    star.style.top = `${y}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDelay = `${delay}s`;
    star.style.animationDuration = `${duration}s`;
    
    // Add blue, gold, or white tints randomly
    const tint = Math.random();
    if (tint < 0.15) {
      star.style.background = "#d4af37"; // Gold star
      star.style.boxShadow = "0 0 4px #d4af37";
    } else if (tint < 0.3) {
      star.style.background = "#06b6d4"; // Cyan star
      star.style.boxShadow = "0 0 4px #06b6d4";
    } else {
      star.style.background = "#ffffff";
    }
    
    fragment.appendChild(star);
  }
  container.appendChild(fragment);
}

// 2. NASA Eyes scroll lock / interactive mode handler
function initSimulatorControls() {
  const scrollLock = document.getElementById("simulator-scroll-lock");
  const unlockBtn = document.getElementById("unlock-simulator-btn");
  const lockIndicator = document.getElementById("lock-status-indicator");
  const relockBtn = lockIndicator ? lockIndicator.querySelector("button") : null;
  const container = document.getElementById("simulator-container");

  if (unlockBtn && scrollLock) {
    unlockBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      scrollLock.classList.add("unlocked");
      if (lockIndicator) lockIndicator.classList.remove("hidden");
    });
  }

  if (relockBtn && scrollLock) {
    relockBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      scrollLock.classList.remove("unlocked");
      lockIndicator.classList.add("hidden");
    });
  }
}

// 3. Hamburger Sidebar & Navigation Menu Drawer
function initHamburgerSidebar() {
  const hamburger = document.getElementById("hamburger-menu");
  const menuSidebar = document.getElementById("menu-sidebar");
  const closeMenuBtn = document.getElementById("close-menu-sidebar");
  const openCalendarBtn = document.getElementById("open-calendar-from-menu");
  const calendarDrawer = document.getElementById("calendar-drawer");
  const closeCalendarBtn = document.getElementById("close-drawer-desktop");
  
  if (!hamburger || !menuSidebar || !calendarDrawer) return;

  const toggleMenu = () => {
    menuSidebar.classList.toggle("open");
    hamburger.classList.toggle("open");
  };

  const closeMenu = () => {
    menuSidebar.classList.remove("open");
    hamburger.classList.remove("open");
  };

  const openCalendar = () => {
    closeMenu();
    calendarDrawer.classList.add("open");
  };

  const closeCalendar = () => {
    calendarDrawer.classList.remove("open");
  };

  // Hamburger toggles navigation menu sidebar
  hamburger.addEventListener("click", toggleMenu);
  
  // Close navigation menu
  if (closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  
  // Calendar button inside menu opens the full calendar drawer
  if (openCalendarBtn) openCalendarBtn.addEventListener("click", openCalendar);
  
  // Close calendar drawer
  if (closeCalendarBtn) closeCalendarBtn.addEventListener("click", closeCalendar);

  // Close menu and smooth scroll when links are clicked
  const menuLinks = menuSidebar.querySelectorAll(".menu-link-item");
  menuLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      closeMenu();
      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Wire up mini-calendar month triggers (kept for legacy compatibility)
  const miniPrev = document.getElementById("mini-prev");
  const miniNext = document.getElementById("mini-next");

  if (miniPrev) {
    miniPrev.addEventListener("click", () => {
      if (typeof calendarCurrentMonth !== 'undefined') {
        calendarCurrentMonth--;
        if (calendarCurrentMonth < 0) {
          calendarCurrentMonth = 11;
          calendarCurrentYear--;
        }
        renderMiniCalendar();
      }
    });
  }

  if (miniNext) {
    miniNext.addEventListener("click", () => {
      if (typeof calendarCurrentMonth !== 'undefined') {
        calendarCurrentMonth++;
        if (calendarCurrentMonth > 11) {
          calendarCurrentMonth = 0;
          calendarCurrentYear++;
        }
        renderMiniCalendar();
      }
    });
  }
}

// 4. 9 Planets and Moon Slideshow Carousel
let currentPlanetSlide = 0;

function initPlanetsSlideshow() {
  const track = document.getElementById("slider-track");
  const dotsContainer = document.getElementById("slider-dots");
  if (!track || !PLANETS_DATA) return;

  track.innerHTML = "";
  if (dotsContainer) dotsContainer.innerHTML = "";

  const trackFragment = document.createDocumentFragment();
  const dotsFragment = document.createDocumentFragment();

  // Define realistic gradients for 3D CSS spheres
  const sphereGradients = {
    sun: "radial-gradient(circle at 30% 30%, #facc15, #f97316 60%, #dc2626 100%)",
    moon: "radial-gradient(circle at 30% 30%, #f1f5f9, #94a3b8 60%, #475569 100%)",
    mercury: "radial-gradient(circle at 30% 30%, #2dd4bf, #059669 60%, #064e3b 100%)",
    venus: "radial-gradient(circle at 30% 30%, #fef08a, #eab308 60%, #854d0e 100%)",
    earth: "radial-gradient(circle at 30% 30%, #3b82f6, #10b981 60%, #1e3a8a 100%)",
    mars: "radial-gradient(circle at 30% 30%, #f87171, #dc2626 60%, #7f1d1d 100%)",
    jupiter: "radial-gradient(circle at 30% 30%, #fbbf24, #d97706 60%, #78350f 100%)",
    saturn: "radial-gradient(circle at 30% 30%, #c084fc, #6b21a8 60%, #1e1b4b 100%)",
    uranus: "radial-gradient(circle at 30% 30%, #22d3ee, #0d9488 60%, #115e59 100%)",
    neptune: "radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8 60%, #0f172a 100%)",
    pluto: "radial-gradient(circle at 30% 30%, #94a3b8, #475569 60%, #1e293b 100%)"
  };

  PLANETS_DATA.forEach((planet, index) => {
    const slide = document.createElement("div");
    slide.className = `slide-item ${index === 0 ? 'active' : ''}`;
    slide.setAttribute("data-slide-index", index);

    const isSaturn = planet.id === "saturn";
    const ringsMarkup = isSaturn ? '<div class="planet-ring-behind"></div>' : '';

    slide.innerHTML = `
      <div class="planet-card glass ${planet.id === 'sun' ? 'glow-gold' : 'glow-cyan'}">
        
        <!-- Left: 3D Visualizer -->
        <div class="planet-visual-column">
          <!-- Background Orbit Rings -->
          <div class="planet-orbit-line orbit-1"></div>
          <div class="planet-orbit-line orbit-2"></div>
          
          <div class="planet-sphere-wrap ${isSaturn ? 'has-rings' : ''}">
            ${ringsMarkup}
            <div class="planet-sphere" style="background: ${sphereGradients[planet.id] || '#ffffff'};"></div>
          </div>
        </div>

        <!-- Right: Tabbed details -->
        <div class="planet-info-column flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs uppercase tracking-widest text-gold-400 font-semibold">${planet.scientific.type}</span>
              <span class="text-3xl">${planet.symbol}</span>
            </div>
            
            <h3 class="text-2xl font-bold text-white font-telugu mb-4">${planet.nameTe} <span class="text-sm font-normal text-slate-400">/ ${planet.nameEn}</span></h3>
            
            <!-- Navigation Tabs -->
            <div class="planet-tabs">
              <button class="planet-tab active" data-tab-target="sci-${planet.id}">Astronomical facts</button>
              <button class="planet-tab" data-tab-target="ast-${planet.id}">Vedic Astrology</button>
            </div>

            <!-- Tab 1: Scientific -->
            <div class="tab-content active" id="sci-${planet.id}">
              <table class="w-full text-xs text-slate-300 border-collapse">
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Mean Distance:</td><td class="py-2 text-right">${planet.scientific.distance}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Orbital Period:</td><td class="py-2 text-right">${planet.scientific.period}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Known Moons:</td><td class="py-2 text-right">${planet.scientific.moons}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Diameter:</td><td class="py-2 text-right">${planet.scientific.diameter}</td></tr>
              </table>
              <div class="mt-4 p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-xl text-[11px] leading-relaxed text-cyan-300">
                <strong>Science Fact:</strong> ${planet.scientific.fact}
              </div>
            </div>

            <!-- Tab 2: Astrological -->
            <div class="tab-content" id="ast-${planet.id}">
              <table class="w-full text-xs text-slate-300 border-collapse">
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Significance:</td><td class="py-2 text-right font-telugu text-gold-300">${planet.astrological.significance}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Ruling Day:</td><td class="py-2 text-right font-telugu">${planet.astrological.rulingDay}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Gemstone:</td><td class="py-2 text-right font-telugu">${planet.astrological.gemstone}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Metal:</td><td class="py-2 text-right font-telugu">${planet.astrological.metal}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Rasis Ruled:</td><td class="py-2 text-right">${planet.astrological.rulingRasis}</td></tr>
                <tr class="border-b border-slate-800/40"><td class="py-2 font-bold text-slate-400">Element:</td><td class="py-2 text-right font-telugu">${planet.astrological.element}</td></tr>
              </table>
            </div>
          </div>
        </div>

      </div>
    `;

    trackFragment.appendChild(slide);

    // Create slider dot indicator
    if (dotsContainer) {
      const dot = document.createElement("div");
      dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
      dot.setAttribute("data-index", index);
      dotsFragment.appendChild(dot);
    }
  });

  track.appendChild(trackFragment);
  if (dotsContainer) {
    dotsContainer.appendChild(dotsFragment);
    // Use event delegation for dots
    dotsContainer.addEventListener("click", (e) => {
      const dot = e.target.closest(".slider-dot");
      if (dot) {
        const index = parseInt(dot.getAttribute("data-index"));
        goToPlanetSlide(index);
      }
    });
  }

  // Attach tabs click logic using event delegation on the track
  track.addEventListener("click", (e) => {
    const btn = e.target.closest(".planet-tab");
    if (btn) {
      const targetId = btn.getAttribute("data-tab-target");
      const parentCard = btn.closest(".planet-card");
      
      // Remove active from sibling tabs
      parentCard.querySelectorAll(".planet-tab").forEach(tb => tb.classList.remove("active"));
      // Add active to current
      btn.classList.add("active");
      
      // Hide all tab contents
      parentCard.querySelectorAll(".tab-content").forEach(tc => tc.classList.remove("active"));
      // Show targeted content
      parentCard.querySelector(`#${targetId}`).classList.add("active");
    }
  });

  // Slider buttons triggers
  const prevBtn = document.getElementById("prev-slide");
  const nextBtn = document.getElementById("next-slide");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      let nextIndex = currentPlanetSlide - 1;
      if (nextIndex < 0) nextIndex = PLANETS_DATA.length - 1;
      goToPlanetSlide(nextIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      let nextIndex = currentPlanetSlide + 1;
      if (nextIndex >= PLANETS_DATA.length) nextIndex = 0;
      goToPlanetSlide(nextIndex);
    });
  }
}

function goToPlanetSlide(index) {
  const track = document.getElementById("slider-track");
  const slides = track.querySelectorAll(".slide-item");
  const dots = document.querySelectorAll(".slider-dot");
  
  if (index < 0 || index >= slides.length) return;

  currentPlanetSlide = index;

  // Move Track
  track.style.transform = `translateX(-${index * 100}%)`;

  // Update classes
  slides.forEach((sl, idx) => {
    if (idx === index) {
      sl.classList.add("active");
    } else {
      sl.classList.remove("active");
    }
  });

  dots.forEach((dt, idx) => {
    if (idx === index) {
      dt.classList.add("active");
    } else {
      dt.classList.remove("active");
    }
  });
}

// 5. 27 Nakshatras Grid
function initNakshatrasGrid() {
  const container = document.getElementById("stars-grid");
  const searchInput = document.getElementById("nakshatra-search");
  
  if (!container || !STARS_DATA) return;

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  STARS_DATA.forEach(star => {
    const card = document.createElement("div");
    card.className = "flip-card";
    card.setAttribute("data-name-en", star.nameEn.toLowerCase());
    card.setAttribute("data-name-te", star.nameTe.toLowerCase());
    card.setAttribute("data-planet", star.planet.toLowerCase());

    card.innerHTML = `
      <div class="flip-card-inner">
        <!-- Front Side -->
        <div class="flip-card-front glass glow-cyan">
          <div class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">Star #${star.id}</div>
          <h4 class="text-lg font-bold text-white font-telugu mb-1">${star.nameTe}</h4>
          <h5 class="text-xs text-slate-400 font-medium mb-3">${star.nameEn}</h5>
          
          <div class="border-t border-slate-800/40 w-full pt-2 mt-auto">
            <span class="text-[10px] text-slate-500 uppercase">Ruling Planet</span>
            <div class="text-xs font-semibold text-slate-300 font-telugu">${star.planet}</div>
          </div>
        </div>

        <!-- Back Side (Flipped) -->
        <div class="flip-card-back glass glow-gold">
          <div class="text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-2">Nakshatram Attributes</div>
          <div class="text-xs text-left text-slate-300 space-y-1.5 w-full flex-grow">
            <div><span class="font-bold text-slate-400">Deity:</span> <span class="font-telugu text-[13px]">${star.deity}</span></div>
            <div><span class="font-bold text-slate-400">Symbol:</span> <span class="font-telugu text-[13px]">${star.symbol}</span></div>
            <div class="leading-relaxed border-t border-slate-800/40 pt-1.5 mt-1.5"><span class="font-bold text-slate-400">Traits:</span> ${star.traits}</div>
          </div>
        </div>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  // Use event delegation for flipping cards
  container.addEventListener("click", (e) => {
    const card = e.target.closest(".flip-card");
    if (card) {
      card.classList.toggle("flipped");
    }
  });

  // Search logic
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const query = e.target.value.toLowerCase().trim();
        const cards = container.querySelectorAll(".flip-card");

        cards.forEach(card => {
          const nameEn = card.getAttribute("data-name-en");
          const nameTe = card.getAttribute("data-name-te");
          const planet = card.getAttribute("data-planet");

          if (nameEn.includes(query) || nameTe.includes(query) || planet.includes(query)) {
            card.style.display = "";
          } else {
            card.style.display = "none";
          }
        });
      }, 150); // Small debounce
    });
  }
}

// 6. 12 Zodiac Rasis Grid
function initRasisGrid() {
  const container = document.getElementById("rasis-grid");
  if (!container || !RAASI_DATA) return;

  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  RAASI_DATA.forEach(rasi => {
    const card = document.createElement("div");
    card.className = `rasi-card glass`;
    card.style.background = `linear-gradient(135deg, rgba(13, 13, 33, 0.7) 0%, rgba(3, 3, 12, 0.9) 100%)`;
    card.style.border = `1px solid rgba(255, 255, 255, 0.08)`;
    card.setAttribute("data-glow", rasi.glowColor || 'rgba(255,255,255,0.05)');

    // Extract emoji symbol
    const emojis = {
      Mesha: "♈", Vrishabha: "♉", Mithuna: "♊", Karka: "♋",
      Simha: "♌", Kanya: "♍", Tula: "♎", Vrishchika: "♏",
      Dhanu: "♐", Makara: "♑", Kumbha: "♒", Meena: "♓"
    };

    card.innerHTML = `
      <div class="rasi-top">
        <div>
          <span class="text-[10px] text-gold-400 font-bold uppercase tracking-wider mb-1">Rasi #${rasi.id}</span>
          <h4 class="text-lg font-bold text-white font-telugu leading-tight mt-0.5">${rasi.nameTe}</h4>
        </div>
        <span class="rasi-symbol">${emojis[rasi.nameEn] || "✨"}</span>
      </div>

      <div class="text-xs text-slate-400 space-y-1 my-3">
        <div><span class="font-bold text-slate-500">Ruling Lord:</span> <span class="font-telugu text-[13px] text-slate-300">${rasi.lordTe} / ${rasi.lordEn}</span></div>
        <div><span class="font-bold text-slate-500">Element:</span> <span class="font-telugu text-slate-300">${rasi.element}</span></div>
        <div><span class="font-bold text-slate-500">Symbol:</span> <span class="font-telugu text-[13px] text-slate-300">${rasi.symbol}</span></div>
      </div>

      <p class="text-[11px] leading-relaxed text-slate-300 border-t border-slate-800/40 pt-2.5 mt-auto">
        ${rasi.traits}
      </p>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  // Use event delegation for hover effects
  container.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".rasi-card");
    if (card) {
      const glowColor = card.getAttribute("data-glow");
      card.style.boxShadow = `0 8px 30px ${glowColor}`;
      card.style.borderColor = glowColor.replace("0.4", "0.2");
    }
  });

  container.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".rasi-card");
    if (card) {
      card.style.boxShadow = "none";
      card.style.borderColor = "rgba(255, 255, 255, 0.08)";
    }
  });
}
