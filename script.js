// ------------------------------------------
//  ANA MOTOR
// ------------------------------------------

// Tarayıcı dilini kontrol eder; Türkçe ise 'tr', değilse varsayılan olarak 'en' atar
let userBrowserLang = navigator.language || navigator.userLanguage;
let currentLang = userBrowserLang.toLowerCase().startsWith('tr') ? 'tr' : 'en';

// ------------------------------------------
//  UI (ARAYÜZ)
// ------------------------------------------
class UIManager {
    constructor() {
        // Sidebar menü elemanlarını ve uygulamanın tüm panel görünümlerini (Views) DOM'dan seçer
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
        
        // Menü navigasyonunu, akordeon panellerini ve tam ekran modunu tetikler
        this.initNavigation();
        this.initAccordion();
        this.initFullscreen(); 
    }

    // ------------------------------------------
    //  AKORDEON (AÇILIR PANEL) MOTORU
    // ------------------------------------------
    initAccordion() {
        // Tüm akordeon butonlarını seçer ve tıklama olaylarını (Click Event) dinler
        const accBtns = document.querySelectorAll('.accordion-btn');
        accBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget;
                // Başlık kutusunun hemen altındaki içerik kutusu
                const content = targetBtn.nextElementSibling; 
                // Üst kapsayıcı panel
                const parentContent = targetBtn.closest('.accordion-content');

                // Diğer açık olan akordeon panellerini otomatik olarak kapatır (iç içe olanlar hariç)
                accBtns.forEach(otherBtn => {
                    if (otherBtn !== targetBtn && otherBtn.classList.contains('open')) {
                        if (parentContent && otherBtn.nextElementSibling === parentContent) {
                            return; 
                        }
                        otherBtn.classList.remove('open');
                        otherBtn.nextElementSibling.classList.remove('show');
                    }
                });

                // Tıklanan paneli açar veya kapatır (show/open sınıflarını toggle eder)
                targetBtn.classList.toggle('open');
                content.classList.toggle('show');
            });
        });
    }

    // ------------------------------------------
    //  TAM EKRAN (FULLSCREEN) MOTORU
    // ------------------------------------------
    initFullscreen() {
        // Tam ekran butonunu seçer, buton yoksa fonksiyonu durdurur
        const fsBtn = document.getElementById('btn-fullscreen');
        if (!fsBtn) return;

        // Butona tıklandığında tam ekran modunu açar veya kapatır (Cross-browser uyumlu)
        fsBtn.addEventListener('click', () => {

            // Tam ekranı başlatma istekleri (W3C, WebKit/Safari, IE/Edge)
            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) { 
                    document.documentElement.webkitRequestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) { 
                    document.documentElement.msRequestFullscreen();
                }

            // Tam ekrandan çıkma istekleri (W3C, WebKit/Safari, IE/Edge)
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

        // Tam ekran durumuna göre arayüz sınıflarını (CSS) ve buton metnini günceller
        const toggleFullscreenClasses = () => {
            const t = translations[currentLang];

            if (document.fullscreenElement || document.webkitFullscreenElement) {
                document.body.classList.add('fullscreen-mode'); // Sinematik modu aktifleştirir
                fsBtn.innerText = t.minimize; // Buton yazısını küçültür
            } else {
                document.body.classList.remove('fullscreen-mode'); // Sinematik modu kapatır
                fsBtn.innerText = t.fullscreen; // Buton yazısını büyültür
            }
        };

        // Tam ekran değişim olaylarını (dinamik pencere boyutlandırma) dinler
        document.addEventListener('fullscreenchange', toggleFullscreenClasses);
        document.addEventListener('webkitfullscreenchange', toggleFullscreenClasses);
    }

    // ------------------------------------------
    //  MENÜ NAVİGASYON MOTORU (SIDEBAR LI TRACKING)
    // ------------------------------------------
    initNavigation() {
        // Sol/Sağ menü linklerine tıklama olaylarını dinler ve sekme değiştirir
        this.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const isLandscape = window.innerWidth > window.innerHeight;
                
                // Yatay görünümdeyse ve kısıtlı bir sekmeyse (WC veya BC) tıklama işlemini iptal eder
                if (isLandscape) {
                    const txt = item.innerText.toLowerCase();
                    if (txt.includes('world clock') || txt.includes('dünya saati') || txt.includes('birth chart') || txt.includes('doğum haritası')) {
                        return; 
                        // Yatayda kısıtlı sekmeyse işlemi iptal et, openTab home'a (clock) yönlendirecek
                    }
                }

                // Eski aktif menü sınıfını temizler ve tıklanana 'active' sınıfı basar
                this.menuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Tüm sekmeleri ekrandan gizler (hidden sınıfı ekleyerek)
                Object.values(this.views).forEach(view => {
                    if (view) view.classList.add('hidden');
                });
                if (this.mainClockView) this.mainClockView.classList.add('hidden');

                // Tıklanan butonun adına göre hedef sekmenin gerçek ID karşılığını bulur
                let actualName = "Home";
                if(item.innerText.includes('Stopwatch') || item.innerText.includes('Kronometre')) actualName = 'Stopwatch';
                if(item.innerText.includes('Timer') || item.innerText.includes('Sayaç')) actualName = 'Timer';
                if(item.innerText.includes('Alarm')) actualName = 'Alarm Clock';
                if(item.innerText.includes('World Clock') || item.innerText.includes('Dünya Saati')) actualName = 'World Clock';
                if(item.innerText.includes('Birth Chart') || item.innerText.includes('Doğum Haritası')) actualName = 'Birth Chart';

                // Bulunan hedef sekmeyi görünür kılar, hata durumunda ana saate (home) döner
                if (this.views[actualName]) {
                    this.views[actualName].classList.remove('hidden');
                } else if (this.mainClockView) {
                    this.mainClockView.classList.remove('hidden');
                }
            });
        });
    }

    // ------------------------------------------
    //  STATİK SEKME GEÇİŞ MOTORU (TAB CONTENT CONTROL)
    // ------------------------------------------
    static openTab(evt, tabName) {
        // PC ekranlarını muaf tutan, sadece mobil yatay modu yakalayan kilit
        const isMobileLandscape = (window.innerWidth > window.innerHeight) && (window.innerWidth <= 950);
        
        // Mobil yatayda WC ve BC açılmaya çalışırsa rotayı zorla ana saate (home) kırar
        if (isMobileLandscape) {
            if (tabName === 'world-clock-view' || tabName === 'birth-chart-view') {
                tabName = 'clock-view'; 
                
                const tablinks = document.getElementsByClassName("tab-link");
                for (let i = 0; i < tablinks.length; i++) tablinks[i].classList.remove("active");
                if (tablinks[0]) tablinks[0].classList.add("active");
                
                evt = null; 
            }
        }

        // inline display çakışmalarını ve eski hidden sınıflarını temizler
        let tabcontent = document.getElementsByClassName("tab-content");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            tabcontent[i].classList.remove("hidden"); 
        }
        
        // Diğer tüm tab butonlarının aktiflik sınıflarını temizler
        let tablinks = document.getElementsByClassName("tab-link");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        
        // Hedef sekmeyi inline display: block yaparak ekrana basar
        const targetView = document.getElementById(tabName);
        if (targetView) {
            targetView.style.display = "block";
            targetView.classList.remove("hidden");
        }
        if (evt && evt.currentTarget) evt.currentTarget.className += " active";
    }
}

// ------------------------------------------
//  SAAT VE DÜNYA SAATLERİ YÖNETİCİSİ
// ------------------------------------------
class ClockManager {
    constructor() {
        // Yerel saat ve tarih elementlerini DOM'dan seçer
        this.timeDisplay = document.getElementById('time-display');
        this.dateDisplay = document.getElementById('date-display');

         // Saat motorlarını tetikler
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
            const locale = currentLang === 'tr' ? 'tr-TR' : 'en-GB';
            if (this.dateDisplay) this.dateDisplay.innerText = now.toLocaleDateString(locale, options);
        };
        setInterval(updateClock, 1000); // 1 saniyelik döngü
        updateClock();
    }

    // Farklı dünya şehirlerinin saatlerini zaman dilimlerine göre eş zamanlı yürütür
    startWorldClock() {
        const updateWorldClock = () => {
            const now = new Date();
            const options = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

            // Belirtilen ID'ye ilgili zaman diliminin saatini basan alt fonksiyon
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

// ------------------------------------------
//  KRONOMETRE YÖNETİCİSİ
// ------------------------------------------
class StopwatchManager {
    constructor() {
        this.display = document.getElementById('sw-display');
        this.lapsContainer = document.getElementById('laps-container');
        this.interval = null;
        this.elapsedTime = 0; // Geçen toplam saniye
        this.startTime = 0; // Başlangıç zaman damgası
        this.running = false; // Çalışma durumu
        this.lapCounter = 1; // Geçen tur sayısı
        this.initButtons();
    }

    formatTime(diff) {
        let seconds = Math.floor((diff / 1000) % 60);
        let minutes = Math.floor((diff / (1000 * 60)) % 60);
        let hours = Math.floor((diff / (1000 * 60 * 60)));
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    // Kronometre kontrol butonlarının dinleyicilerini (Click Event) yükler
    initButtons() {
        document.getElementById('btn-start')?.addEventListener('click', () => {
            // Başlat butonu, zaman sayacını 10 milisaniyede bir tetikler
            if (!this.running) {
                this.startTime = Date.now() - this.elapsedTime; 
                this.interval = setInterval(() => {
                    this.elapsedTime = Date.now() - this.startTime; 
                    this.display.innerText = this.formatTime(this.elapsedTime);
                }, 10);
                this.running = true;
            }
        });
        
        // -- Durdur butonu
        document.getElementById('btn-stop')?.addEventListener('click', () => {
            clearInterval(this.interval);
            this.running = false;
        });
        
        // -- Tur butonu, o anki süreyi hafızaya alıp listeye ekler
        document.getElementById('btn-lap')?.addEventListener('click', () => {
            if (!this.running) return;
            
            const t = translations[currentLang]; 
            const lapItem = document.createElement('div');
            lapItem.innerText = `${t.lap} ${this.lapCounter}: ${this.formatTime(this.elapsedTime)}`;
            lapItem.style.cssText = "padding: 5px; border-bottom: 1px solid rgba(255,255,255,0.2); color: #ccc;";
            this.lapsContainer.prepend(lapItem); // Son turu en üste ekler
            this.lapCounter++;
        });
        
        // -- Sıfırla butonu
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

// ------------------------------------------
//  SAYAÇ YÖNETİCİSİ
// ------------------------------------------
class TimerManager {
    constructor() {
        // Sayaç ekranını, saat/dakika/saniye inputlarını ve ses/telif kutularını DOM'dan seçer
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

    // Sayaç butonlarının tıklama, dokunma ve durdurma olaylarını (Event Listeners) dinler
    initButtons() {
        // Eksi/artı (spin-btn) butonlarına basıldığında veya dokunulduğunda kutunun yeşil neon yanmasını sağlar
        document.querySelectorAll('.spin-btn').forEach(btn => {
            btn.addEventListener('touchstart', () => btn.parentElement.classList.add('neon-active'), {passive: true});
            btn.addEventListener('mousedown', () => btn.parentElement.classList.add('neon-active'));
            btn.addEventListener('touchend', () => btn.parentElement.classList.remove('neon-active'));
            btn.addEventListener('mouseup', () => btn.parentElement.classList.remove('neon-active'));
            btn.addEventListener('mouseleave', () => btn.parentElement.classList.remove('neon-active'));
        });
        
        // -- Başlat butonu
        document.getElementById('btn-timer-start')?.addEventListener('click', () => {
            if(this.audio) { this.audio.load(); } // Mobil cihazlar için ses dosyasını önbelleğe yükler
            if (this.running) return;
            
            // Eğer sayaç duraklatılmışsa, kalan saniyeyi hedef süre olarak belirler
            if (this.isPaused && this.remainingSeconds > 0) {
                this.totalSeconds = this.remainingSeconds;
                this.isPaused = false;

            // Input kutularına girilen saat, dakika ve saniye değerlerini saniyeye çevirip toplar
            } else {
                let hour = parseInt(this.inputHour.value) || 0;
                let min = parseInt(this.inputMin.value) || 0;
                let sec = parseInt(this.inputSec.value) || 0;
                this.totalSeconds = (hour * 3600) + (min * 60) + sec;
            }

            if (this.totalSeconds <= 0) return; // Geçersiz süre girildiyse işlemi durdurur

            this.running = true;
             // Siber güvenlik kilidi -> tarayıcının arkaya atıldığında yavaşlamasını önlemek için kesin bitiş zaman damgası kurulur
            const endTime = Date.now() + (this.totalSeconds * 1000); 

            // Her 1 saniyede bir çalışarak kalan süreyi ekrana basan ana döngü
            this.interval = setInterval(() => {
                this.remainingSeconds = Math.round((endTime - Date.now()) / 1000);

                // -- Süre doldu uyarısı
                if (this.remainingSeconds <= 0) {
                    clearInterval(this.interval);
                    this.running = false;
                    this.isPaused = false;
                    
                    const t = translations[currentLang];
                    this.display.innerText = t.timeIsUp; // Ekrana sürenin dolduğunu yazar
                    this.display.style.color = "#ff4444"; 
                    this.display.style.textShadow = "0 0 15px rgba(255, 68, 68, 0.8)";

                    if(this.uiCreditBox) this.uiCreditBox.style.display = 'block'; // Telif kutusunu açar
                    
                    if(this.audio) {
                        this.audio.currentTime = 0;
                        this.audio.play(); // Alarm sesini başlatır
                    }
                    return;
                }

                // Kalan toplam saniyeyi saat:dakika:saniye formatına parçalar ve ekrana yansıtır
                let h = Math.floor(this.remainingSeconds / 3600);
                let m = Math.floor((this.remainingSeconds % 3600) / 60);
                let s = this.remainingSeconds % 60;
                this.display.innerText = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }, 1000);
        });

        // -- Duraklat butonu
        document.getElementById('btn-timer-pause')?.addEventListener('click', () => {
            if(this.uiCreditBox) this.uiCreditBox.style.display = 'none';

            // Eğer süre dolduğu için alarm çalıyorsa, tek tıkla sesi sıfırlar ve ekranı normale döndürür
            if(this.audio && !this.audio.paused) {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.display.style.color = "white"; 
                this.display.style.textShadow = "1px 1px 5px rgba(0,0,0,0.6)";
                this.display.innerText = "00:00:00";
            }

            // Kalan süreyi hafızada dondurarak zamanlayıcıyı kapatır
            if (this.running) {
                clearInterval(this.interval);
                this.running = false;
                this.isPaused = true;
            }
        });

        // -- Sıfırla butonu
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
            
            // Formun içindeki tüm sayı girilen alanları (Sa, Dk, Sn) boşaltır
            if(this.inputHour) this.inputHour.value = "";
            if(this.inputMin) this.inputMin.value = "";
            if(this.inputSec) this.inputSec.value = "";
        });
    }
}

// ------------------------------------------
// ALARM YÖNETİCİSİ
// ------------------------------------------
class AlarmManager {
    constructor() {
        // Alarm zamanlayıcısını, ses elementini ve arayüz butonlarını/durum metinlerini bağlar
        this.alarmTimeout = null;
        this.audio = document.getElementById('audio-alarm'); 
        this.uiCreditBox = document.getElementById('alarm-credit-box'); 
        
        this.uiTimeInput = document.getElementById('alarm-time-input');
        this.uiSetBtn = document.getElementById('btn-set-alarm');
        this.uiCancelBtn = document.getElementById('btn-cancel-alarm');
        this.uiStatus = document.getElementById('alarm-status');
        this.uiControls = document.getElementById('alarm-controls');
    }

    // -- Alarm kur butonu
    setAlarm() {   
        if(this.audio) { this.audio.load(); } // Mobil cihaz senkronizasyonu için sesi önden yükler

        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        const t = translations[lang];

        if(!this.uiTimeInput.value) return alert(lang === 'tr' ? "Lütfen bir zaman seçin!" : "Please select a time!");
        
        // Şimdiki zamanı ve alarm kurulmak istenen hedef saati hesaplar
        const now = new Date();
        const [hours, minutes] = this.uiTimeInput.value.split(':');
        let alarmDate = new Date();
        alarmDate.setHours(hours, minutes, 0, 0);
        
        // Eğer girilen saat geçmişte kaldıysa, alarmı otomatik olarak bir sonraki güne erteler
        if (alarmDate <= now) alarmDate.setDate(alarmDate.getDate() + 1); 
        
        // Alarmın çalmasına kalan milisaniyeyi bulur ve tetikleyiciyi kurar
        const timeToAlarm = alarmDate.getTime() - now.getTime();
        if(this.alarmTimeout) clearTimeout(this.alarmTimeout);
        
        this.alarmTimeout = setTimeout(() => this.triggerAlarm(), timeToAlarm);
        
        // Buton görünümlerini günceller ve arayüze yeşil neon "Kuruldu" yazısını basar
        this.uiSetBtn.style.display = 'none';
        this.uiCancelBtn.style.display = 'inline-block';
        
        this.uiStatus.innerText = `${t.alarmSet}: ${this.uiTimeInput.value}`;
        this.uiStatus.style.color = '#00ff88';

        // -----------------------------------------------------------------------------------------------------
        // -- Automatic scroll bypass -> alarm kurulunca kutuyu otomatik olarak en aşağıya kaydırır
        if (window.innerWidth <= 768) {
            const alarmBox = document.getElementById('alarm-view');
            if (alarmBox) {
                setTimeout(() => {
                    alarmBox.scrollTo({
                        top: alarmBox.scrollHeight,
                        behavior: 'smooth' // Siberpunk ruhuna yakışır pürüzsüz akıcı kaydırma
                    });
                }, 100); // Elemanların render edilmesi için çıtır bir gecikme payı
            }
        }
        // ------------------------------------------------------------------------------------------------------
    }
    
    // -- Alarmı iptal et butonu
    cancelAlarm() {
        if(this.alarmTimeout) clearTimeout(this.alarmTimeout); // Zamanlayıcıyı öldürür
        
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        const t = translations[lang]; 
        
        this.uiSetBtn.style.display = 'inline-block';
        this.uiCancelBtn.style.display = 'none';
        
        this.uiStatus.innerText = t.noAlarm || (lang === 'tr' ? "Alarm kurulmadı" : "No alarm set"); 
        
        this.uiStatus.style.color = '#b3b3b3';
        if(this.uiCreditBox) this.uiCreditBox.style.display = 'none';  
    }
    
    // -- Alarmı tetikle (alarm çalması durumu)
    triggerAlarm() {
        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        const t = translations[lang]; 

        // Durum yazısını kırmızı neon yapar ve ertele/kapat panellerini flex olarak ayağa kaldırır
        this.uiStatus.innerText = t.alarmRinging || (lang === 'tr' ? "Alarm Çalıyor!" : "Alarm Ringing!");
        this.uiStatus.style.color = '#ff4444';
        if(this.uiControls) this.uiControls.style.display = 'flex'; 
        this.uiCancelBtn.style.display = 'none';
        if(this.audio) this.audio.play(); // Alarm müziğini başlatır
        if(this.uiCreditBox) this.uiCreditBox.style.display = 'block'; 
    } 
    
    // -- Ertele butonu
    snoozeAlarm() {
        this.dismissAlarm(); // Mevcut çalmayı susturur
        const snoozeTime = new Date(new Date().getTime() + 5 * 60000); // +5 dakika ekleme
        this.uiTimeInput.value = `${String(snoozeTime.getHours()).padStart(2, '0')}:${String(snoozeTime.getMinutes()).padStart(2, '0')}`;
        this.setAlarm(); // Yeni süreyi motora ekler
    }
    
    // -- Alarmı kapat butonu
    dismissAlarm() {
        if(this.audio) { this.audio.pause(); this.audio.currentTime = 0; } // Sesi keser ve başa sarar
        if(this.uiControls) this.uiControls.style.display = 'none'; 
        this.cancelAlarm(); // İptal fonksiyonunu çağırarak sistemi temizler
    }
}

// ------------------------------------------
//  ASTROLOJİ VE HESAPLAMA MOTORU
// ------------------------------------------
class AstrologyManager {
    constructor() {
        // Hesaplama butonunu ve doğum tarihi girdi alanını DOM'dan bağlar
        this.btnCalc = document.getElementById('btn-calculate-zodiac');
        this.uiDate = document.getElementById('birth-date');
        
        if(this.btnCalc) this.btnCalc.addEventListener('click', () => this.calculate());
    }

    calculate() {
        if(!this.uiDate.value) {
            const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
            return alert(isTr ? "Lütfen doğum tarihinizi girin!" : "Please enter your birth date!");
        }

        // Girilen tarih verisini gün, ay ve yıl olarak parçalar
        const date = new Date(this.uiDate.value);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        // Alt fonksiyonları çağırarak sonuçları hesaplar
        const sunSign = this.getSunSign(day, month);
        
        // Hesaplanan sonuçları DOM elementlerine yansıtır
        document.getElementById('res-sun').innerText = sunSign;
        document.getElementById('res-element').innerText = this.getElement(sunSign);
        document.getElementById('res-chinese').innerText = this.getChineseZodiac(year, month, day);
        document.getElementById('res-lifepath').innerText = this.getLifePathNumber(year, month, day);
        document.getElementById('res-moon-phase').innerText = this.getAccurateMoonPhase(year, month, day);
        
        // Sonuç panelini görünür (display: block) kılar
        document.getElementById('zodiac-result').style.display = 'block';

        // -----------------------------------------------------------------------------------------------------
        // -- Automatic scroll bypass -> burç hesaplanınca sonuçları göstermek için kutuyu otomatik aşağı kaydırır
        if (window.innerWidth <= 768) {
            const bcBox = document.getElementById('birth-chart-view');
            if (bcBox) {
                setTimeout(() => {
                    bcBox.scrollTo({
                        top: bcBox.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
        // ------------------------------------------------------------------------------------------------------
    }

    // -- Batı astrolojisi, gün ve aya göre güneş burcunu (Zodiac Sign) bulur
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

    // -- Element hesaplayıcı, güneş burcuna göre ait olduğu doğa elementini bulur
    getElement(sign) {
        const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
        if(sign.includes("♈") || sign.includes("♌") || sign.includes("♐")) return isTr ? "Ateş 🔥" : "Fire 🔥";
        if(sign.includes("♉") || sign.includes("♍") || sign.includes("♑")) return isTr ? "Toprak 🌿" : "Earth 🌿";
        if(sign.includes("♊") || sign.includes("♎") || sign.includes("♒")) return isTr ? "Hava 💨" : "Air 💨";
        return isTr ? "Su 💧" : "Water 💧";
    }

    // - Çin astrolojisi, ay takvimi geçiş hassasiyetiyle Çin burcu yıl sembolünü hesaplar
    getChineseZodiac(year, month, day) {
        const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
        // Ocak ve Şubat başındaki günleri bir önceki Çin yılına dahil eden sınır kontrolü
        let cYear = (month === 1 || (month === 2 && day <= 4)) ? year - 1 : year;
        const animalsEn = ["Rat 🐁", "Ox 🐂", "Tiger 🐅", "Rabbit 🐇", "Dragon 🐉", "Snake 🐍", "Horse 🐎", "Goat 🐐", "Monkey 🐒", "Rooster 🐓", "Dog 🐕", "Pig 🐖"];
        const animalsTr = ["Fare 🐁", "Öküz 🐂", "Kaplan 🐅", "Tavşan 🐇", "Ejderha 🐉", "Yılan 🐍", "At 🐎", "Keçi 🐐", "Maymun 🐒", "Horoz 🐓", "Köpek 🐕", "Domuz 🐖"];
        let index = (cYear - 4) % 12;
        if (index < 0) index += 12;
        return isTr ? animalsTr[index] : animalsEn[index];
    }

    // -- Numeroloji motoru, doğum tarihini tek basamaklı (veya üstat sayılar 11, 22, 33) kalana kadar indirger
    getLifePathNumber(y, m, d) {
        // Rakamları toplayıp tek basamağa indiren rekürsif/döngüsel iç fonksiyon
        const reduce = (n) => {
            while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
                n = n.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
            }
            return n;
        };
        const total = reduce(m) + reduce(d) + reduce(y);
        return reduce(total); // yaşam yolu sayısı
    }

    // -- Gök makinesi, Jülyen Gün (Julian Date) algoritması kullanarak ay evresini hesaplar
    getAccurateMoonPhase(year, month, day) {
        const isTr = typeof currentLang !== 'undefined' && currentLang === 'tr';
        let y = year, m = month;
        if (m < 3) { y--; m += 12; }
        m++;

        // -- Astronomik Jülyen takvimi matematiksel formülasyonu
        const c = 365.25 * y;
        const e = 30.6 * m;
        let jd = c + e + day - 694039.09; // Epok farkı
        jd /= 29.5305882; // Bir sinodik ay süresi (29.5 gün)
        let b = Math.floor(jd); 
        jd -= b; // Kesir kısmını (evreyi) alır
        b = Math.round(jd * 8); // 8 ana ay evresine ölçekler
        if (b >= 8) b = 0; 
        
        const phasesEn = ["New Moon 🌑", "Waxing Crescent 🌒", "First Quarter 🌓", "Waxing Gibbous 🌔", "Full Moon 🌕", "Waning Gibbous 🌖", "Last Quarter 🌗", "Waning Crescent 🌘"];
        const phasesTr = ["Yeni Ay 🌑", "İlk Hilal 🌒", "İlk Dördün 🌓", "Büyüyen Ay 🌔", "Dolunay 🌕", "Küçülen Ay 🌖", "Son Dördün 🌗", "Son Hilal 🌘"];
        return isTr ? phasesTr[b] : phasesEn[b];
    }
}

// ------------------------------------------
//  GÖRSEL VE TEMA YÖNETİCİSİ
// ------------------------------------------
class AssetManager {
    // Arka planın basılacağı body elementini ve görsellerin ana yolunu tanımlar
    constructor() {
        this.body = document.body;
        this.imagePath = "assets/images/"; 
        
        // Mevcut görsel temaları listeler ve açılışta rastgele bir tema seçer
        const themes = ['cowboy-era', 'cyber-world', 'dark-fantasy', 'light-fantasy', 'jazz-romance', 'rock-n-roll'];
        this.currentTheme = themes[Math.floor(Math.random() * themes.length)]; 
        
        // Tema başına görsel sayısı, slayt zamanlayıcısı ve rastgele akış yönü (düz/ters) ayarları
        this.totalVisuals = 5; 
        this.slideInterval = null; 
        this.isReverse = Math.random() > 0.5; // %50 ihtimalle görseller geriye doğru akar
        this.currentVisualIndex = this.isReverse ? this.totalVisuals : 1;
        
        // İlk temayı ve slayt motorunu başlatır
        this.changeVisualTheme(this.currentTheme, false); 
    }

    // -- Tema değiştir
    changeVisualTheme(themeName, resetIndex = true) {
        this.currentTheme = themeName;

        // Eğer tetiklendiyse görsel indeksini akış yönüne göre başlangıç konumuna sıfırlar
        if(resetIndex) this.currentVisualIndex = this.isReverse ? this.totalVisuals : 1;
        this.updateBackground(); // Arka planı günceller
        this.startSlideshow(); // Slayt zamanlayıcısını yeniden başlatır
    }

    // -- Arka planı güncelleme, görseli arka planda yükleyip DOM'a pürüzsüzce basar
    updateBackground() {
        const img = new Image();

        // Dinamik olarak hedef görselin tam yolunu oluşturur
        img.src = `${this.imagePath}${this.currentTheme}/${this.currentTheme}-${this.currentVisualIndex}.jpg`;

        // Görsel tarayıcı belleğine tamamen yüklendiği an (onload) arka plan resmi olarak atar
        img.onload = () => this.body.style.backgroundImage = `url('${img.src}')`;
    }

    // -- Slayt motoru, tam 10 dakikada bir arka plan görselini döngüsel olarak değiştirir
    startSlideshow() {
        if (this.slideInterval) clearInterval(this.slideInterval); // Varsa eski zamanlayıcıyı öldürür
        const timeInMilliseconds = 600000; // 10 dakikalık (600.000 ms) meditatif geçiş süresi

        // Belirlenen sürede bir çalışarak görsel indeksini ileri veya geri yürüten döngü
        this.slideInterval = setInterval(() => {
            if (this.isReverse) {
                this.currentVisualIndex--;
                if (this.currentVisualIndex < 1) this.currentVisualIndex = this.totalVisuals; // Başa sarma kilidi
            } else {
                this.currentVisualIndex++;
                if (this.currentVisualIndex > this.totalVisuals) this.currentVisualIndex = 1; // Sona sarma kilidi
            }
            this.updateBackground(); // Yeni görseli ekrana basar
        }, timeInMilliseconds);
    }
}

// ------------------------------------------
//  MÜZİK VE AMBİYANS MOTORU
// ------------------------------------------
class AudioManager {
    // Audio elementini, müzik klasör yolunu ve temel oynatma hafızasını tanımlar
    constructor() {
        this.bgPlayer = document.getElementById('bg-player');
        this.musicPath = "assets/audios/music-for-themes/"; 
        this.currentTheme = null;
        this.totalTracks = 12; // Tema başına düşen parça sayısı
        this.isReverse = Math.random() > 0.5; // %50 ihtimalle playlist tersten akar
        this.currentTrackIndex = this.isReverse ? this.totalTracks : 1;

        // Arayüzdeki müzik kontrol butonlarını ve bilgi panellerini DOM'dan bağlar
        this.uiPlayPauseBtn = document.getElementById('btn-play-pause');
        this.uiNextBtn = document.getElementById('btn-next'); 
        this.uiPrevBtn = document.getElementById('btn-prev'); 
    
        this.uiMuteBtn = document.getElementById('btn-mute-all');
        this.uiThemeName = document.getElementById('current-theme-name');
        this.uiTrackName = document.getElementById('current-track-name');
        this.uiTrackCredit = document.getElementById('track-credit'); 

        // Müzik temalarına ait parça ve sanatçı telif/telifsiz bilgi kütüphanesi
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

        // Doğa sesleri telif elementini bağlar ve kaynak ses kütüphanesini tanımlar
        this.uiSoundCredit = document.getElementById('sound-credit');
        this.soundCredits = {
            'winter-wind': "Sound by: Dragon Studio from Pixabay", 'rain': "Sound by: Liecio from Pixabay",
            'birds': "Sound by: Freesound Community from Pixabay", 'birds-rain': "Sound by: SoundReality from Pixabay",
            'waves-seagulls': "Sound by: Soundsvisual from Pixabay", 'fire': "Sound by: SoundReality from Pixabay",
            'cafe-noise': "Sound by: Freesound Community from Pixabay", 'train': "Sound by: SSPsurvival from Pixabay",
            'koto-japanese-zither': "Sound by: Freesound"
        };

        // Oynatıcı butonları ile ambiyans mekanizmalarını kurar ve parça bitiş takibini açar
        this.initPlayerButtons();
        this.initAmbiences(); 
        
        if (this.bgPlayer) {
            this.bgPlayer.onended = () => this.playNextTrack(); // Şarkı bitince otomatik sonrakine geçer
        }
    }

    // ------------------------------------------
    //  AMBİYANS SESLERİ BAŞLANGIÇ AYARLARI
    // ------------------------------------------
    initAmbiences() {
        this.activeAmbiences = []; // O an çaşan aktif doğa seslerini tutan dizi
        this.uiSoundsPlayPauseBtn = document.getElementById('btn-sounds-play-pause');
        if(this.uiSoundsPlayPauseBtn) {
            this.uiSoundsPlayPauseBtn.addEventListener('click', () => this.toggleMasterAmbience());
        }

        // Arayüzdeki ambiyans butonlarını ID bazlı değiştirir
        this.ambienceButtons = {
            'winter-wind': document.getElementById('btn-winter-wind'), 'rain': document.getElementById('btn-rain'),
            'birds': document.getElementById('btn-birds'), 'birds-rain': document.getElementById('btn-birds-rain'),
            'waves-seagulls': document.getElementById('btn-waves-seagulls'), 'fire': document.getElementById('btn-fire'),
            'cafe-noise': document.getElementById('btn-cafe-noise'), 'train': document.getElementById('btn-train'),
            'koto-japanese-zither': document.getElementById('btn-koto-japanese-zither')
        };
    }

    // -- Ambiyans bilgi paneli, çalan doğa sesinin telif bilgisini dinamik olarak ekrana basar
    updateSoundCreditText() {
        if (!this.uiSoundCredit) return;

        const lang = typeof currentLang !== 'undefined' ? currentLang : 'en';
        const t = typeof translations !== 'undefined' ? translations[lang] : { playPauseAudio: "Play / Pause", soundPlaying: "Playing...", soundBy: "Sound by:", specialMix: "Special mix:", soundsActive: "active" };
        
        if (this.activeAmbiences.length === 0) {
            this.uiSoundCredit.innerText = t.playPauseAudio;
        } else if (this.activeAmbiences.length === 1) {
            const playingId = this.activeAmbiences[0];
            let rawCredit = String(this.soundCredits[playingId] || t.soundPlaying);
            this.uiSoundCredit.innerText = rawCredit.replace("Sound by:", t.soundBy);
        } else {
            // Birden fazla ses açıksa arayüzde "özel Karışım: x ses aktif" yazar
            this.uiSoundCredit.innerText = `${t.specialMix} ${this.activeAmbiences.length} ${t.soundsActive} ⁉️`;
        }
    }

    // -- Tekli ambiyans kontrolü, tıklanan doğa sesini başlatır/durdurur ve buton rengini (yeşil neon) değiştirir
    toggleAmbience(soundId) {
        const targetAudio = document.getElementById(`audio-${soundId}`);
        const targetButton = this.ambienceButtons[soundId];
        if (!targetAudio || !targetButton) return;

        if (targetAudio.paused) {
            targetAudio.play().then(() => {
                targetButton.style.background = "#00ff88"; // Butonu yeşil yapar
                targetButton.style.color = "black";
                if (!this.activeAmbiences.includes(soundId)) this.activeAmbiences.push(soundId);
                if(this.uiSoundsPlayPauseBtn) this.uiSoundsPlayPauseBtn.innerHTML = '&#10074;&#10074;';
                
                this.updateSoundCreditText(); 
            });
        } else {
            targetAudio.pause();
            targetButton.style.background = "rgba(255,255,255,0.1)"; // Eski mat haline döndürür
            targetButton.style.color = "white";
            this.activeAmbiences = this.activeAmbiences.filter(id => id !== soundId);
            
            this.updateSoundCreditText(); 
        }
    }

    // -- Master ambiyans kontrolü, tek tıkla çalan tüm doğa seslerini toplu susturur veya toplu başlatır
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
            if(this.uiSoundsPlayPauseBtn) this.uiSoundsPlayPauseBtn.innerHTML = '&#9654;';  // Başlat ikonuna döner
        } else {
            this.activeAmbiences.forEach(soundId => {
                const audio = document.getElementById(`audio-${soundId}`);
                if (audio) audio.play();
            });
            if(this.uiSoundsPlayPauseBtn) this.uiSoundsPlayPauseBtn.innerHTML = '&#10074;&#10074;'; // Duraklat ikonuna döner
        }
    }

    // ------------------------------------------
    //  MÜZİK OYNATICI BUTON DİNLEYİCİLERİ
    // ------------------------------------------
    initPlayerButtons() {
        if(this.uiPlayPauseBtn) this.uiPlayPauseBtn.addEventListener('click', () => this.togglePlayPause());
        if(this.uiNextBtn) this.uiNextBtn.addEventListener('click', () => this.playNextTrack());
        if(this.uiPrevBtn) this.uiPrevBtn.addEventListener('click', () => this.playPrevTrack());
        if(this.uiMuteBtn) this.uiMuteBtn.addEventListener('click', () => this.toggleMute());
    }

    // -- Tema seçimi
    playTheme(themeName) {
        if (themeName !== this.currentTheme) {
            this.currentTheme = themeName;
            this.currentTrackIndex = this.isReverse ? this.totalTracks : 1;
        }
        this.loadAndPlay();
    }

    // -- Dosya yükle ve oynat
    loadAndPlay() {
        if (!this.currentTheme) return;
        const src = `${this.musicPath}${this.currentTheme}/mp${this.currentTrackIndex}.mp3`;
        if(!this.bgPlayer) return;

        this.bgPlayer.src = src;
        this.bgPlayer.play()
            .then(() => {
                const t = translations[currentLang]; 

                if(this.uiPlayPauseBtn) this.uiPlayPauseBtn.innerHTML = '&#10074;&#10074;'; 
                if(this.uiThemeName) this.uiThemeName.innerText = this.currentTheme.toUpperCase().replace('-', ' ');
                
                if(this.uiTrackName) {
                    this.uiTrackName.innerText = `${t.trackWord} ${this.currentTrackIndex}`;
                }
                
                // Ekrana şarkının telifsiz / yapımcı kredi bilgisini basar
                if(this.uiTrackCredit) {
                    let creditInfo = this.trackCredits[this.currentTheme] && this.trackCredits[this.currentTheme][this.currentTrackIndex];
                    let rawMusicCredit = creditInfo ? creditInfo : t.noCopyright;
                    
                    this.uiTrackCredit.innerText = rawMusicCredit.replace("Music by:", t.musicBy);
                }
            })
            .catch(err => console.log("Autoplay is Disabled:", err));
    }

    // -- Oynat / duraklat
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
 
    // -- Sonraki parça
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

    // -- Önceki parça
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

    // -- Sesi kapat / aç
    toggleMute() {
        if(!this.bgPlayer) return;
        this.bgPlayer.muted = !this.bgPlayer.muted;
        if (this.bgPlayer.muted) {
            this.uiMuteBtn.style.color = '#ff4444'; // Buton rengini kırmızı yapar
            this.uiMuteBtn.innerHTML = '&#128263;'; // Sessiz ikonu
        } else {
            this.uiMuteBtn.style.color = '#b3b3b3'; 
            this.uiMuteBtn.innerHTML = '&#9835;'; // Müzik notası ikonu
        }
    }
}

// ------------------------------------------
//  SİSTEM BAŞLATICILARI (INITIALIZATION)
// ------------------------------------------
// DOM elementlerinin tetiklenebilmesi için tüm yönetim sınıflarını (manager) ayağa kaldırır
const ui = new UIManager();
const clock = new ClockManager();
const stopwatch = new StopwatchManager();
const timer = new TimerManager();
const alarm = new AlarmManager();
const astro = new AstrologyManager();
const audioManager = new AudioManager(); 
const theme = new AssetManager(); 

// ------------------------------------------
//  GLOBAL NESNE KÖPRÜLEMESİ
// ------------------------------------------
// HTML üzerindeki inline 'onclick' event'lerinin JS sınıflarına erişebilmesi için köprüler kurar
window.playTheme = (themeName) => { if(audioManager) audioManager.playTheme(themeName); };
window.openTab = (evt, tabName) => UIManager.openTab(evt, tabName);
window.changeTheme = (themeName) => { if(theme) theme.changeVisualTheme(themeName); };
window.toggleAmbience = (soundId) => { if(audioManager) audioManager.toggleAmbience(soundId); };
window.alarm = alarm;

// ------------------------------------------
//  KAYNAK KOD KORUMA KİLİTLERİ
// ------------------------------------------
// Sağ Tık Engeli, arayüzde sağ tık menüsünün (Context Menu) açılmasını engeller
document.addEventListener('contextmenu', (e) => { e.preventDefault(); });
// Geliştirici Araçları Engeli, F12, Ctrl+Shift+I/J/C ve Ctrl+U kombinasyonlarını bloke eder
document.addEventListener('keydown', (e) => {
    if (e.key === 'F12') { e.preventDefault(); }
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) { e.preventDefault(); }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { e.preventDefault(); }
});

// ------------------------------------------
//  DİL MOTORU (TR / EN)
// ------------------------------------------
// TR ve EN dillerine ait tüm metin, placeholder ve buton etiketlerini tutan sözlük
const translations = {
    'en': {
        fullscreen: "⛶ Fullscreen", minimize: "⛶ Minimize",
        home: "Home", stopwatch: "Stopwatch", timer: "Timer", alarm: "Alarm", worldclock: "World Clock", birthchart: "Birth Chart",
        start: "Start", stop: "Stop", lap: "Lap", reset: "Reset", pause: "Pause / Stop", set: "Set", cancel: "Cancel",
        noAlarm: "No Alarm Set", snooze: "Snooze (5 min)", dismiss: "Dismiss", calc: "Calculate",
        timeIsUp: "Time is up!", alarmRinging: "Alarm Ringing!", alarmSet: "Alarm set",
        supportTitle: "Support Me!", supportText: "This 'lo-fi & chill' style space is designed for 100% focus and zero ads. You can support the server costs by buying me a coffee.", buyCoffee: "Buy Me a Coffee",
        vibeHint: "Set your vibe, then <strong>rotate your device</strong> for the ultimate fullscreen experience.",
        
        bcSun: "☀️ Sun Sign: ", bcElement: "🌿 Element: ", bcChinese: "🐉 Chinese Zodiac: ", bcLifePath: "🔢 Life Path Number: ", bcMoon: "🌕 Moon Phase: ",
        sndWinter: "Winter Wind", sndRain: "Rain", sndBirds: "Birds", sndBirdsRain: "Birds in the Rain", sndWaves: "Waves & Seagulls", sndFire: "Fireplace", sndCafe: "Cafe Ambience", sndTrain: "Train Journey", sndKoto: "Koto (Japanese Zither)",
        quickNote: "<strong>Quick Note:</strong> High data usage. Wi-Fi recommended.",

        features: "FEATURES", visualThemes: "VISUAL THEMES", audios: "AUDIOS",
        sounds: "AMBIENT SOUNDS", musicThemes: "MUSIC THEMES",
        hr: "Hr", min: "Min", sec: "Sec",
        localTime: "Local Time", cityIst: "Istanbul", cityNy: "New York", cityLon: "London", cityTok: "Tokyo",

        awaitingAudio: "Awaiting audio...", 
        timerAlarmSound: "Sound by: Nickpanekaiassets from Pixabay",
        musicBy: "Music by:", soundBy: "Sound by:", 
        playPauseAudio: "Play / Pause Active Audio", soundPlaying: "Sound is Playing...", 
        specialMix: "Special mix:", soundsActive: "sounds active", 
        trackWord: "Track", noCopyright: "Copyright Information Not Found"
    },
    'tr': {
        fullscreen: "⛶ Tam Ekran", minimize: "⛶ Küçült",
        home: "Ana Sayfa", stopwatch: "Kronometre", timer: "Sayaç", alarm: "Alarm", worldclock: "Dünya Saati", birthchart: "Doğum Haritası",
        start: "Başlat", stop: "Durdur", lap: "Tur", reset: "Sıfırla", pause: "Duraklat / Bitir", set: "Kur", cancel: "İptal",
        noAlarm: "Alarm Kurulmadı", snooze: "Ertele (5 dk)", dismiss: "Kapat", calc: "Hesapla",
        timeIsUp: "Süre doldu!", alarmRinging: "Alarm Çalıyor!", alarmSet: "Alarm kuruldu",
        supportTitle: "Destek Ol!", supportText: "Bu 'lo-fi & chill' tarzı mekan %100 odaklanma ve sıfır reklam için tasarlandı. Bana bir kahve ısmarlayarak sunucu masraflarına destek olabilirsiniz.", buyCoffee: "Kahve Ismarla",
        vibeHint: "Ambiyansınızı seçin, ardından tam ekran deneyimi için <strong>cihazınızı yan çevirin</strong>.",
        
        bcSun: "☀️ Güneş Burcu: ", bcElement: "🌿 Element: ", bcChinese: "🐉 Çin Burcu: ", bcLifePath: "🔢 Yaşam Yolu Sayısı: ", bcMoon: "🌕 Ay Evresi: ",
        sndWinter: "Kış Rüzgarı", sndRain: "Yağmur", sndBirds: "Kuşlar", sndBirdsRain: "Yağmurlu Orman", sndWaves: "Dalgalar ve Martılar", sndFire: "Şömine", sndCafe: "Kafe Ambiyansı", sndTrain: "Tren Yolculuğu", sndKoto: "Japon Kotosu",
        quickNote: "<strong>Kısa Not:</strong> Yoğun veri kullanımı. Wi-Fi önerilir.",

        features: "ÖZELLİKLER", visualThemes: "GÖRSEL TEMALAR", audios: "SESLER",
        sounds: "AMBİYANS SESLERİ", musicThemes: "MÜZİK TEMALARI",
        hr: "Sa", min: "Dk", sec: "Sn",
        localTime: "Yerel Saat", cityIst: "İstanbul", cityNy: "New York", cityLon: "Londra", cityTok: "Tokyo",

        awaitingAudio: "Ses bekleniyor...", 
        timerAlarmSound: "Ses: Nickpanekaiassets (Pixabay)",
        musicBy: "Müzik:", soundBy: "Ses:", 
        playPauseAudio: "Aktif Sesi Oynat / Duraklat", soundPlaying: "Ses Çalıyor...", 
        specialMix: "Özel Karışım:", soundsActive: "ses aktif", 
        trackWord: "Parça", noCopyright: "Telif Hakkı Bilgisi Bulunamadı"
    }
};

// -- Arayüzü yerelleştirir, seçili dile göre tüm DOM elementlerinin metinlerini günceller
function applyTranslations() {
    const t = translations[currentLang];
    
    // Tam ekran buton metnini o anki ekran durumuna göre günceller
    if(!document.fullscreenElement) {
        const fsBtn = document.getElementById('btn-fullscreen');
        if(fsBtn) fsBtn.innerText = t.fullscreen;
    } else {
        const fsBtn = document.getElementById('btn-fullscreen');
        if(fsBtn) fsBtn.innerText = t.minimize;
    }
    
    // Kronometre, sayaç, alarm ve astroloji buton metinlerini yerelleştirir
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

    // Sekme ana başlıklarını (H2) hedef dile göre günceller
    if(document.querySelector('#stopwatch-view h2')) document.querySelector('#stopwatch-view h2').innerText = t.stopwatch;
    if(document.querySelector('#timer-view h2')) document.querySelector('#timer-view h2').innerText = t.timer;
    if(document.querySelector('#alarm-view h2')) document.querySelector('#alarm-view h2').innerText = t.alarm;
    if(document.querySelector('#world-clock-view h2')) document.querySelector('#world-clock-view h2').innerText = t.worldclock;
    if(document.querySelector('#birth-chart-view h2')) document.querySelector('#birth-chart-view h2').innerText = t.birthchart;

    // Sol menüdeki (sidebar) özellik listesini dinamik olarak dile göre doldurur
    const featureLinks = document.querySelectorAll('#features-list li');
    if(featureLinks.length > 0) {
        featureLinks[0].innerHTML = `&#x21A0; &nbsp; ${t.home}`;
        featureLinks[1].innerHTML = `&#x21A0; &nbsp; ${t.stopwatch}`;
        featureLinks[2].innerHTML = `&#x21A0; &nbsp; ${t.timer}`;
        featureLinks[3].innerHTML = `&#x21A0; &nbsp; ${t.alarm}`;
        featureLinks[4].innerHTML = `&#x21A0; &nbsp; ${t.worldclock}`;
        featureLinks[5].innerHTML = `&#x21A0; &nbsp; ${t.birthchart}`;
    }

    // Astroloji paneli text node'larını bozmadan burç başlık ön eklerini yerelleştirir
    if(document.getElementById('res-sun') && document.getElementById('res-sun').previousSibling) document.getElementById('res-sun').previousSibling.nodeValue = t.bcSun;
    if(document.getElementById('res-element') && document.getElementById('res-element').previousSibling) document.getElementById('res-element').previousSibling.nodeValue = t.bcElement;
    if(document.getElementById('res-chinese') && document.getElementById('res-chinese').previousSibling) document.getElementById('res-chinese').previousSibling.nodeValue = t.bcChinese;
    if(document.getElementById('res-lifepath') && document.getElementById('res-lifepath').previousSibling) document.getElementById('res-lifepath').previousSibling.nodeValue = t.bcLifePath;
    if(document.getElementById('res-moon-phase') && document.getElementById('res-moon-phase').previousSibling) document.getElementById('res-moon-phase').previousSibling.nodeValue = t.bcMoon;

    // Doğa sesleri (ambiyans) buton metinlerini ve ikonlarını günceller
    if(document.getElementById('btn-winter-wind')) document.getElementById('btn-winter-wind').innerHTML = `&#x21A0; &nbsp; ${t.sndWinter}`;
    if(document.getElementById('btn-rain')) document.getElementById('btn-rain').innerHTML = `&#x21A0; &nbsp; ${t.sndRain}`;
    if(document.getElementById('btn-birds')) document.getElementById('btn-birds').innerHTML = `&#x21A0; &nbsp; ${t.sndBirds}`;
    if(document.getElementById('btn-birds-rain')) document.getElementById('btn-birds-rain').innerHTML = `&#x21A0; &nbsp; ${t.sndBirdsRain}`;
    if(document.getElementById('btn-waves-seagulls')) document.getElementById('btn-waves-seagulls').innerHTML = `&#x21A0; &nbsp; ${t.sndWaves}`;
    if(document.getElementById('btn-fire')) document.getElementById('btn-fire').innerHTML = `&#x21A0; &nbsp; ${t.sndFire}`;
    if(document.getElementById('btn-cafe-noise')) document.getElementById('btn-cafe-noise').innerHTML = `&#x21A0; &nbsp; ${t.sndCafe}`;
    if(document.getElementById('btn-train')) document.getElementById('btn-train').innerHTML = `&#x21A0; &nbsp; ${t.sndTrain}`;
    if(document.getElementById('btn-koto-japanese-zither')) document.getElementById('btn-koto-japanese-zither').innerHTML = `&#x21A0; &nbsp; ${t.sndKoto}`;

    // Destek/kahve paneli ve mobil cihaz döndürme uyarısı metin entegrasyonu
    if(document.querySelector('.support-content h3')) document.querySelector('.support-content h3').innerText = t.supportTitle;
    if(document.querySelector('.support-content p')) document.querySelector('.support-content p').innerText = t.supportText;
    if(document.querySelector('.cyber-coffee-btn span')) document.querySelector('.cyber-coffee-btn span').innerText = t.buyCoffee;
    if(document.querySelector('#mobile-vibe-hint p')) document.querySelector('#mobile-vibe-hint p').innerHTML = t.vibeHint;

    // Sayaç input alanlarının placeholder (Hr, Min, Sec) etiketlerini günceller
    if(document.getElementById('timer-input-hour')) document.getElementById('timer-input-hour').placeholder = t.hr;
    if(document.getElementById('timer-input-min')) document.getElementById('timer-input-min').placeholder = t.min;
    if(document.getElementById('timer-input-sec')) document.getElementById('timer-input-sec').placeholder = t.sec;

    // Akordeon buton metinlerinin (FEATURES, AUDIOS vb.) dil değişimlerini regex/match ile korur
    document.querySelectorAll('.accordion-btn').forEach(btn => {
        if(btn.innerHTML.includes('FEATURES') || btn.innerHTML.includes('ÖZELLİKLER')) btn.innerHTML = btn.innerHTML.replace(/FEATURES|ÖZELLİKLER/, t.features);
        if(btn.innerHTML.includes('VISUAL THEMES') || btn.innerHTML.includes('GÖRSEL TEMALAR')) btn.innerHTML = btn.innerHTML.replace(/VISUAL THEMES|GÖRSEL TEMALAR/, t.visualThemes);
        if(btn.innerHTML.includes('AUDIOS') || btn.innerHTML.includes('SESLER')) btn.innerHTML = btn.innerHTML.replace(/AUDIOS|SESLER/, t.audios);
        
        if(btn.innerHTML.match(/AMBIENT SOUNDS|AMBİYANS SESLERİ/i)) {
            btn.innerHTML = btn.innerHTML.replace(/AMBIENT SOUNDS|SOUNDS|DOĞA SESLERİ|AMBİYANS SESLERİ/i, t.sounds);
        }
        if(btn.innerHTML.match(/MUSIC THEMES|MÜZİK TEMALARI/i)) {
            btn.innerHTML = btn.innerHTML.replace(/MUSIC THEMES|MÜZİK TEMALARI/i, t.musicThemes);
        }
    });

    // Dünya saatleri ekranındaki şehir isim ön eklerini günceller
    if(document.getElementById('wc-local') && document.getElementById('wc-local').previousSibling) document.getElementById('wc-local').previousSibling.nodeValue = t.localTime + " ";
    if(document.getElementById('wc-istanbul') && document.getElementById('wc-istanbul').previousSibling) document.getElementById('wc-istanbul').previousSibling.nodeValue = t.cityIst + " ";
    if(document.getElementById('wc-newyork') && document.getElementById('wc-newyork').previousSibling) document.getElementById('wc-newyork').previousSibling.nodeValue = t.cityNy + " ";
    if(document.getElementById('wc-london') && document.getElementById('wc-london').previousSibling) document.getElementById('wc-london').previousSibling.nodeValue = t.cityLon + " ";
    if(document.getElementById('wc-tokyo') && document.getElementById('wc-tokyo').previousSibling) document.getElementById('wc-tokyo').previousSibling.nodeValue = t.cityTok + " ";
    
    // Sidebar altındaki ağ uyarısı ve hızlı not alanını yerelleştirir
    const noteEl = document.querySelector('.sidebar div p');
    if (noteEl && (noteEl.innerHTML.includes("Quick Note") || noteEl.innerHTML.includes("Kısa Not"))) {
        noteEl.innerHTML = t.quickNote;
    }

    // Dil değiştiğinde eğer astroloji sonuç ekranı açıksa verileri yeni dilde anlık yeniden hesaplar
    if (document.getElementById('zodiac-result') && document.getElementById('zodiac-result').style.display === 'block' && typeof astro !== 'undefined') {
        astro.calculate();
    }

    // Oynatıcı bekleme ve telif bilgi metinlerinin dil güncellemeleri
    if(document.getElementById('track-credit') && document.getElementById('track-credit').innerText === "Awaiting audio...") {
        document.getElementById('track-credit').innerText = t.awaitingAudio;
    }

    const timerAlarmCredits = document.querySelectorAll('#timer-credit-box .credit-text, #alarm-credit-box .credit-text');
    timerAlarmCredits.forEach(el => {
        el.innerText = t.timerAlarmSound;
    });

    const soundCreditEl = document.getElementById('sound-credit');
    if (soundCreditEl) {
        if (typeof audioManager !== 'undefined' && audioManager.activeAmbiences.length === 0) {
            soundCreditEl.innerText = t.playPauseAudio;
        }
    }

    // HTML etiketinin global 'lang' özniteliğini günceller (SEO & tarayıcı uyumu)
    document.documentElement.lang = currentLang;
}

// ------------------------------------------
//  DOM READY VE İLK ÇALIŞTIRMA
// ------------------------------------------
// Sayfa tamamen yüklendiğinde dil motorunu tetikleyerek arayüzü hazırlar
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});

// ------------------------------------------
//  YATAY MOD (LANDSCAPE) GÜVENLİK MOTORU 
// ------------------------------------------
// Telefon yan çevrilmeden önce kullanıcının hangi sekmede olduğunu hafızada tutan siber koruma değişkenleri
window.lastActiveTabName = null; 
window.lastActiveTabId = null;

// -- Ekran yönlendirme koruması, mobil yatay modda yasaklı sekmeleri (WC/BC) engeller ve dikeyde geri yükler
function enforceLandscapeProtection() {
    const isMobileLandscape = (window.innerWidth > window.innerHeight) && (window.innerWidth <= 950);
    
    if (isMobileLandscape) {
        const wc = document.getElementById('world-clock-view');
        const bc = document.getElementById('birth-chart-view');
        
        // Dünya saati (WC) veya doğum haritası (BC) sekmelerinin açık olup olmadığını kontrol eder
        const isWCOpen = wc && window.getComputedStyle(wc).display !== 'none';
        const isBCOpen = bc && window.getComputedStyle(bc).display !== 'none';

         // Eğer yatay modda yasaklı sekmelerden biri açık yakalanırsa hafızaya al ve Home'a yönlendir
        if (isWCOpen || isBCOpen) {
            window.lastActiveTabId = isWCOpen ? 'world-clock-view' : 'birth-chart-view';
            window.lastActiveTabName = isWCOpen ? 'World Clock' : 'Birth Chart';

            if(wc) wc.style.display = 'none';
            if(bc) bc.style.display = 'none';
            
            // Ana saat (home) görünümünü zorla flex/block düzenine çeker
            const home = document.getElementById('clock-view');
            if(home) {
                home.style.display = 'block';
                home.classList.remove('hidden');
            }
            
            // Tab linklerindeki aktiflik sınıflarını sıfırlayıp ilk sekmeyi (home) aktifleştirir
            const tablinks = document.getElementsByClassName("tab-link");
            for (let i = 0; i < tablinks.length; i++) tablinks[i].classList.remove("active");
            if(tablinks[0]) tablinks[0].classList.add("active");
        }
    } else if (window.innerWidth <= 768) { 
        // Eğer dikey moda geri geçildiyse ve hafızamızda bekleyen bir sekme varsa onu geri yükle
        // world-clock tabıyla dikeyden yataya geçince home sekmesi, yataydan dikeye geri geçince world-clock sekmesi karşına çıkmalı
        if (window.lastActiveTabId && window.lastActiveTabName) {
            const home = document.getElementById('clock-view');
            if(home) home.style.display = 'none';

            // Hafızada bekleyen o kısıtlanmış sekmeyi (WC veya BC) otomatik geri açar
            const savedView = document.getElementById(window.lastActiveTabId);
            if(savedView) {
                savedView.style.display = 'block';
                savedView.classList.remove('hidden');
            }

            // Sidebar menü elemanlarını tarayıp, dikey moda geçen sekmenin linkini yeniden 'active' yapar
            const tablinks = document.querySelectorAll('.sidebar li, #features-list li');
            tablinks.forEach(link => {
                link.classList.remove('active');
                if (link.innerText.includes(window.lastActiveTabName) || 
                    link.innerText.includes('Dünya Saati') && window.lastActiveTabName === 'World Clock' ||
                    link.innerText.includes('Doğum Haritası') && window.lastActiveTabName === 'Birth Chart') {
                    link.classList.add('active');
                }
            });

             // Sonsuz döngüyü engellemek için siber koruma değişkenlerini sıfırlar
            window.lastActiveTabId = null;
            window.lastActiveTabName = null;
        }
    }
}

// ------------------------------------------
//  EVENT LISTENERS (OLAY DİNLEYİCİLERİ)
// ------------------------------------------
// Ekran döndürüldüğünde koruma motorunu ve dil yerelleştirmesini çıtır bir gecikmeyle (delay) tetikler
window.addEventListener('orientationchange', () => {
    setTimeout(enforceLandscapeProtection, 200);
    setTimeout(applyTranslations, 250);
});
// Masaüstünde veya mobilde pencere boyutu her değiştiğinde yönlendirme kontrolünü çalıştırır
window.addEventListener('resize', enforceLandscapeProtection);

// ------------------------------------------
//  MOBİL OK MENÜ BUTONU (ARROW MENU TOGGLE)
// ------------------------------------------
// Mobil dikey modda sol taraftan açılan panel menüsünü tetikleyen ana buton işlevi
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
if(mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        document.body.classList.toggle('mobile-menu-open'); // Sınıfı ekler veya söker
    });
}
