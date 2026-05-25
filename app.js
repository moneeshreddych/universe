/* ==========================================================================
   NASA EYES PORTAL - MISSION CONTROL APP LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // UI Elements
    // ----------------------------------------------------------------------
    const iframe = document.getElementById('nasa-eyes-iframe');
    const iframeLoader = document.getElementById('iframe-loader');
    const viewportTitleName = document.getElementById('current-viewport-name');
    const planetaryPanel = document.getElementById('planetary-panel');
    const planetaryGrid = document.getElementById('planetary-grid');
    const planetaryTimestamp = document.getElementById('planetary-timestamp');
    const teluguCalendarPanel = document.getElementById('telugu-calendar-panel');
    const teluguDateInput = document.getElementById('telugu-date-input');
    const btnTeluguToday = document.getElementById('btn-telugu-today');
    const teluguDateTitle = document.getElementById('telugu-date-title');
    const teluguDateSubtitle = document.getElementById('telugu-date-subtitle');
    const teluguTithiTitle = document.getElementById('telugu-tithi-title');
    const teluguTithiEnd = document.getElementById('telugu-tithi-end');
    const teluguGrid = document.getElementById('telugu-grid');
    
    // Control Buttons
    const btnRefresh = document.getElementById('btn-refresh');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    
    const btnAmbientAudio = document.getElementById('btn-ambient-audio');
    const btnSoundEffects = document.getElementById('btn-sound-effects');
    
    // Telemetry display panels
    const telemetryUtc = document.getElementById('telemetry-utc');
    const telemetryLocation = document.getElementById('telemetry-location');

    // Collapsible sidebars and drawer elements
    const btnHamburgerMenu = document.getElementById('btn-hamburger-menu');
    const hamburgerDrawer = document.getElementById('hamburger-drawer');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');
    const drawerBackdrop = document.getElementById('drawer-backdrop');
    const drawerTabs = document.querySelectorAll('.drawer-tab');

    const solarSystemUrl = 'https://eyes.nasa.gov/apps/solar-system/#/home?embed=true';
    let activeView = 'solar-system';
    let selectedTeluguDate = new Date();

    // ----------------------------------------------------------------------
    // Web Audio Synthesizer (No external assets required!)
    // ----------------------------------------------------------------------
    let audioCtx = null;
    let ambientOsc = null;
    let ambientFilter = null;
    let ambientGain = null;
    
    let isAmbientOn = false;
    let isSfxOn = true;

    // Initialize Web Audio Context
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Play UI click bleep
    function playBeep(freq = 1200, duration = 0.08, type = 'sine') {
        if (!isSfxOn) return;
        try {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            // Sweep frequency slightly for a nicer synth UI feel
            osc.frequency.exponentialRampToValueAtTime(freq / 2, audioCtx.currentTime + duration);
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.error('Audio beep failed', e);
        }
    }

    // Play low sweeps for state changes
    function playSweep() {
        if (!isSfxOn) return;
        try {
            initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(80, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
            
            // Add bandpass filter to make it softer and sweepier
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(200, audioCtx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.3);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            console.error('Audio sweep failed', e);
        }
    }

    // Play error beep
    function playErrorBeep() {
        if (!isSfxOn) return;
        playBeep(450, 0.15, 'sawtooth');
        setTimeout(() => playBeep(350, 0.15, 'sawtooth'), 80);
    }

    // Toggle Looping Space Ambient Hum
    function toggleAmbientHum() {
        initAudio();
        
        if (isAmbientOn) {
            // Turn off
            if (ambientGain) {
                ambientGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
                setTimeout(() => {
                    if (ambientOsc) {
                        ambientOsc.stop();
                        ambientOsc.disconnect();
                    }
                    ambientOsc = null;
                }, 600);
            }
            isAmbientOn = false;
            btnAmbientAudio.classList.remove('active');
            btnAmbientAudio.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> AMBIENT HUM`;
            addConsoleLog('Ambient telemetry hum disabled.', 'info');
        } else {
            // Turn on
            try {
                ambientOsc = audioCtx.createOscillator();
                ambientFilter = audioCtx.createBiquadFilter();
                ambientGain = audioCtx.createGain();
                
                // Deep low space frequency (55Hz / A1 note)
                ambientOsc.type = 'sawtooth';
                ambientOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
                
                // Add LFO (low-freq oscillator) to modulate pitch for a rich "engine hum" feel
                const lfo = audioCtx.createOscillator();
                const lfoGain = audioCtx.createGain();
                lfo.frequency.value = 0.25; // 0.25Hz modulation (very slow)
                lfoGain.gain.value = 0.8; // subtle vibrato
                lfo.connect(lfoGain);
                lfoGain.connect(ambientOsc.frequency);
                lfo.start();

                // Connect to a lowpass filter to remove harsh highs
                ambientFilter.type = 'lowpass';
                ambientFilter.frequency.setValueAtTime(90, audioCtx.currentTime);
                
                // Set gain
                ambientGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
                ambientGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1.0); // smooth fade in
                
                ambientOsc.connect(ambientFilter);
                ambientFilter.connect(ambientGain);
                ambientGain.connect(audioCtx.destination);
                
                ambientOsc.start();
                isAmbientOn = true;
                btnAmbientAudio.classList.add('active');
                btnAmbientAudio.innerHTML = `<i class="fa-solid fa-volume-high"></i> AMBIENT HUM`;
                addConsoleLog('Ambient space telemetry feed online (Low Freq).', 'info');
            } catch (e) {
                console.error('Ambient audio setup failed', e);
            }
        }
    }

    // Toggle SFX Setting
    btnSoundEffects.addEventListener('click', () => {
        isSfxOn = !isSfxOn;
        if (isSfxOn) {
            btnSoundEffects.innerHTML = `<i class="fa-solid fa-volume-high"></i> SFX: ON`;
            btnSoundEffects.classList.add('active');
            playBeep(800, 0.05);
        } else {
            btnSoundEffects.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> SFX: OFF`;
            btnSoundEffects.classList.remove('active');
        }
    });

    btnAmbientAudio.addEventListener('click', () => {
        playBeep(800, 0.05);
        toggleAmbientHum();
    });

    // ----------------------------------------------------------------------
    // Dynamic Canvas Starfield
    // ----------------------------------------------------------------------
    const canvas = document.getElementById('starfield-canvas');
    const ctx = canvas.getContext('2d');
    let stars = [];
    const numStars = 100;
    
    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        initStars();
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.2 + 0.2,
                color: `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`,
                speed: Math.random() * 0.08 + 0.02
            });
        }
    }

    function animateStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        stars.forEach(star => {
            // Draw Star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.fill();
            
            // Drift star downwards/leftwards for organic floating movement
            star.y += star.speed;
            star.x -= star.speed * 0.3;
            
            // Wrap stars when they drift off-canvas
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
            if (star.x < 0) {
                star.x = canvas.width;
                star.y = Math.random() * canvas.height;
            }
        });
        
        requestAnimationFrame(animateStars);
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(animateStars);

    // ----------------------------------------------------------------------
    // Telemetry Header Updates
    // ----------------------------------------------------------------------
    function updateHeaderTelemetry() {
        const now = new Date();
        telemetryUtc.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
        
        // Randomly simulate small GPS coordinates shift to look alive
        const lat = (34.2012 + (Math.random() - 0.5) * 0.0002).toFixed(4);
        const lon = (-118.1714 + (Math.random() - 0.5) * 0.0002).toFixed(4);
        telemetryLocation.textContent = `${lat}° N, ${lon}° W`; // JPL Coordinates approx
    }
    setInterval(updateHeaderTelemetry, 1000);
    updateHeaderTelemetry();

    // ----------------------------------------------------------------------
    // Menu Deck View Tabs
    // ----------------------------------------------------------------------
    const planets = [
        { name: 'Mercury', period: 87.969, distance: '0.39 AU', signal: 'INNER TRACK' },
        { name: 'Venus', period: 224.701, distance: '0.72 AU', signal: 'INNER TRACK' },
        { name: 'Earth', period: 365.256, distance: '1.00 AU', signal: 'REFERENCE' },
        { name: 'Moon', period: 27.321, distance: '384,400 KM', signal: 'LUNAR TRACK' },
        { name: 'Mars', period: 686.98, distance: '1.52 AU', signal: 'TRANSFER ARC' },
        { name: 'Jupiter', period: 4332.59, distance: '5.20 AU', signal: 'OUTER TRACK' },
        { name: 'Saturn', period: 10759.22, distance: '9.58 AU', signal: 'OUTER TRACK' },
        { name: 'Uranus', period: 30688.5, distance: '19.2 AU', signal: 'DEEP TRACK' },
        { name: 'Neptune', period: 60182, distance: '30.1 AU', signal: 'DEEP TRACK' }
    ];

    function getPlanetLongitude(planet, now) {
        const epoch = Date.UTC(2026, 0, 1);
        const elapsedDays = (now.getTime() - epoch) / 86400000;
        const longitude = (elapsedDays / planet.period * 360) % 360;
        return longitude < 0 ? longitude + 360 : longitude;
    }

    function renderPlanetaryPositions() {
        const now = new Date();
        planetaryTimestamp.textContent = `${now.toISOString().replace('T', ' ').substring(0, 19)} UTC`;
        planetaryGrid.innerHTML = planets.map(planet => {
            const longitude = getPlanetLongitude(planet, now);
            return `
                <article class="planet-card">
                    <div class="planet-orbit">
                        <span class="planet-marker" style="transform: rotate(${longitude.toFixed(2)}deg) translateX(34px);"></span>
                    </div>
                    <div class="planet-readout">
                        <h3>${planet.name}</h3>
                        <dl>
                            <div>
                                <dt>ECL LONG</dt>
                                <dd>${longitude.toFixed(1)} DEG</dd>
                            </div>
                            <div>
                                <dt>MEAN DIST</dt>
                                <dd>${planet.distance}</dd>
                            </div>
                            <div>
                                <dt>TRACK</dt>
                                <dd>${planet.signal}</dd>
                            </div>
                        </dl>
                    </div>
                </article>
            `;
        }).join('');
    }

    const tithiNames = [
        'Padyami', 'Vidiya', 'Tadiya', 'Chavithi', 'Panchami',
        'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dasami',
        'Ekadasi', 'Dwadasi', 'Trayodasi', 'Chaturdasi', 'Pournami'
    ];

    const masamNames = [
        'Chaitramu', 'Vaisakhamu', 'Jyeshthamu', 'Ashadhamu',
        'Shravanamu', 'Bhadrapadamu', 'Ashwayujamu', 'Karthikamu',
        'Margashiramu', 'Pushyamu', 'Maghamu', 'Phalgunamu'
    ];

    const nakshatraNames = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Arudra',
        'Punarvasu', 'Pushyami', 'Ashlesha', 'Magha', 'Pubba', 'Uttara',
        'Hasta', 'Chitta', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Moola', 'Purvashada', 'Uttarashada', 'Shravana', 'Dhanishta',
        'Shatabhisha', 'Purvabhadra', 'Uttarabhadra', 'Revati'
    ];

    const weekdayNames = [
        'Aadivaram', 'Somavaram', 'Mangalavaram', 'Budhavaram',
        'Guruvaram', 'Sukravaram', 'Sanivaram'
    ];

    const samvatsaraNames = [
        'Prabhava', 'Vibhava', 'Shukla', 'Pramoduta', 'Prajothpatti',
        'Angirasa', 'Shrimukha', 'Bhava', 'Yuva', 'Dhata', 'Ishvara',
        'Bahudhanya', 'Pramathi', 'Vikrama', 'Vrisha', 'Chitrabhanu',
        'Svabhanu', 'Tarana', 'Parthiva', 'Vyaya', 'Sarvajit', 'Sarvadhari',
        'Virodhi', 'Vikriti', 'Khara', 'Nandana', 'Vijaya', 'Jaya',
        'Manmatha', 'Durmukhi', 'Hevilambi', 'Vilambi', 'Vikari',
        'Sharvari', 'Plava', 'Shubhakrit', 'Shobhakrit', 'Krodhi',
        'Vishvavasu', 'Parabhava', 'Plavanga', 'Kilaka', 'Saumya',
        'Sadharana', 'Virodhikrit', 'Paridhavi', 'Pramadi', 'Ananda',
        'Rakshasa', 'Nala', 'Pingala', 'Kalayukti', 'Siddharthi',
        'Raudra', 'Durmati', 'Dundubhi', 'Rudhirodgari', 'Raktakshi',
        'Krodhana', 'Akshaya'
    ];

    function normalizeDegrees(value) {
        return ((value % 360) + 360) % 360;
    }

    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    function daysSinceJ2000(date) {
        return (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    }

    function getSunLongitude(date) {
        const days = daysSinceJ2000(date);
        const meanLongitude = normalizeDegrees(280.459 + 0.98564736 * days);
        const meanAnomaly = normalizeDegrees(357.529 + 0.98560028 * days);
        return normalizeDegrees(
            meanLongitude +
            1.915 * Math.sin(toRadians(meanAnomaly)) +
            0.020 * Math.sin(toRadians(2 * meanAnomaly))
        );
    }

    function getMoonLongitude(date) {
        if (window.Astronomy?.EclipticGeoMoon) {
            return normalizeDegrees(window.Astronomy.EclipticGeoMoon(date).lon);
        }

        const days = daysSinceJ2000(date);
        const meanLongitude = normalizeDegrees(218.316 + 13.176396 * days);
        const moonAnomaly = normalizeDegrees(134.963 + 13.064993 * days);
        const sunAnomaly = normalizeDegrees(357.529 + 0.98560028 * days);
        const elongation = normalizeDegrees(297.850 + 12.190749 * days);
        const argumentLatitude = normalizeDegrees(93.272 + 13.229350 * days);

        return normalizeDegrees(
            meanLongitude +
            6.289 * Math.sin(toRadians(moonAnomaly)) +
            1.274 * Math.sin(toRadians(2 * elongation - moonAnomaly)) +
            0.658 * Math.sin(toRadians(2 * elongation)) +
            0.214 * Math.sin(toRadians(2 * moonAnomaly)) -
            0.186 * Math.sin(toRadians(sunAnomaly)) -
            0.114 * Math.sin(toRadians(2 * argumentLatitude))
        );
    }

    function getLahiriAyanamsa(date) {
        const year = date.getUTCFullYear() + (date.getUTCMonth() + 0.5) / 12;
        return 23.85675 + 0.013968 * (year - 2000);
    }

    function getSiderealLongitude(tropicalLongitude, date) {
        return normalizeDegrees(tropicalLongitude - getLahiriAyanamsa(date));
    }

    function getLunarPhase(date) {
        if (window.Astronomy?.MoonPhase) {
            return normalizeDegrees(window.Astronomy.MoonPhase(date));
        }

        return normalizeDegrees(getMoonLongitude(date) - getSunLongitude(date));
    }

    function getUnwrappedPhase(date, referencePhase) {
        let phase = getLunarPhase(date);
        while (phase < referencePhase - 2) phase += 360;
        return phase;
    }

    function findTithiEnd(date, phaseNow) {
        const tithiProgress = phaseNow % 12;
        const targetPhase = phaseNow + (12 - tithiProgress);
        let low = new Date(date);
        let high = new Date(date.getTime() + 36 * 60 * 60 * 1000);

        while (getUnwrappedPhase(high, phaseNow) < targetPhase) {
            high = new Date(high.getTime() + 12 * 60 * 60 * 1000);
        }

        for (let i = 0; i < 36; i++) {
            const mid = new Date((low.getTime() + high.getTime()) / 2);
            if (getUnwrappedPhase(mid, phaseNow) < targetPhase) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return high;
    }

    function findPreviousNewMoon(date, phaseNow) {
        const estimatedTime = date.getTime() - (phaseNow / 12.19075) * 86400000;
        let low = new Date(estimatedTime - 2 * 86400000);
        let high = new Date(estimatedTime + 2 * 86400000);

        for (let i = 0; i < 44; i++) {
            const mid = new Date((low.getTime() + high.getTime()) / 2);
            const signedPhase = getLunarPhase(mid) < 180 ? getLunarPhase(mid) : getLunarPhase(mid) - 360;
            if (signedPhase < 0) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return high;
    }

    function getTeluguMasam(newMoonDate) {
        const sunSidereal = getSiderealLongitude(getSunLongitude(newMoonDate), newMoonDate);
        const sunRasi = Math.floor(sunSidereal / 30);
        const masamIndex = (sunRasi + 1) % 12;
        return masamNames[masamIndex];
    }

    function getUgadiDate(year) {
        let probe = new Date(Date.UTC(year, 2, 31, 6));
        for (let i = 0; i < 45; i++) {
            const phase = getLunarPhase(probe);
            const newMoon = findPreviousNewMoon(probe, phase);
            if (getTeluguMasam(newMoon) === 'Chaitramu' && newMoon.getUTCMonth() >= 1 && newMoon.getUTCMonth() <= 3) {
                return new Date(newMoon.getTime() + 12 * 60 * 60 * 1000);
            }
            probe = new Date(probe.getTime() + 86400000);
        }
        return new Date(Date.UTC(year, 2, 22, 0));
    }

    function getSamvatsaram(date) {
        let teluguYear = date.getFullYear();
        if (date < getUgadiDate(teluguYear)) {
            teluguYear -= 1;
        }
        return samvatsaraNames[((teluguYear - 1987) % 60 + 60) % 60];
    }

    function formatIst(date) {
        return date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function toDatetimeLocalValue(date) {
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
    }

    function renderTeluguCalendar(date = selectedTeluguDate) {
        selectedTeluguDate = new Date(date);
        teluguDateInput.value = toDatetimeLocalValue(selectedTeluguDate);

        const phase = getLunarPhase(selectedTeluguDate);
        const tithiNumber = Math.floor(phase / 12) + 1;
        const paksha = tithiNumber <= 15 ? 'Shukla Paksham' : 'Krishna Paksham';
        const tithiBaseName = tithiNumber === 30 ? 'Amavasya' : tithiNames[(tithiNumber - 1) % 15];
        const tithiDisplay = `${paksha} ${tithiBaseName}`;
        const tithiEndDate = findTithiEnd(selectedTeluguDate, phase);
        const previousNewMoon = findPreviousNewMoon(selectedTeluguDate, phase);
        const masam = getTeluguMasam(previousNewMoon);
        const moonSidereal = getSiderealLongitude(getMoonLongitude(selectedTeluguDate), selectedTeluguDate);
        const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
        const nakshatraPada = Math.floor((moonSidereal % (360 / 27)) / (360 / 108)) + 1;
        const samvatsaram = getSamvatsaram(selectedTeluguDate);

        teluguDateTitle.textContent = `${masam} - ${tithiBaseName}`;
        teluguDateSubtitle.textContent = `${samvatsaram} Samvatsaram / Hyderabad IST`;
        teluguTithiTitle.textContent = tithiDisplay;
        teluguTithiEnd.textContent = `Ends: ${formatIst(tithiEndDate)}`;

        const details = [
            ['Masam', masam],
            ['Paksham', paksha],
            ['Tithi Number', `${tithiNumber} / 30`],
            ['Nakshatram', `${nakshatraNames[nakshatraIndex]} - Pada ${nakshatraPada}`],
            ['Vaaram', weekdayNames[selectedTeluguDate.getDay()]],
            ['Samvatsaram', samvatsaram],
            ['Moon Longitude', `${moonSidereal.toFixed(2)} DEG sidereal`],
            ['Sun Longitude', `${getSiderealLongitude(getSunLongitude(selectedTeluguDate), selectedTeluguDate).toFixed(2)} DEG sidereal`]
        ];

        teluguGrid.innerHTML = details.map(([label, value]) => `
            <article class="telugu-card">
                <span>${label}</span>
                <strong>${value}</strong>
            </article>
        `).join('');
    }

    function setActiveDrawerTab(viewName) {
        drawerTabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-view') === viewName);
        });
    }

    function showSolarSystemView() {
        activeView = 'solar-system';
        setActiveDrawerTab(activeView);
        viewportTitleName.textContent = 'Solar System';
        planetaryPanel.classList.add('hidden');
        teluguCalendarPanel.classList.add('hidden');
        iframe.classList.remove('hidden');

        if (iframe.src !== solarSystemUrl) {
            iframeLoader.classList.remove('hidden');
            iframe.classList.remove('loaded');
            iframe.src = solarSystemUrl;
        }

        addConsoleLog('Solar System viewport restored.', 'action');
    }

    function showPlanetaryPositions() {
        activeView = 'planetary-positions';
        setActiveDrawerTab(activeView);
        viewportTitleName.textContent = 'Planetary Positions';
        iframe.classList.add('hidden');
        iframeLoader.classList.add('hidden');
        teluguCalendarPanel.classList.add('hidden');
        planetaryPanel.classList.remove('hidden');
        renderPlanetaryPositions();
        addConsoleLog('Planetary position grid synchronized.', 'action');
    }

    function showTeluguCalendar() {
        activeView = 'telugu-calendar';
        setActiveDrawerTab(activeView);
        viewportTitleName.textContent = 'Telugu Calendar';
        iframe.classList.add('hidden');
        iframeLoader.classList.add('hidden');
        planetaryPanel.classList.add('hidden');
        teluguCalendarPanel.classList.remove('hidden');
        renderTeluguCalendar(selectedTeluguDate);
        addConsoleLog('Telugu panchangam calendar synchronized.', 'action');
    }

    drawerTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            playBeep(1000, 0.06);
            const viewName = tab.getAttribute('data-view');
            if (viewName === 'planetary-positions') {
                showPlanetaryPositions();
            } else if (viewName === 'telugu-calendar') {
                showTeluguCalendar();
            } else {
                showSolarSystemView();
            }
            setTimeout(closeDrawer, 300);
        });
    });

    // Handle Iframe Load Completed
    iframe.addEventListener('load', () => {
        if (activeView !== 'solar-system') return;
        iframeLoader.classList.add('hidden');
        iframe.classList.add('loaded');
        addConsoleLog(`Telemetry link locked. Displaying visualization deck.`, 'info');
        playBeep(950, 0.1);
    });

    // Refresh action
    btnRefresh.addEventListener('click', () => {
        playBeep(700, 0.08);
        if (activeView === 'planetary-positions') {
            renderPlanetaryPositions();
            addConsoleLog(`Refreshing planetary position calculations...`, 'action');
            return;
        }
        if (activeView === 'telugu-calendar') {
            renderTeluguCalendar(selectedTeluguDate);
            addConsoleLog(`Refreshing Telugu panchangam calculations...`, 'action');
            return;
        }

        iframeLoader.classList.remove('hidden');
        iframe.classList.remove('loaded');
        addConsoleLog(`Refreshing active telemetry link...`, 'action');
        iframe.src = iframe.src;
    });

    // Fullscreen action
    btnFullscreen.addEventListener('click', () => {
        playBeep(850, 0.08);
        const container = document.getElementById('iframe-container');
        
        if (!document.fullscreenElement) {
            container.requestFullscreen().then(() => {
                addConsoleLog(`Viewport expanded to IMAX telemetry screen.`, 'info');
            }).catch(err => {
                playErrorBeep();
                addConsoleLog(`IMAX viewport expansion failed: ${err.message}`, 'warn');
            });
        } else {
            document.exitFullscreen();
        }
    });
    
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            addConsoleLog(`Viewport returned to nominal grid sizing.`, 'info');
        }
    });

    function addConsoleLog(message, type = 'info') {
        const now = new Date();
        const hrs = String(now.getUTCHours()).padStart(2, '0');
        const mins = String(now.getUTCMinutes()).padStart(2, '0');
        const secs = String(now.getUTCSeconds()).padStart(2, '0');
        console.log(`[${hrs}:${mins}:${secs}] [Telemetry - ${type.toUpperCase()}]: ${message}`);
    }

    // Populate initial logs
    addConsoleLog("Booting dashboard systems... Kernel v9.42-NASA", "info");
    addConsoleLog("Establishing secure handshake with JPL Telemetry server.", "action");
    setTimeout(() => {
        addConsoleLog("Handshake verified. Remote telemetry sync enabled.", "info");
    }, 800);
    setTimeout(() => {
        addConsoleLog("Solar System visualization rendering starting...", "action");
    }, 1200);
    // ----------------------------------------------------------------------
    // Hamburger Menu Drawer Handlers
    // ----------------------------------------------------------------------
    function openDrawer() {
        playSweep();
        hamburgerDrawer.classList.add('open');
        drawerBackdrop.classList.add('show');
        addConsoleLog("Handshake established with Drawer Menu Deck.", "action");
    }

    function closeDrawer() {
        playBeep(800, 0.06);
        hamburgerDrawer.classList.remove('open');
        drawerBackdrop.classList.remove('show');
        addConsoleLog("Handshake terminated with Drawer Menu Deck.", "info");
    }

    btnHamburgerMenu.addEventListener('click', openDrawer);
    btnCloseDrawer.addEventListener('click', closeDrawer);
    drawerBackdrop.addEventListener('click', closeDrawer);

    teluguDateInput.addEventListener('change', () => {
        renderTeluguCalendar(new Date(teluguDateInput.value));
        playBeep(950, 0.06);
    });

    btnTeluguToday.addEventListener('click', () => {
        renderTeluguCalendar(new Date());
        playBeep(950, 0.06);
    });

    // Prevent links from closing drawer immediately, but close after a tiny delay
    const externalLinks = document.querySelectorAll('.drawer-links a:not(.drawer-tab)');
    externalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            playBeep(1000, 0.06);
            if (!link.getAttribute('target')) {
                setTimeout(closeDrawer, 300);
            }
        });
    });

    // Telemetry handshake verified
    addConsoleLog("Telemetry system connection stable.", "info");
});
