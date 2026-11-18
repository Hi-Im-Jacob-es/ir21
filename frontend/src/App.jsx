import { useEffect, useState } from "react";
import { API, zapytanie } from "./api";
import PartnerForm from "./components/PartnerForm";

export default function App() {
  const [partnerzy, setPartnerzy] = useState([]);
  const [komunikat, setKomunikat] = useState(null); // { tekst, ok }

  async function wczytajListe() {
    setPartnerzy(await zapytanie("GET", API));
  }

  useEffect(() => {
    wczytajListe().catch((e) => setKomunikat({ tekst: e.message, ok: false }));
  }, []);

  async function dodaj(nazwa, mccMnc) {
    try {
      const nowy = await zapytanie("POST", API, { name: nazwa, mccMnc });
      setKomunikat({ tekst: `Dodano: ${nowy.name} (id ${nowy.id})`, ok: true });
      await wczytajListe();
      return true;
    } catch (e) {
      setKomunikat({ tekst: e.message, ok: false });
      return false;
    }
  }

  return (
    <main>
      <h1>Partnerzy roamingowi</h1>

      {komunikat && (
        <p id="komunikat" className={komunikat.ok ? "ok" : "blad"}>
          {komunikat.tekst}
        </p>
      )}

      <PartnerForm onDodaj={dodaj} />

      <section className="karta">
        <h2>Lista partnerów</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Operator name</th>
              <th>MCC-MNC</th>
            </tr>
          </thead>
          <tbody>
            {partnerzy.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.mccMnc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
