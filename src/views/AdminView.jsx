import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function AdminView() {
    const { cabins, cancelReservation, activeAdminTab, setActiveAdminTab } =
        useContext(AppContext);

    const reservadas = cabins.filter(c => c.estado === "Reservada");

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div
                    className={`sidebar-item ${activeAdminTab === "reservas" ? "active" : ""}`}
                    onClick={() => setActiveAdminTab("reservas")}
                >
                    Reservas
                </div>

                <div
                    className={`sidebar-item ${activeAdminTab === "inventario" ? "active" : ""}`}
                    onClick={() => setActiveAdminTab("inventario")}
                >
                    Inventario
                </div>
            </aside>

            <main className="admin-content">
                {activeAdminTab === "reservas" && (
                    <>
                        <h2>Reservas Activas</h2>
                        <table>
                            <tbody>
                                {reservadas.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.tipo}</td>
                                        <td>{c.reservaInfo?.cliente}</td>
                                        <td>{c.reservaInfo?.fecha}</td>
                                        <td>
                                            <button onClick={() => cancelReservation(c.id)}>
                                                Cancelar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {activeAdminTab === "inventario" && (
                    <h2>Inventario (pronto)</h2>
                )}
            </main>
        </div>
    );
}
