// src/components/CabinList.js
import React from 'react';
import CabinCard from './CabinCard';

function CabinList({ cabins, services, onReserve }) {
  if (cabins.length === 0) {
    return (
      <div className="alert alert-warning" role="alert">
        No hay cabañas disponibles que coincidan con los filtros.
      </div>
    );
  }

  return (
    // row-cols-* para el diseño responsive de la cuadrícula
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"> 
      {cabins.map(cabin => (
        <div className="col" key={cabin.ID_Cabana}>
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