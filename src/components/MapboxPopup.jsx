import React from "react";

const MapboxPopup = ({ properties }) => {
  return (
    <div className="p-8 bg-gray-100 rounded-lg">
      <h3 className="text-[14px] font-bold text-orange">{properties.name}</h3>
      <div dangerouslySetInnerHTML={{ __html: properties.desc }} />
    </div>
  );
};

export default MapboxPopup;
