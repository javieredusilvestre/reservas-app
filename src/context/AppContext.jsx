import { createContext, useState } from "react";
import { mockCabins } from "../data/mockCabins";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [cabins, setCabins] = useState(mockCabins);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeAdminTab, setActiveAdminTab] = useState("reservas");

    const login = (user, pass) => {
        if (user === "admin" && pass === "1234") {
            setIsAdmin(true);
            return true;
        }
        return false;
    };

    const logout = () => setIsAdmin(false);

    const reserveCabin = (id, cliente) => {
        setCabins(prev =>
            prev.map(c =>
                c.id === id
                    ? {
                        ...c,
                        estado: "Reservada",
                        reservaInfo: { cliente, fecha: new Date().toLocaleDateString() }
                    }
                    : c
            )
        );
    };

    const cancelReservation = id => {
        setCabins(prev =>
            prev.map(c =>
                c.id === id ? { ...c, estado: "Disponible", reservaInfo: null } : c
            )
        );
    };

    return (
        <AppContext.Provider value={{
            cabins,
            isAdmin,
            login,
            logout,
            reserveCabin,
            cancelReservation,
            activeAdminTab,
            setActiveAdminTab
        }}>
            {children}
        </AppContext.Provider>
    );
};
