import { useState } from "react";

export default function PartnerForm({ onDodaj }) {
  const [nazwa, setNazwa] = useState("");
  const [mccMnc, setMccMnc] = useState("");

  async function wyslij(e) {
    e.preventDefault();
    const udalo = await onDodaj(nazwa, mccMnc);
    if (udalo) {
      setNazwa("");
      setMccMnc("");
    }
  }

  return (
    <section className="karta">
      <h2>Dodaj partnera</h2>
      <form onSubmit={wyslij}>
        <label>
          Nazwa
          <input
            value={nazwa}
            onChange={(e) => setNazwa(e.target.value)}
            required
            pattern="\d{5,6}"
            title="5 lub 6 cyfr"
            placeholder="np. 262002"
          />
        </label>
        <button type="submit" className="glowny">
          Dodaj
        </button>
      </form>
    </section>
  );
}
