import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import CabinCard from "../components/CabinCard";

export default function ClientView() {
    const { cabins, reserveCabin } = useContext(AppContext);
    const [filter, setFilter] = useState("all");

    const filtered = filter === "all"
        ? cabins
        : cabins.filter(c => c.tipo === filter);

    return (
        <div className="client-view">
            <section className="hero">
                <h1>Conecta con la Naturaleza</h1>
                <p>Reserva exclusiva en el corazón del bosque valdiviano</p>
            </section>

            <div className="filters-container">
                <select onChange={e => setFilter(e.target.value)}>
                    <option value="all">Ver Todas</option>
                    <option value="Grande">Grande</option>
                    <option value="Mediana">Mediana</option>
                    <option value="Pequeña">Pequeña</option>
                </select>
            </div>

            <div className="grid">
                {filtered.map(c => (
                    <CabinCard
                        key={c.id}
                        cabin={c}
                        onReserve={reserveCabin}
                    />
                ))}
            </div>
        </div>
    );
}
