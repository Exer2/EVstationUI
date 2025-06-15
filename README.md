# EV Polnilna Postaja - Simuliran UI

Prototip uporabniškega vmesnika za polnilno postajo električnih vozil z Node-RED integracijo.

## Opis projekta

Ta projekt predstavlja simuliran uporabniški vmesnik (mockup) za polnilno postajo električnih vozil. Služi kot prototip za demonstracijo funkcionalnosti in uporabniške izkušnje pri polnjenju električnih vozil.

## Funkcionalnosti

### Glavni vmesnik
- **Statusna vrstica** z realnim časom (vključno s sekundami)
- **Indikator stanja** polnjenja z vizualnimi povratnimi informacijami
- **Prikaz podatkov o polnjenju**:
  - Čas polnjenja (HH:MM:SS)
  - Stanje baterije (%)
  - Strošek polnjenja (€)
  - Trenutna moč polnjenja (kW)

### Načini polnjenja
- **Ekonomično polnjenje**: 11 kW, 0,20 € / kWh
- **Hitro polnjenje**: 22 kW, 0,35 € / kWh
- Možnost preklapljanja med načini tudi med polnjenjem

### Informacijski sistem
- Interaktivni gumb "i" za prikaz podrobnih informacij
- Modalno okno z informacijami o cenah in moči polnjenja
- Ocenjene hitrosti polnjenja za vsak način

### Node-RED integracija
- WebSocket komunikacija z Node-RED
- Dvosmerna komunikacija (pošiljanje in prejemanje podatkov)
- Možnost daljinskega upravljanja polnjenja
- Avtomatska ponovna povezava ob prekinitvah

## Struktura projekta

```
EVStationUI/
├── index.html          # Glavna HTML datoteka
├── css/
│   └── style.css      # Stilski listi (CSS)
├── js/
│   └── script.js      # JavaScript logika
└── README.md          # Ta datoteka
```

## Namestitev in zagon

### Koraki za zagon

### Github pages
   - UI je dostopen na github pages na naslovu https://exer2.github.io/EVstationUI/
  
### Lokalno:

1. **Kloniraj ali prenesi projekt**
   ```bash
   git clone https://github.com/Exer2/EVstationUI.git
   cd EVStationUI
   ```

2. **Zaženi aplikacijo**
   - Odpri `index.html` v brskalniku


## Tehnične lastnosti

### Frontend
- **HTML5** - semantična struktura
- **CSS3** - responzivni dizajn, animacije
- **Vanilla JavaScript** - brez zunanjih knjižnic

### Simulacija
- Realistična variacija moči polnjenja
- Izračun stanja baterije na podlagi energije
- Sprotno spremljanje stroškov
- Posodabljanje podatkov vsako sekundo

### Responzivnost
- Prilagajanje različnim velikostim zaslonov
- Optimizirano za tablice in zaslone na dotik
- Dostopnost in intuitivna uporaba

## Uporaba

1. **Izbira načina polnjenja**: Kliknite na "Ekonomično" ali "Hitro"
2. **Ogled informacij**: Kliknite na gumb "i" za podrobnosti o cenah
3. **Začetek polnjenja**: Pritisnite "Začni polnjenje"
4. **Spremljanje**: Opazujte podatke v realnem času
5. **Konec polnjenja**: Pritisnite "Ustavi polnjenje"
