import React from 'react';

const MapboxPopup = ({ properties }) => {
  return (
    <div className="p-8 bg-red-700">
      <h3>Informations de la Feature</h3>
      <ul>
        {Object.entries(properties).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MapboxPopup;