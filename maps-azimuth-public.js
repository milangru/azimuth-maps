document.addEventListener('DOMContentLoaded', function() {
    // 1. Inicijalizacija mape
    const map = L.map('map').setView([45.238366, 19.842254], 16);

    // 2. Google Hybrid sloj (Satelit + Ulice)
    L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Maps'
    }).addTo(map);

    let marker, lines = [], labels = [];
    const colors = ['red','blue','green','orange','purple','magenta','brown','cyan'];

    function toRad(deg) { return deg * Math.PI / 180; }
    function toDeg(rad) { return rad * 180 / Math.PI; }

    function parseCoords(input, placeholder) {
        input = input && input.trim() ? input.trim() : placeholder;
        input = input.replace(/\//g,' ').replace(/,/g,' ');
        const parts = input.split(/\s+/);
        if(parts.length < 2) return null;
        const lat = parseFloat(parts[0]);
        const lon = parseFloat(parts[1]);
        if(isNaN(lat) || isNaN(lon)) return null;
        return [lat, lon];
    }

    function getInputOrPlaceholder(id) {
        const el = document.getElementById(id);
        return el.value && el.value.trim() ? el.value.trim() : el.placeholder;
    }

    // GLAVNA FUNKCIJA ZA CRTANJE LINIJA
    function drawLines() {
        const startInput = getInputOrPlaceholder("start");
        const anglesInput = getInputOrPlaceholder("angles");
        const distanceInput = getInputOrPlaceholder("distance");

        const coords = parseCoords(startInput, startInput);
        if(!coords) { alert("Put valid cordinates."); return; }
        const [lat, lon] = coords;

        // Čišćenje starih grafika sa mape
        lines.forEach(l => map.removeLayer(l));
        labels.forEach(lbl => map.removeLayer(lbl));
        lines = []; labels = [];
        if(marker) map.removeLayer(marker);

        // Dodavanje markera u centar
        marker = L.marker([lat, lon]).addTo(map);

        const angles = anglesInput.split(',').map(a => parseFloat(a.trim())).filter(a => !isNaN(a));
        if(angles.length === 0) { alert("Put at least one azimuth."); return; }

        const bounds = L.latLngBounds([lat, lon]);

        // Podešavanje distance
        let distance = parseFloat(distanceInput);
        if(isNaN(distance) || distance <= 0){
            const mapBounds = map.getBounds();
            const ne = mapBounds.getNorthEast();
            const sw = mapBounds.getSouthWest();
            const mapLatDiff = Math.abs(ne.lat - sw.lat);
            const mapLonDiff = Math.abs(ne.lng - sw.lng);
            const mapSizeMeters = Math.max(mapLatDiff*111320, mapLonDiff*111320*Math.cos(lat*Math.PI/180));
            distance = mapSizeMeters * 0.45;
        }

        const R = 6371000;

        angles.forEach((angle, idx) => {
            const θ = toRad(angle);
            const δ = distance / R;
            const φ1 = toRad(lat);
            const λ1 = toRad(lon);

            const φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));
            
            const λ2 = λ1 + Math.atan2(
                Math.sin(θ)*Math.sin(δ)*Math.cos(φ1), 
                Math.cos(δ) - Math.sin(φ1)*Math.sin(φ2)
            );

            const destLat = toDeg(φ2);
            const destLon = toDeg(((λ2 + 540) % 360) - 180);

            bounds.extend([destLat, destLon]);

            const lineColor = colors[idx % colors.length];
            const line = L.polyline([[lat, lon],[destLat,destLon]], {color:lineColor, weight:3}).addTo(map);
            lines.push(line);

            const label = L.marker([destLat,destLon], {
                icon: L.divIcon({className:'angle-label', html: angle+"°", iconSize:[30,15], iconAnchor:[15,15]})
            }).addTo(map);
            labels.push(label);
        });

        if(angles.length <= 1){
            const pad = 0.0005;
            bounds.extend([lat+pad, lon+pad]);
            bounds.extend([lat-pad, lon+pad]);
        }

        // Pametno zumiranje oko azimuta
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }

    // === AUTOMATSKO PROVERAVANJE PARAMETARA IZ LINKA ===
    function checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const startParam = urlParams.get('start');     
        const anglesParam = urlParams.get('angles');   
        const distanceParam = urlParams.get('distance'); 

        if (startParam) document.getElementById("start").value = startParam.replace(/,/g, ' ');
        if (anglesParam) document.getElementById("angles").value = anglesParam;
        if (distanceParam) document.getElementById("distance").value = distanceParam;

        if (startParam && anglesParam) {
            drawLines();
        }
    }

    // === FUNKCIJA ZA KREIRANJE I KOPIRANJE/DELJENJE GENERISANOG LINKA ===
    function shareLink() {
        const startVal = document.getElementById("start").value.trim() || document.getElementById("start").placeholder;
        const anglesVal = document.getElementById("angles").value.trim() || document.getElementById("angles").placeholder;
        const distanceVal = document.getElementById("distance").value.trim() || document.getElementById("distance").placeholder;

        const baseUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
        
        const params = new URLSearchParams();
        if (startVal) params.append('start', startVal.replace(/\s+/g, ',')); 
        if (anglesVal) params.append('angles', anglesVal.replace(/\s+/g, ''));
        if (distanceVal) params.append('distance', distanceVal);

        const finalShareUrl = baseUrl + '?' + params.toString();

        // 1. Provera da li pretraživač podržava Web Share API (mobilni telefoni)
        if (navigator.share) {
            navigator.share({
                title: 'Drawing Azimuth (Bearing) Lines On Maps',
                text: 'Look at shared azimuths on maps:',
                url: finalShareUrl
            })
            .then(() => console.log('Uspesno podeljeno!'))
            .catch(err => {
                // Korisnik je verovatno otkazao deljenje (kliknuo "X" ili pored menija),
                // pa ovde ne moramo izbacivati dosadan alert, samo logujemo u konzolu
                console.log('Sharing canceld:', err);
            });
        } else {
            // 2. Fallback za starije uređaje i desktop pretraživače (Tvoj originalni kod)
            navigator.clipboard.writeText(finalShareUrl).then(() => {
                alert("Link copied! You can share it now.");
            }).catch(err => {
                prompt("Copy this link by hand:", finalShareUrl);
            });
        }
    }

    // Povezivanje komandi sa HTML elementima
    document.getElementById("drawBtn").addEventListener("click", drawLines);
    document.getElementById("shareBtn").addEventListener("click", shareLink);

    ["start","angles","distance"].forEach(id => {
        document.getElementById(id).addEventListener("keypress", e => {
            if(e.key === "Enter") drawLines();
        });
    });

    const toggleBtn = document.getElementById("toggle-btn");
    const controls = document.getElementById("controls");
    toggleBtn.addEventListener("click", () => {
        if(controls.style.display === "none") {
            controls.style.display = "block"; 
            toggleBtn.innerText = "Hide Controls";
        } else {
            controls.style.display = "none"; 
            toggleBtn.innerText = "Show Controls";
        }
    });

    checkURLParams();
});
