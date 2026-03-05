// ==========================================
// ODAKLANMA UYGULAMASI - ANA MOTOR
// ==========================================

class UIManager {
    constructor() {
        this.menuItems = document.querySelectorAll('.sidebar li');
        this.views = {
            'Home': document.getElementById('clock-view'),
            'Stopwatch': document.getElementById('stopwatch-view'),
            'Timer': document.getElementById('timer-view'),
            'Alarm Clock': document.getElementById('alarm-view'),
            'World Clock': document.getElementById('world-clock-view'),
            'Birth Chart': document.getElementById('birth-chart-view')
        };
        this.mainClockView = document.getElementById('clock-view');
        
        this.initNavigation();
        this.initAccordion();
        this.initFullscreen(); 
    }

    initAccordion() {
        const accBtns = document.querySelectorAll('.accordion-btn');
        accBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget;
                const content = targetBtn.nextElementSibling;
                const parentContent = targetBtn.closest('.accordion-content');

                accBtns.forEach(otherBtn => {
                    if (otherBtn !== targetBtn && otherBtn.classList.contains('open')) {
                        if (parentContent && otherBtn.nextElementSibling === parentContent) {
                            return; 
                        }
                        otherBtn.classList.remove('open');
                        otherBtn.nextElementSibling.classList.remove('show');
                    }
                });

                targetBtn.classList.toggle('open');
                content.classList.toggle('show');
            });
        });
    }

    initFullscreen() {
        const fsBtn = document.getElementById('btn-fullscreen');
        if (!fsBtn) return;

        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) { 
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) { 
                    document.documentElement.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { 
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { 
                    document.msExitFullscreen();
                }
            }
        });

        const toggleFullscreenClasses = () => {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                document.body.classList.add('fullscreen-mode'); 
                fsBtn.innerText = "⛶ Minimize";
            } else {
                document.body.classList.remove('fullscreen-mode'); 
                fsBtn.innerText = "⛶ Fullscreen";
            }
        };

        document.addEventListener('fullscreenchange', toggleFullscreenClasses);
        document.addEventListener('webkitfullscreenchange', toggleFullscreenClasses);
    }

    initNavigation() {
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                this.menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                Object.values(this.views).forEach(view => {
                    if (view) view.classList.add('hidden');
                });
                if (this.mainClockView) this.mainClockView.classList.add('hidden');

                const featureName = item.innerText.replace('⇥', '').replace(' ', '').trim();
                let actualName = "Home";
                if(item.innerText.includes('Stopwatch')) actualName = 'Stopwatch';
                if(item.innerText.includes('Timer')) actualName = 'Timer';
                if(item.innerText.includes('Alarm Clock')) actualName = 'Alarm Clock';
                if(item.innerText.includes('World Clock')) actualName = 'World Clock';
                if(item.innerText.includes('Birth Chart')) actualName = 'Birth Chart';

                if (this.views[actualName]) {
                    this.views[actualName].classList.remove('hidden');
                } else if (this.mainClockView) {
                    this.mainClockView.classList.remove('hidden');
                }
            });
        });
    }

    static openTab(evt, tabName) {
        let tabcontent = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
        
        let tablinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        
        document.getElementById(tabName).style.display = "block";
        if(evt) evt.currentTarget.className += " active";
    }
}

class ClockManager {
    constructor() {
        this.timeDisplay = document.getElementById('time-display');
        this.dateDisplay = document.getElementById('date-display');
        this.startClock();
        this.startWorldClock();
    }

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            if (this.timeDisplay) this.timeDisplay.innerText = `${hours}:${minutes}:${seconds}`;

            const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            if (this.dateDisplay) this.dateDisplay.innerText = now.toLocaleDateString('en-GB', options);
        };
        setInterval(updateClock, 1000);
        updateClock();
    }

    startWorldClock() {
        const updateWorldClock = () => {
            const now = new Date();
            const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

            const setTime = (id, locale, timeZone) => {
                const el = document.getElementById(id);
                if (el) el.innerText = now.toLocaleTimeString(locale, { timeZone, ...options });
            };

            const wcLocal = document.getElementById('wc-local');
            if (wcLocal) wcLocal.innerText = now.toLocaleTimeString([], options);

            setTime('wc-istanbul', 'tr-TR', 'Europe/Istanbul');
            setTime('wc-newyork', 'en-US', 'America/New_York');
            setTime('wc-london', 'en-GB', 'Europe/London');
            setTime('wc-tokyo', 'ja-JP', 'Asia/Tokyo'); 
        };
        setInterval(updateWorldClock, 1000);
        updateWorldClock();
    }
}

class StopwatchManager {
    constructor() {
        this.display = document.getElementById('sw-display');
        this.lapsContainer = document.getElementById('laps-container');
        this.interval = null;
        this.elapsedTime = 0;
        this.startTime = 0; 
        this.running = false;
        this.lapCounter = 1;
        this.initButtons();
    }

    formatTime(diff) {
        let seconds = Math.floor((diff / 1000) % 60);
        let minutes = Math.floor((diff / (1000 * 60)) % 60);
        let hours = Math.floor((diff / (1000 * 60 * 60)));
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    initButtons() {
        document.getElementById('btn-start')?.addEventListener('click', () => {
            if (!this.running) {
                this.startTime = Date.now() - this.elapsedTime; 
                this.interval = setInterval(() => {
                    this.elapsedTime = Date.now() - this.startTime; 
                    this.display.innerText = this.formatTime(this.elapsedTime);
                }, 10);
                this.running = true;
            }
        });
        
        document.getElementById('btn-stop')?.addEventListener('click', () => {
            clearInterval(this.interval);
            this.running = false;
        });
        
        document.getElementById('btn-lap')?.addEventListener('click', () => {
            if (!this.running) return;
            const lapItem = document.createElement('div');
            lapItem.innerText = `Lap ${this.lapCounter}: ${this.formatTime(this.elapsedTime)}`;
            lapItem.style.cssText = "padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #ccc;";
            this.lapsContainer.prepend(lapItem);
            this.lapCounter++;
        });
        
        document.getElementById('btn-reset')?.addEventListener('click', () => {
            clearInterval(this.interval);
            this.running = false;
            this.elapsedTime = 0;
            this.display.innerText = "00:00:00";
            this.lapsContainer.innerHTML = "";
            this.lapCounter = 1;
        });
    }
}

class TimerManager {
    constructor() {
        this.display = document.getElementById('timer-display');
        this.inputHour = document.getElementById('timer-input-hour');
        this.inputMin = document.getElementById('timer-input-min');
        this.inputSec = document.getElementById('timer-input-sec');
        
        this.audio = document.getElementById('audio-alarm'); 
        this.uiCreditBox = document.getElementById('timer-credit-box');
        
        this.interval = null;
        this.totalSeconds = 0;
        this.remainingSeconds = 0; 
        this.running = false;
        this.isPaused = false; 
        
        this.initButtons();
    }

    initButtons() {
        document.getElementById('btn-timer-start')?.addEventListener('click', () => {
            if (this.running) return;
            
            if (this.isPaused && this.remainingSeconds > 0) {
                this.totalSeconds = this.remainingSeconds;
                this.isPaused = false;
            } else {
                let hour = parseInt(this.inputHour.value) || 0;
                let min = parseInt(this.inputMin.value) || 0;
                let sec = parseInt(this.inputSec.value) || 0;
                this.totalSeconds = (hour * 3600) + (min * 60) + sec;
            }

            if (this.totalSeconds <= 0) return; 

            this.running = true;
            const endTime = Date.now() + (this.totalSeconds * 1000); 

            this.interval = setInterval(() => {
                this.remainingSeconds = Math.round((endTime - Date.now()) / 1000);

                if (this.remainingSeconds <= 0) {
                    clearInterval(this.interval);
                    this.running = false;
                    this.isPaused = false;
                    
                    this.display.innerText = "TIME IS UP!";
                    this.display.style.color = "#ff4444"; 
                    this.display.style.textShadow = "0 0 15px rgba(255, 68, 68, 0.8)";

                    if(this.uiCreditBox) this.uiCreditBox.style.display = 'block';
                    
                    if(this.audio) {
                        this.audio.currentTime = 0;
                        this.audio.play();
                    }
                    return;
                }

                let h = Math.floor(this.remainingSeconds / 3600);
                let m = Math.floor((this.remainingSeconds % 3600) / 60);
                let s = this.remainingSeconds % 60;
                this.display.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }, 1000);
        });

        document.getElementById('btn-timer-pause')?.addEventListener('click', () => {
            if(this.uiCreditBox) this.uiCreditBox.style.display = 'none';

            if(this.audio && !this.audio.paused) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.display.style.color = "white"; 
                this.display.style.textShadow = "1px 1px 5px rgba(0,0,0,0.6)";
                this.display.innerText = "00:00:00";
            }

            if (this.running) {
                clearInterval(this.interval);
                this.running = false;
                this.isPaused = true;
            }
        });

        document.getElementById('btn-timer-reset')?.addEventListener('click', () => {
            clearInterval(this.interval);
            this.running = false;
            this.isPaused = false;
            this.remainingSeconds = 0;
            
            this.display.innerText = "00:00:00";
            this.display.style.color = "white";
            this.display.style.textShadow = "1px 1px 5px rgba(0,0,0,0.6)";

            if(this.uiCreditBox) this.uiCreditBox.style.display = 'none';
            
            if(this.audio) { 
                this.audio.pause(); 
                this.audio.currentTime = 0; 
            }
            
            if(this.inputHour) this.inputHour.value = "";
            if(this.inputMin) this.inputMin.value = "";
            if(this.inputSec) this.inputSec.value = "";
        });
    }
}

class AlarmManager {
    constructor() {
        this.alarmTimeout = null;
        this.audio = document.getElementById('audio-alarm'); 
        this.uiCreditBox = document.getElementById('alarm-credit-box'); 
        
        this.uiTimeInput = document.getElementById('alarm-time-input');
        this.uiSetBtn = document.getElementById('btn-set-alarm');
        this.uiCancelBtn = document.getElementById('btn-cancel-alarm');
        this.uiStatus = document.getElementById('alarm-status');
        this.uiControls = document.getElementById('alarm-controls');
        
        if(this.uiSetBtn) this.uiSetBtn.addEventListener('click', () => this.setAlarm());
        if(this.uiCancelBtn) this.uiCancelBtn.addEventListener('click', () => this.cancelAlarm());
        if(document.getElementById('btn-snooze')) document.getElementById('btn-snooze').addEventListener('click', () => this.snoozeAlarm());
        if(document.getElementById('btn-dismiss')) document.getElementById('btn-dismiss').addEventListener('click', () => this.dismissAlarm());
    }
    
    setAlarm() {
        if(!this.uiTimeInput.value) return alert("Please select a time!");
        
        const now = new Date();
        const [hours, minutes] = this.uiTimeInput.value.split(':');
        let alarmDate = new Date();
        alarmDate.setHours(hours, minutes, 0, 0);
        
        if (alarmDate <= now) alarmDate.setDate(alarmDate.getDate() + 1); 
        
        const timeToAlarm = alarmDate.getTime() - now.getTime();
        if(this.alarmTimeout) clearTimeout(this.alarmTimeout);
        
        this.alarmTimeout = setTimeout(() => this.triggerAlarm(), timeToAlarm);
        
        this.uiSetBtn.style.display = 'none';
        this.uiCancelBtn.style.display = 'inline-block';
        this.uiStatus.innerText = `Alarm Set: ${this.uiTimeInput.value}`;
        this.uiStatus.style.color = '#00ff88';
    }
    
    cancelAlarm() {
        if(this.alarmTimeout) clearTimeout(this.alarmTimeout);
        this.uiSetBtn.style.display = 'inline-block';
        this.uiCancelBtn.style.display = 'none';
        this.uiStatus.innerText = "No Alarm Set";
        this.uiStatus.style.color = '#b3b3b3';

        if(this.uiCreditBox) this.uiCreditBox.style.display = 'none'; 
    }
    
    triggerAlarm() {
        this.uiStatus.innerText = "ALARM RINGING!";
        this.uiStatus.style.color = '#ff4444';
        this.uiControls.style.display = 'block';
        this.uiCancelBtn.style.display = 'none';
        if(this.audio) this.audio.play();

        if(this.uiCreditBox) this.uiCreditBox.style.display = 'block'; 
    }
    
    snoozeAlarm() {
        this.dismissAlarm();
        const snoozeTime = new Date(new Date().getTime() + 5 * 60000); 
        this.uiTimeInput.value = `${String(snoozeTime.getHours()).padStart(2, '0')}:${String(snoozeTime.getMinutes()).padStart(2, '0')}`;
        this.setAlarm();
    }
    
    dismissAlarm() {
        if(this.audio) { this.audio.pause(); this.audio.currentTime = 0; }
        this.uiControls.style.display = 'none';
        this.cancelAlarm();
    }
}

class AstrologyManager {
    constructor() {
        this.btnCalc = document.getElementById('btn-calculate-zodiac');
        this.uiDate = document.getElementById('birth-date');
        
        if(this.btnCalc) this.btnCalc.addEventListener('click', () => this.calculate());
    }

    calculate() {
        if(!this.uiDate.value) {
            const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
            return alert(isTr ? "Lütfen doğum tarihinizi girin!" : "Please enter your birth date!");
        }

        const date = new Date(this.uiDate.value);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const sunSign = this.getSunSign(day, month);
        
        document.getElementById('res-sun').innerText = sunSign;
        document.getElementById('res-element').innerText = this.getElement(sunSign);
        document.getElementById('res-chinese').innerText = this.getChineseZodiac(year, month, day);
        document.getElementById('res-lifepath').innerText = this.getLifePathNumber(year, month, day);
        document.getElementById('res-moon-phase').innerText = this.getAccurateMoonPhase(year, month, day);
        
        document.getElementById('zodiac-result').style.display = 'block';
    }

    getSunSign(d, m) {
        const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
        if((m==1&&d<=20)||(m==12&&d>=22)) return isTr ? "Oğlak ♑" : "Capricorn ♑";
        if((m==1&&d>=21)||(m==2&&d<=18)) return isTr ? "Kova ♒" : "Aquarius ♒";
        if((m==2&&d>=19)||(m==3&&d<=20)) return isTr ? "Balık ♓" : "Pisces ♓";
        if((m==3&&d>=21)||(m==4&&d<=19)) return isTr ? "Koç ♈" : "Aries ♈";
        if((m==4&&d>=20)||(m==5&&d<=20)) return isTr ? "Boğa ♉" : "Taurus ♉";
        if((m==5&&d>=21)||(m==6&&d<=20)) return isTr ? "İkizler ♊" : "Gemini ♊";
        if((m==6&&d>=21)||(m==7&&d<=22)) return isTr ? "Yengeç ♋" : "Cancer ♋";
        if((m==7&&d>=23)||(m==8&&d<=22)) return isTr ? "Aslan ♌" : "Leo ♌";
        if((m==8&&d>=23)||(m==9&&d<=22)) return isTr ? "Başak ♍" : "Virgo ♍";
        if((m==9&&d>=23)||(m==10&&d<=22)) return isTr ? "Terazi ♎" : "Libra ♎";
        if((m==10&&d>=23)||(m==11&&d<=21)) return isTr ? "Akrep ♏" : "Scorpio ♏";
        return isTr ? "Yay ♐" : "Sagittarius ♐";
    }

    getElement(sign) {
        const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
        if(sign.includes("♈") || sign.includes("♌") || sign.includes("♐")) return isTr ? "Ateş 🔥" : "Fire 🔥";
        if(sign.includes("♉") || sign.includes("♍") || sign.includes("♑")) return isTr ? "Toprak 🌿" : "Earth 🌿";
        if(sign.includes("♊") || sign.includes("♎") || sign.includes("♒")) return isTr ? "Hava 💨" : "Air 💨";
        return isTr ? "Su 💧" : "Water 💧";
    }

    getChineseZodiac(year, month, day) {
        const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
        let cYear = (month === 1 || (month === 2 && day <= 4)) ? year - 1 : year;
        const animalsEn = ["Rat 🐁", "Ox 🐂", "Tiger 🐅", "Rabbit 🐇", "Dragon 🐉", "Snake 🐍", "Horse 🐎", "Goat 🐐", "Monkey 🐒", "Rooster 🐓", "Dog 🐕", "Pig 🐖"];
        const animalsTr = ["Fare 🐁", "Öküz 🐂", "Kaplan 🐅", "Tavşan 🐇", "Ejderha 🐉", "Yılan 🐍", "At 🐎", "Keçi 🐐", "Maymun 🐒", "Horoz 🐓", "Köpek 🐕", "Domuz 🐖"];
        let index = (cYear - 4) % 12;
        if (index < 0) index += 12;
        return isTr ? animalsTr[index] : animalsEn[index];
    }

    getLifePathNumber(y, m, d) {
        const reduce = (n) => {
            while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
                n = n.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
            }
            return n;
        };
        const total = reduce(m) + reduce(d) + reduce(y);
        return reduce(total);
    }

    getAccurateMoonPhase(year, month, day) {
        const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
        let y = year, m = month;
        if (m < 3) { y--; m += 12; }
        m++;
        const c = 365.25 * y;
        const e = 30.6 * m;
        let jd = c + e + day - 694039.09; 
        jd /= 29.5305882; 
        let b = Math.floor(jd); 
        jd -= b; 
        b = Math.round(jd * 8); 
        if (b >= 8) b = 0; 
        
        const phasesEn = ["New Moon 🌑", "Waxing Crescent 🌒", "First Quarter 🌓", "Waxing Gibbous 🌔", "Full Moon 🌕", "Waning Gibbous 🌖", "Last Quarter 🌗", "Waning Crescent 🌘"];
        const phasesTr = ["Yeni Ay 🌑", "İlk Hilal 🌒", "İlk Dördün 🌓", "Büyüyen Ay 🌔", "Dolunay 🌕", "Küçülen Ay 🌖", "Son Dördün 🌗", "Son Hilal 🌘"];
        return isTr ? phasesTr[b] : phasesEn[b];
    }
}

class AssetManager {
    constructor() {
        this.body = document.body;
        this.imagePath = "assets/images/"; 
        
        const themes = ['cowboy-era', 'cyber-world', 'dark-fantasy', 'light-fantasy', 'jazz-romance', 'rock-n-roll'];
        this.currentTheme = themes[Math.floor(Math.random() * themes.length)]; 
        
        this.totalVisuals = 5; 
        this.slideInterval = null; 
        this.isReverse = Math.random() > 0.5; 
        this.currentVisualIndex = this.isReverse ? this.totalVisuals : 1;
        
        this.changeVisualTheme(this.currentTheme, false); 
    }
    changeVisualTheme(themeName, resetIndex = true) {
        this.currentTheme = themeName;
        if(resetIndex) this.currentVisualIndex = this.isReverse ? this.totalVisuals : 1;
        this.updateBackground();
        this.startSlideshow(); 
    }
    updateBackground() {
        const img = new Image();
        img.src = `${this.imagePath}${this.currentTheme}/${this.currentTheme}-${this.currentVisualIndex}.jpg`;
        img.onload = () => this.body.style.backgroundImage = `url('${img.src}')`;
    }
    startSlideshow() {
        if (this.slideInterval) clearInterval(this.slideInterval);
        const timeInMilliseconds = 600000; 
        this.slideInterval = setInterval(() => {
            if (this.isReverse) {
                this.currentVisualIndex--;
                if (this.currentVisualIndex < 1) this.currentVisualIndex = this.totalVisuals; 
            } else {
                this.currentVisualIndex++;
                if (this.currentVisualIndex > this.totalVisuals) this.currentVisualIndex = 1; 
            }
            this.updateBackground();
        }, timeInMilliseconds);
    }
}

class AudioManager {
    constructor() {
        this.bgPlayer = document.getElementById('bg-player');
        this.musicPath = "assets/audios/music-for-themes/"; 
        this.currentTheme = null;
        this.totalTracks = 12; 
        this.isReverse = Math.random() > 0.5; 
        this.currentTrackIndex = this.isReverse ? this.totalTracks : 1;

        this.uiPlayPauseBtn = document.getElementById('btn-play-pause');
        this.uiNextBtn = document.getElementById('btn-next'); 
        this.uiPrevBtn = document.getElementById('btn-prev'); 
        
        this.uiMuteBtn = document.getElementById('btn-mute-all');
        this.uiThemeName = document.getElementById('current-theme-name');
        this.uiTrackName = document.getElementById('current-track-name');
        
        this.uiTrackCredit = document.getElementById('track-credit'); 

        this.trackCredits = {
            'cowboy-era': {
                1: "Music by: JHS Pedals - Cowboy Lullaby", 2: "Music by: Chris Haugen - Tumbleweed Texas", 3: "Music by: Kaazoom - Homestead",
                4: "Music by: Kaazoom - Rider Under the Canyon Moon", 5: "Music by: Kaazoom - The Lonesome Rider", 6: "Music by: Kaazoom - Way Out West",
                7: "Music by: Telecasted - Big River", 8: "Music by: Dan Lebowitz - Dumb as a Box", 9: "Music by: Zachariah Hickman - The Beacon",
                10: "Music by: Cumbia Deli - Sabor a la Antigua", 11: "Music by: Litesaturation - Country Rock", 12: "Music by: Track Tribe - Hotlanta",
            },
            'cyber-world': {
                1: "Music by: Ribhavagrawal - Nostalgic", 2: "Music by: Ribhavagrawal - Royal Entry", 3: "Music by: Ribhavagrawal - Teleporting",
                4: "Music by: Ribhavagrawal - Villian Arrives", 5: "Music by: The Soundlings - 360 No Scope", 6: "Music by: Dan Lebowitz - Boomin'",
                7: "Music by: Dan Lebowitz - In It to Win It", 8: "Music by: Telecasted - Jetski", 9: "Music by: Telecasted - The Last Goodbye",
                10: "Music by: Everet Almond - Wrangle the Crazy", 11: "Music by: half.cool - Sharp Edges", 12: "Music by: half.cool - Virtual Roaming Charges",
            },
            'dark-fantasy': {
                1: "Music by: Alexaa221 from Pixabay", 2: "Music by: Everet Almond - Among the Stars", 3: "Music by: Puddle of Infinity - Cloud Wheels, Castle Builder",
                4: "Music by: Kellepics - Pandora", 5: "Music by: Quincas Moreira - London Fog", 6: "Music by: Montogoronto from Pixabay",
                7: "Music by: Density & Time - Level", 8: "Music by: Openmindaudio from Pixabay", 9: "Music by: Density & Time - Radar",
                10: "Music by: Brian Bolger - Black Mass", 11: "Music by: NIVIRO - Rumble | Provided by NCS", 12: "Music by: Kevin MacLeod - Hall of the Mountain King | CC BY 4.0 (incompetech.com)",
            },
            'light-fantasy': {
                1: "Music by: Meditativetiger - Ethereal Harp Lullaby", 2: "Music by: Alanajordan - Ethereal Visit", 3: "Music by: Dreaming Under The Stars from Pixabay",
                4: "Music by: Jumpingbunny from Pixabay", 5: "Music by: Zachariah Hickman - Leaning On the Everlasting Arms", 6: "Music by: Whatssmooth - The Fairy of Crimson Light",
                7: "Music by: Kevin MacLeod - Pooka | CC BY 4.0 (incompetech.com)", 8: "Music by: Brian Bolger - Music Box", 9: "Music by: Aaron Kenny - Happy Haunts",
                10: "Music by: Reed Mathis - Orphan", 11: "Music by: Nathan Moore - With a Rose in Your Teeth", 12: "Music by: Esther Abrami - No.3 Morning Folk Song",
            },
            'jazz-romance': {
                1: "Music by: Surprising Media - Gentle Glow", 2: "Music by: Surprising Media from Pixabay", 3: "Music by: Surprising Media from Pixabay",
                4: "Music by: Surprising Media from Pixabay", 5: "Music by: E's Jammy Jams - Arabian Sand", 6: "Music by: Alex Hamlin - Dance Number 24449",
                7: "Music by: Bird Creek - Ipanema Daydream", 8: "Music by: Valerystarfell - Snowflake", 9: "Music by: Doug Maxwell - 1940's Slow Dance",
                10: "Music by: Casa Rosa's Tulum Vibes - Bah Dop Bop", 11: "Music by: Jimmy Fontanez - ChaCha Fontanez", 12: "Music by: Quincas Moreira - Tango Mango",
            },
            'rock-n-roll': {
                1: "Music by: Businessstar - On the Road", 2: "Music by: Freedom Trail Studio - I'm Happy For This Guitar", 3: "Music by: Magic In The Other - Life is Good",
                4: "Music by: Audionautix - Keep It Real | CC BY 4.0 (audionautix.com)", 5: "Music by: Telecasted - Lonely Day", 6: "Music by: Freedom Trail Studio - Love On File",
                7: "Music by: Emmraan - Cool Rider", 8: "Music by: Emmraan - Crazy Funny Rock", 9: "Music by: Track Tribe - Hotlanta",
                10: "Music by: Track Tribe - Drag Race", 11: "Music by: Track Tribe - SeaTac", 12: "Music by: UniqueCreativeAudio from Pixabay",
            }
        };

        this.uiSoundCredit = document.getElementById('sound-credit');

        this.soundCredits = {
            'winter-wind': "Sound by: Dragon Studio from Pixabay", 'rain': "Sound by: Liecio from Pixabay",
            'birds': "Sound by: Freesound Community from Pixabay", 'birds-rain': "Sound by: SoundReality from Pixabay",
            'waves-seagulls': "Sound by: Soundsvisual from Pixabay", 'fire': "Sound by: SoundReality from Pixabay",
            'cafe-noise': "Sound by: Freesound Community from Pixabay", 'train': "Sound by: SSPsurvival from Pixabay",
            'koto-japanese-zither': "Sound by: Freesound"
        };

        this.initPlayerButtons();
        this.initAmbiences(); 
        
        if (this.bgPlayer) {
            this.bgPlayer.onended = () => this.playNextTrack();
        }
    }

    initAmbiences() {
        this.activeAmbiences = []; 
        this.uiSoundsPlayPauseBtn = document.getElementById('btn-sounds-play-pause');
        if(this.uiSoundsPlayPauseBtn) {
            this.uiSoundsPlayPauseBtn.addEventListener('click', () => this.toggleMasterAmbience());
        }

        this.ambienceButtons = {
            'winter-wind': document.getElementById('btn-winter-wind'), 'rain': document.getElementById('btn-rain'),
            'birds': document.getElementById('btn-birds'), 'birds-rain': document.getElementById('btn-birds-rain'),
            'waves-seagulls': document.getElementById('btn-waves-seagulls'), 'fire': document.getElementById('btn-fire'),
            'cafe-noise': document.getElementById('btn-cafe-noise'), 'train': document.getElementById('btn-train'),
            'koto-japanese-zither': document.getElementById('btn-koto-japanese-zither')
        };
    }

    updateSoundCreditText() {
        if (!this.uiSoundCredit) return;
        
        if (this.activeAmbiences.length === 0) {
            this.uiSoundCredit.innerText = "Play / Pause Active Audio";
        } else if (this.activeAmbiences.length === 1) {
            const playingId = this.activeAmbiences[0];
            this.uiSoundCredit.innerText = this.soundCredits[playingId] || "Sound is Playing...";
        } else {
            this.uiSoundCredit.innerText = `Special mix: ${this.activeAmbiences.length} sounds active ⁉️`;
        }
    }

    toggleAmbience(soundId) {
        const targetAudio = document.getElementById(`audio-${soundId}`);
        const targetButton = this.ambienceButtons[soundId];
        if (!targetAudio || !targetButton) return;

        if (targetAudio.paused) {
            targetAudio.play().then(() => {
                targetButton.style.background = "#00ff88"; 
                targetButton.style.color = "black";
                if (!this.activeAmbiences.includes(soundId)) this.activeAmbiences.push(soundId);
                if(this.uiSoundsPlayPauseBtn) this.uiSoundsPlayPauseBtn.innerHTML = '&#10074;&#10074;';
                
                this.updateSoundCreditText(); 
            });
        } else {
            targetAudio.pause();
            targetButton.style.background = "rgba(255,255,255,0.1)"; 
            targetButton.style.color = "white";
            this.activeAmbiences = this.activeAmbiences.filter(id => id !== soundId);
            
            this.updateSoundCreditText(); 
        }
    }

    toggleMasterAmbience() {
        let isAnyPlaying = false;
        this.activeAmbiences.forEach(soundId => {
            const audio = document.getElementById(`audio-${soundId}`);
            if (audio && !audio.paused) isAnyPlaying = true;
        });

        if (isAnyPlaying) {
            this.activeAmbiences.forEach(soundId => {
                const audio = document.getElementById(`audio-${soundId}`);
                if (audio) audio.pause();
            });
            if(this.uiSoundsPlayPauseBtn) this.uiSoundsPlayPauseBtn.innerHTML = '&#9654;'; 
        } else {
            this.activeAmbiences.forEach(soundId => {
                const audio = document.getElementById(`audio-${soundId}`);
                if (audio) audio.play();
            });
            if(this.uiSoundsPlayPauseBtn) this.uiSoundsPlayPauseBtn.innerHTML = '&#10074;&#10074;'; 
        }
    }

    initPlayerButtons() {
        if(this.uiPlayPauseBtn) this.uiPlayPauseBtn.addEventListener('click', () => this.togglePlayPause());
        if(this.uiNextBtn) this.uiNextBtn.addEventListener('click', () => this.playNextTrack());
        if(this.uiPrevBtn) this.uiPrevBtn.addEventListener('click', () => this.playPrevTrack());
        if(this.uiMuteBtn) this.uiMuteBtn.addEventListener('click', () => this.toggleMute());
    }

    playTheme(themeName) {
        if (themeName !== this.currentTheme) {
            this.currentTheme = themeName;
            this.currentTrackIndex = this.isReverse ? this.totalTracks : 1;
        }
        this.loadAndPlay();
    }

    loadAndPlay() {
        if (!this.currentTheme) return;
        const src = `${this.musicPath}${this.currentTheme}/mp${this.currentTrackIndex}.mp3`;
        if(!this.bgPlayer) return;

        this.bgPlayer.src = src;
        this.bgPlayer.play()
            .then(() => {
                if(this.uiPlayPauseBtn) this.uiPlayPauseBtn.innerHTML = '&#10074;&#10074;'; 
                if(this.uiThemeName) this.uiThemeName.innerText = this.currentTheme.toUpperCase().replace('-', ' ');
                if(this.uiTrackName) this.uiTrackName.innerText = `\Track ${this.currentTrackIndex}`;
                
                if(this.uiTrackCredit) {
                    let creditInfo = this.trackCredits[this.currentTheme] && this.trackCredits[this.currentTheme][this.currentTrackIndex];
                    this.uiTrackCredit.innerText = creditInfo ? creditInfo : "Copyright Information Not Found";
                }
            })
            .catch(err => console.log("Autoplay is Disabled:", err));
    }

    togglePlayPause() {
        if (!this.currentTheme || !this.bgPlayer) return;
        if (this.bgPlayer.paused) {
            this.bgPlayer.play();
            if(this.uiPlayPauseBtn) this.uiPlayPauseBtn.innerHTML = '&#10074;&#10074;'; 
        } else {
            this.bgPlayer.pause();
            if(this.uiPlayPauseBtn) this.uiPlayPauseBtn.innerHTML = '&#9654;'; 
        }
    }

    playNextTrack() {
        if (this.isReverse) {
            this.currentTrackIndex--;
            if (this.currentTrackIndex < 1) this.currentTrackIndex = this.totalTracks; 
        } else {
            this.currentTrackIndex++;
            if (this.currentTrackIndex > this.totalTracks) this.currentTrackIndex = 1; 
        }
        this.loadAndPlay();
    }

    playPrevTrack() {
        if (this.isReverse) {
            this.currentTrackIndex++;
            if (this.currentTrackIndex > this.totalTracks) this.currentTrackIndex = 1;
        } else {
            this.currentTrackIndex--;
            if (this.currentTrackIndex < 1) this.currentTrackIndex = this.totalTracks;
        }
        this.loadAndPlay();
    }

    toggleMute() {
        if(!this.bgPlayer) return;
        this.bgPlayer.muted = !this.bgPlayer.muted;
        if (this.bgPlayer.muted) {
            this.uiMuteBtn.style.color = '#ff4444'; 
            this.uiMuteBtn.innerHTML = '&#128263;'; 
        } else {
            this.uiMuteBtn.style.color = '#b3b3b3'; 
            this.uiMuteBtn.innerHTML = '&#9835;'; 
        }
    }
}

const ui = new UIManager();
const clock = new ClockManager();
const stopwatch = new StopwatchManager();
const timer = new TimerManager();
const alarm = new AlarmManager();
const astro = new AstrologyManager();
const audioManager = new AudioManager(); 
const theme = new AssetManager(); 

window.playTheme = (themeName) => { if(audioManager) audioManager.playTheme(themeName); };
window.openTab = (evt, tabName) => UIManager.openTab(evt, tabName);
window.changeTheme = (themeName) => { if(theme) theme.changeVisualTheme(themeName); };
window.toggleAmbience = (soundId) => { if(audioManager) audioManager.toggleAmbience(soundId); };

document.addEventListener('contextmenu', (e) => { e.preventDefault(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') { e.preventDefault(); }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) { e.preventDefault(); }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); }
});

// ==========================================
// DİL MOTORU (TR / EN)
// ==========================================
let userBrowserLang = navigator.language || navigator.userLanguage;
let currentLang = userBrowserLang.toLowerCase().startsWith('tr') ? 'tr' : 'en';

const translations = {
    'en': {
        fullscreen: "⛶ Fullscreen", minimize: "⛶ Minimize",
        home: "Home", stopwatch: "Stopwatch", timer: "Timer", alarm: "Alarm Clock", worldclock: "World Clock", birthchart: "Birth Chart",
        start: "Start", stop: "Stop", lap: "Lap", reset: "Reset", pause: "Pause / Stop", set: "Set", cancel: "Cancel",
        noAlarm: "No Alarm Set", snooze: "Snooze (5 min)", dismiss: "Dismiss", calc: "Calculate",
        supportTitle: "Support Me!", supportText: "This project is designed for 100% focus and zero ads. You can support the server costs by buying me a coffee.", buyCoffee: "Buy Me a Coffee",
        vibeHint: "Set your vibe, then <strong>rotate your device</strong> for the ultimate fullscreen experience.",
        
        bcSun: "☀️ Sun Sign: ", bcElement: "🌿 Element: ", bcChinese: "🐉 Chinese Zodiac: ", bcLifePath: "🔢 Life Path Number: ", bcMoon: "🌕 Moon Phase: ",
        sndWinter: "Winter Wind", sndRain: "Rain", sndBirds: "Birds", sndBirdsRain: "Birds in the Rain", sndWaves: "Waves & Seagulls", sndFire: "Fireplace", sndCafe: "Cafe Ambience", sndTrain: "Train Journey", sndKoto: "Koto (Japanese Zither)",
        quickNote: "<strong>Quick Note:</strong> High-fidelity audio in use. Wi-Fi connection is recommended to save your mobile data."
    },
    'tr': {
        fullscreen: "⛶ Tam Ekran", minimize: "⛶ Küçült",
        home: "Ana Sayfa", stopwatch: "Kronometre", timer: "Sayaç", alarm: "Çalar Saat", worldclock: "Dünya Saati", birthchart: "Doğum Haritası",
        start: "Başlat", stop: "Durdur", lap: "Tur", reset: "Sıfırla", pause: "Duraklat / Bitir", set: "Kur", cancel: "İptal",
        noAlarm: "Alarm Kurulmadı", snooze: "Ertele (5 dk)", dismiss: "Kapat", calc: "Hesapla",
        supportTitle: "Destek Ol!", supportText: "Bu proje %100 odaklanma ve sıfır reklam için tasarlandı. Bana bir kahve ısmarlayarak sunucu masraflarına destek olabilirsiniz.", buyCoffee: "Kahve Ismarla",
        vibeHint: "Ambiyansınızı seçin, ardından tam ekran deneyimi için <strong>cihazınızı yan çevirin</strong>.",
        
        bcSun: "☀️ Güneş Burcu: ", bcElement: "🌿 Element: ", bcChinese: "🐉 Çin Burcu: ", bcLifePath: "🔢 Yaşam Yolu Sayısı: ", bcMoon: "🌕 Ay Evresi: ",
        sndWinter: "Kış Rüzgarı", sndRain: "Yağmur", sndBirds: "Kuşlar", sndBirdsRain: "Yağmurlu Orman", sndWaves: "Dalgalar ve Martılar", sndFire: "Şömine", sndCafe: "Kafe Ambiyansı", sndTrain: "Tren Yolculuğu", sndKoto: "Japon Kotosu",
        quickNote: "<strong>Kısa Not:</strong> Yüksek kaliteli ses kullanılıyor. Mobil verinizi korumak için Wi-Fi bağlantısı önerilir."
    }
};

function applyTranslations() {
    const t = translations[currentLang];
    
    if(!document.fullscreenElement) {
        const fsBtn = document.getElementById('btn-fullscreen');
        if(fsBtn) fsBtn.innerText = t.fullscreen;
    } else {
        const fsBtn = document.getElementById('btn-fullscreen');
        if(fsBtn) fsBtn.innerText = t.minimize;
    }
    
    if(document.getElementById('btn-start')) document.getElementById('btn-start').innerText = t.start;
    if(document.getElementById('btn-stop')) document.getElementById('btn-stop').innerText = t.stop;
    if(document.getElementById('btn-lap')) document.getElementById('btn-lap').innerText = t.lap;
    if(document.getElementById('btn-reset')) document.getElementById('btn-reset').innerText = t.reset;
    if(document.getElementById('btn-timer-start')) document.getElementById('btn-timer-start').innerText = t.start;
    if(document.getElementById('btn-timer-pause')) document.getElementById('btn-timer-pause').innerText = t.pause;
    if(document.getElementById('btn-timer-reset')) document.getElementById('btn-timer-reset').innerText = t.reset;
    if(document.getElementById('btn-set-alarm')) document.getElementById('btn-set-alarm').innerText = t.set;
    if(document.getElementById('btn-cancel-alarm')) document.getElementById('btn-cancel-alarm').innerText = t.cancel;
    if(document.getElementById('alarm-status')) {
        if(document.getElementById('alarm-status').innerText === "No Alarm Set" || document.getElementById('alarm-status').innerText === "Alarm Kurulmadı") {
            document.getElementById('alarm-status').innerText = t.noAlarm;
        }
    }
    if(document.getElementById('btn-snooze')) document.getElementById('btn-snooze').innerText = t.snooze;
    if(document.getElementById('btn-dismiss')) document.getElementById('btn-dismiss').innerText = t.dismiss;
    if(document.getElementById('btn-calculate-zodiac')) document.getElementById('btn-calculate-zodiac').innerText = t.calc;

    if(document.querySelector('#stopwatch-view h2')) document.querySelector('#stopwatch-view h2').innerText = t.stopwatch;
    if(document.querySelector('#timer-view h2')) document.querySelector('#timer-view h2').innerText = t.timer;
    if(document.querySelector('#alarm-view h2')) document.querySelector('#alarm-view h2').innerText = t.alarm;
    if(document.querySelector('#world-clock-view h2')) document.querySelector('#world-clock-view h2').innerText = t.worldclock;
    if(document.querySelector('#birth-chart-view h2')) document.querySelector('#birth-chart-view h2').innerText = t.birthchart;

    const featureLinks = document.querySelectorAll('#features-list li');
    if(featureLinks.length > 0) {
        featureLinks[0].innerHTML = `&#x21A0; &nbsp; ${t.home}`;
        featureLinks[1].innerHTML = `&#x21A0; &nbsp; ${t.stopwatch}`;
        featureLinks[2].innerHTML = `&#x21A0; &nbsp; ${t.timer}`;
        featureLinks[3].innerHTML = `&#x21A0; &nbsp; ${t.alarm}`;
        featureLinks[4].innerHTML = `&#x21A0; &nbsp; ${t.worldclock}`;
        featureLinks[5].innerHTML = `&#x21A0; &nbsp; ${t.birthchart}`;
    }

    if(document.getElementById('res-sun') && document.getElementById('res-sun').previousSibling) document.getElementById('res-sun').previousSibling.nodeValue = t.bcSun;
    if(document.getElementById('res-element') && document.getElementById('res-element').previousSibling) document.getElementById('res-element').previousSibling.nodeValue = t.bcElement;
    if(document.getElementById('res-chinese') && document.getElementById('res-chinese').previousSibling) document.getElementById('res-chinese').previousSibling.nodeValue = t.bcChinese;
    if(document.getElementById('res-lifepath') && document.getElementById('res-lifepath').previousSibling) document.getElementById('res-lifepath').previousSibling.nodeValue = t.bcLifePath;
    if(document.getElementById('res-moon-phase') && document.getElementById('res-moon-phase').previousSibling) document.getElementById('res-moon-phase').previousSibling.nodeValue = t.bcMoon;

    if(document.getElementById('btn-winter-wind')) document.getElementById('btn-winter-wind').innerHTML = `&#x21A0; &nbsp; ${t.sndWinter}`;
    if(document.getElementById('btn-rain')) document.getElementById('btn-rain').innerHTML = `&#x21A0; &nbsp; ${t.sndRain}`;
    if(document.getElementById('btn-birds')) document.getElementById('btn-birds').innerHTML = `&#x21A0; &nbsp; ${t.sndBirds}`;
    if(document.getElementById('btn-birds-rain')) document.getElementById('btn-birds-rain').innerHTML = `&#x21A0; &nbsp; ${t.sndBirdsRain}`;
    if(document.getElementById('btn-waves-seagulls')) document.getElementById('btn-waves-seagulls').innerHTML = `&#x21A0; &nbsp; ${t.sndWaves}`;
    if(document.getElementById('btn-fire')) document.getElementById('btn-fire').innerHTML = `&#x21A0; &nbsp; ${t.sndFire}`;
    if(document.getElementById('btn-cafe-noise')) document.getElementById('btn-cafe-noise').innerHTML = `&#x21A0; &nbsp; ${t.sndCafe}`;
    if(document.getElementById('btn-train')) document.getElementById('btn-train').innerHTML = `&#x21A0; &nbsp; ${t.sndTrain}`;
    if(document.getElementById('btn-koto-japanese-zither')) document.getElementById('btn-koto-japanese-zither').innerHTML = `&#x21A0; &nbsp; ${t.sndKoto}`;

    if(document.querySelector('.support-content h3')) document.querySelector('.support-content h3').innerText = t.supportTitle;
    if(document.querySelector('.support-content p')) document.querySelector('.support-content p').innerText = t.supportText;
    if(document.querySelector('.cyber-coffee-btn span')) document.querySelector('.cyber-coffee-btn span').innerText = t.buyCoffee;
    if(document.querySelector('#mobile-vibe-hint p')) document.querySelector('#mobile-vibe-hint p').innerHTML = t.vibeHint;
    
    const noteEl = document.querySelector('.sidebar div p');
    if (noteEl && (noteEl.innerHTML.includes("Quick Note") || noteEl.innerHTML.includes("Kısa Not"))) {
        noteEl.innerHTML = t.quickNote;
    }

    if (document.getElementById('zodiac-result') && document.getElementById('zodiac-result').style.display === 'block' && typeof astro !== 'undefined') {
        astro.calculate();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});

// ==========================================
// YATAY MOD (LANDSCAPE) GÜVENLİK
// ==========================================
// Ekran her milim kaydığında değil, sadece telefon yan çevrildiğinde tetiklenir
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if(window.innerWidth > window.innerHeight) {
            const wc = document.getElementById('world-clock-view');
            const bc = document.getElementById('birth-chart-view');
            
            // Eğer World Clock veya Birth Chart açıksa, otomatik olarak Home ekranına at
            if((wc && wc.style.display === 'block') || (bc && bc.style.display === 'block')) {
                if(wc) wc.style.display = 'none';
                if(bc) bc.style.display = 'none';
                
                const home = document.getElementById('clock-view');
                if(home) home.style.display = 'block';
                
                const tablinks = document.getElementsByClassName("tab-link");
                for (let i = 0; i < tablinks.length; i++) tablinks[i].classList.remove("active");
                if(tablinks[0]) tablinks[0].classList.add("active");
            }
        }
    }, 200); // Sensörün ekranı algılaması için saniyenin beşte biri kadar bekler

    // Yatayda da çevirinin bozulmadığını %100 garantiye almak için tetikleyici
    applyTranslations();
});


