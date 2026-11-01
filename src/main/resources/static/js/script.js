const API = "/api/partners";

// Teksty błędów, gdy backend nie przyśle własnego komunikatu
const OPISY_BLEDOW = {
  404: "Nie znaleziono partnera.",
  409: "Partner o tym MCC-MNC już istnieje.",
  400: "Niepoprawne dane.",
};

// Czytelne nazwy typów kontaktów (wartości z enuma ContactType w Javie)
const TYPY_KONTAKTOW = {
  NOC_24x7: "NOC 24/7",
  ROAMING_COORDINATOR: "Koordynator roamingu",
  ESCALATION: "Eskalacja",
  IREG_TESTING: "Testy IREG",
  FRAUD: "Fraud",
};

// Partner, którego kontakty są aktualnie otwarte (null = żaden)
let wybranyPartner = null;

// ---------- Komunikacja z backendem ----------

// Jedna funkcja do wszystkich zapytań: wysyła, zapisuje w logu, obsługuje błędy
async function zapytanie(metoda, adres, dane) {
  const opcje = { method: metoda, headers: {} };
  if (dane) {
    opcje.headers["Content-Type"] = "application/json";
    opcje.body = JSON.stringify(dane);
  }

  const odpowiedz = await fetch(adres, opcje);
  dopiszDoLogu(metoda, adres, odpowiedz.status);

  if (!odpowiedz.ok) {
    let tekst = OPISY_BLEDOW[odpowiedz.status] || "Błąd " + odpowiedz.status;
    try {
      const blad = await odpowiedz.json();
      if (blad.message) tekst = blad.message; // gdy włączone server.error.include-message
    } catch (e) {
      /* odpowiedź bez JSON-a */
    }
    throw new Error(tekst);
  }

  // 204 No Content (DELETE) nie ma treści
  return odpowiedz.status === 204 ? null : odpowiedz.json();
}

// ---------- Partnerzy (CRUD) ----------

async function wczytajListe() {
  const partnerzy = await zapytanie("GET", API);
  pokazTabele(partnerzy);

  // jeśli otwarte są kontakty, odśwież nazwę w nagłówku albo zamknij sekcję,
  // gdy partnera już nie ma (np. został usunięty)
  if (wybranyPartner) {
    const aktualny = partnerzy.find((p) => p.mccMnc === wybranyPartner.mccMnc);
    if (aktualny) {
      wybranyPartner = aktualny;
      pokazNaglowekKontaktow();
    } else {
      zamknijKontakty();
    }
  }
}

async function dodaj(nazwa, mccMnc) {
  const nowy = await zapytanie("POST", API, { name: nazwa, mccMnc: mccMnc });
  pokazKomunikat(`Dodano: ${nowy.name} (id ${nowy.id})`, true);
  await wczytajListe();
}

async function zmienNazwe(mccMnc, nowaNazwa) {
  await zapytanie("PUT", `${API}/${mccMnc}`, {
    name: nowaNazwa,
    mccMnc: mccMnc,
  });
  pokazKomunikat(`Zmieniono nazwę na: ${nowaNazwa}`, true);
  await wczytajListe();
}

async function usun(mccMnc, nazwa) {
  if (!confirm(`Usunąć partnera ${nazwa}? Jego kontakty też zostaną usunięte.`))
    return;
  await zapytanie("DELETE", `${API}/${mccMnc}`);
  pokazKomunikat(`Usunięto: ${nazwa}`, true);
  await wczytajListe();
}

// ---------- Kontakty ----------

// GET /api/partners/{mccMnc}/contacts
async function otworzKontakty(partner) {
  wybranyPartner = partner;
  const kontakty = await zapytanie("GET", `${API}/${partner.mccMnc}/contacts`);

  pokazNaglowekKontaktow();
  pokazKontakty(kontakty);
  oznaczWybranyWiersz();

  const sekcja = document.getElementById("sekcjaKontakty");
  sekcja.hidden = false;
  sekcja.scrollIntoView({ behavior: "smooth", block: "start" });
}

// POST /api/partners/{mccMnc}/contacts
async function dodajKontakt(dane) {
  const nowy = await zapytanie(
    "POST",
    `${API}/${wybranyPartner.mccMnc}/contacts`,
    dane,
  );
  pokazKomunikat(`Dodano kontakt: ${nowy.name}`, true);
  await otworzKontakty(wybranyPartner); // odśwież listę kontaktów
}

function zamknijKontakty() {
  wybranyPartner = null;
  document.getElementById("sekcjaKontakty").hidden = true;
  oznaczWybranyWiersz();
}

// ---------- Wyświetlanie ----------

function pokazTabele(partnerzy) {
  const tabela = document.getElementById("tabela");
  tabela.innerHTML = "";

  if (partnerzy.length === 0) {
    tabela.innerHTML = `<tr><td colspan="4" class="pusto">Brak partnerów</td></tr>`;
    return;
  }

  for (const p of partnerzy) {
    const wiersz = document.createElement("tr");
    wiersz.dataset.mccMnc = p.mccMnc;
    wiersz.innerHTML = `
        <td>${p.id}</td>
        <td class="nazwa"></td>
        <td><code></code></td>
        <td class="akcje">
          <button class="zwykly kontakty">Kontakty</button>
          <button class="zwykly edytuj">Edytuj</button>
          <button class="usun">Usuń</button>
        </td>`;
    // textContent zamiast innerHTML: tekst z bazy nie jest wykonywany jako HTML
    wiersz.querySelector(".nazwa").textContent = p.name;
    wiersz.querySelector("code").textContent = p.mccMnc;

    wiersz.querySelector(".kontakty").onclick = () =>
      obsluz(() => otworzKontakty(p));
    wiersz.querySelector(".edytuj").onclick = () => trybEdycji(wiersz, p);
    wiersz.querySelector(".usun").onclick = () =>
      obsluz(() => usun(p.mccMnc, p.name));
    tabela.appendChild(wiersz);
  }

  oznaczWybranyWiersz();
}

function pokazKontakty(kontakty) {
  const tabela = document.getElementById("tabelaKontaktow");
  tabela.innerHTML = "";

  if (kontakty.length === 0) {
    tabela.innerHTML = `<tr><td colspan="4" class="pusto">Brak kontaktów</td></tr>`;
    return;
  }

  for (const k of kontakty) {
    const wiersz = document.createElement("tr");
    wiersz.innerHTML = `
        <td><span class="typ"></span></td>
        <td class="nazwa"></td>
        <td class="email"></td>
        <td class="telefon"></td>`;

    const typ = wiersz.querySelector(".typ");
    typ.textContent = TYPY_KONTAKTOW[k.type] || k.type;
    typ.classList.add(k.type);

    wiersz.querySelector(".nazwa").textContent = k.name;
    wiersz.querySelector(".telefon").textContent = k.phone || "—";

    // e-mail jako klikalny link mailto:
    const komorkaEmail = wiersz.querySelector(".email");
    if (k.email) {
      const link = document.createElement("a");
      link.href = "mailto:" + k.email;
      link.textContent = k.email;
      komorkaEmail.appendChild(link);
    } else {
      komorkaEmail.textContent = "—";
    }

    tabela.appendChild(wiersz);
  }
}

function pokazNaglowekKontaktow() {
  document.getElementById("kontaktyPartner").textContent =
    `${wybranyPartner.name} (${wybranyPartner.mccMnc})`;
}

// Podświetla w tabeli partnera, którego kontakty są otwarte
function oznaczWybranyWiersz() {
  for (const wiersz of document.querySelectorAll("#tabela tr")) {
    wiersz.classList.toggle(
      "wybrany",
      wybranyPartner !== null &&
        wiersz.dataset.mccMnc === wybranyPartner.mccMnc,
    );
  }
}

// Zamienia komórkę z nazwą na pole tekstowe z przyciskami Zapisz / Anuluj
function trybEdycji(wiersz, partner) {
  const komorka = wiersz.querySelector(".nazwa");
  const akcje = wiersz.querySelector(".akcje");

  komorka.innerHTML = `<input>`;
  const pole = komorka.querySelector("input");
  pole.value = partner.name;
  pole.focus();

  akcje.innerHTML = `
      <button class="glowny zapisz">Zapisz</button>
      <button class="zwykly anuluj">Anuluj</button>`;

  const zapisz = () =>
    obsluz(() => zmienNazwe(partner.mccMnc, pole.value.trim()));
  akcje.querySelector(".zapisz").onclick = zapisz;
  akcje.querySelector(".anuluj").onclick = () => obsluz(wczytajListe);
  pole.onkeydown = (e) => {
    if (e.key === "Enter") zapisz();
    if (e.key === "Escape") obsluz(wczytajListe);
  };
}

function pokazKomunikat(tekst, sukces) {
  const el = document.getElementById("komunikat");
  el.textContent = tekst;
  el.className = sukces ? "ok" : "blad";
}

function dopiszDoLogu(metoda, adres, status) {
  const li = document.createElement("li");
  const godzina = new Date().toLocaleTimeString("pl-PL");
  const klasa = status < 400 ? "status-ok" : "status-blad";
  li.innerHTML = `${godzina} <span class="metoda ${metoda}">${metoda}</span>${adres} → <span class="${klasa}">${status}</span>`;
  document.getElementById("log").prepend(li);
}

// Wywołuje akcję i pokazuje błąd zamiast "cichej" awarii
async function obsluz(akcja) {
  try {
    await akcja();
  } catch (e) {
    pokazKomunikat(
      e.message === "Failed to fetch"
        ? "Brak połączenia z backendem. Czy aplikacja Spring działa?"
        : e.message,
      false,
    );
  }
}

// ---------- Start ----------

document.getElementById("formularz").onsubmit = (e) => {
  e.preventDefault(); // bez tego przeglądarka przeładowałaby stronę
  const nazwa = document.getElementById("nazwa");
  const mccMnc = document.getElementById("mccMnc");
  obsluz(async () => {
    await dodaj(nazwa.value.trim(), mccMnc.value.trim());
    e.target.reset();
  });
};

document.getElementById("formularzKontaktu").onsubmit = (e) => {
  e.preventDefault();
  const dane = {
    type: document.getElementById("kontaktTyp").value,
    name: document.getElementById("kontaktNazwa").value.trim(),
    // puste pole wysyłamy jako null, tak jak brak telefonu w pliku XML
    email: document.getElementById("kontaktEmail").value.trim() || null,
    phone: document.getElementById("kontaktTelefon").value.trim() || null,
  };
  obsluz(async () => {
    await dodajKontakt(dane);
    e.target.reset();
  });
};

document.getElementById("zamknijKontakty").onclick = zamknijKontakty;

obsluz(wczytajListe);
