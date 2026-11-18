export const API = "/api/partners";

const OPISY_BLEDOW = {
  404: "Nie znaleziono partnera.",
  409: "Partner o tym MCC-MNC już istnieje.",
  400: "Niepoprawne dane.",
};

export async function zapytanie(metoda, adres, dane) {
  const opcje = { method: metoda, headers: {} };
  if (dane) {
    opcje.headers["Content-type"] = "aplication/json";
    opcje.body = JSON.stringify(dane);
  }

  const odpowiedz = await fetch(adres, opcje);

  if (!odpowiedz.ok) {
    let tekst = OPISY_BLEDOW[odpowiedz.status] || "Błąd " + odpowiedz.status;
    try {
      const blad = await odpowiedz.json();
      if (blad.message) tekst = blad.message;
    } catch {
      /* Odpowiedz bez json */
    }
    throw new Error(tekst);
  }

  return odpowiedz.status === 204 ? null : odpowiedz.json();
}
