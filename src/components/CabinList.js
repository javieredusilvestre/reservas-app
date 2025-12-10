import React from 'react';
import CabinCard from './CabinCard';

function CabinList({ cabins, services, onReserve }) {
    if (cabins.length === 0) {
        return <div className="alert alert-warning">No se encontraron cabañas que coincidan con los filtros aplicados.</div>;
    }

    return (
        <div className="row g-4">
            {cabins.map((cabin, index) => (
                <div 
                    key={cabin.id_cabana} 
                    className="col-12 col-md-6 col-lg-4"
                    style={{ animationDelay: `${index * 0.08}s` }} 
                > 
                    <CabinCard 
                        cabin={cabin} 
                        services={services} 
                        onReserve={onReserve} 
                    />
                </div>
            ))}
        </div>
    );
}

export default CabinList;