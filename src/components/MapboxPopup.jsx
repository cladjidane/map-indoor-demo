import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { EffectFade, Navigation, Pagination } from "swiper/modules";
// src/components/MapboxPopup.js
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import Modal from "./Modal";

const MapboxPopup = ({ properties, closePopup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const images = JSON.parse(properties.images); // Assurez-vous que c'est un tableau d'objets avec { url: '...' }

  const openModal = () => {
    console.log("Ouverture de la modal avec les images :", images);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative rounded-lg pb-6">
      <h3 onClick={() => {
          openModal();
        }} className="cursor-pointer absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[14px] font-bold text-orange">
        {properties.name}
      </h3>
      {/* Image cliquable */}
      <img
        src={images[0].url}
        className="w-[320px] h-56 cursor-pointer"
        onClick={() => {
          openModal();
        }}
        alt={properties.name}
      />

      {/* Modal avec Swiper */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {/* Bouton de fermeture supplémentaire */}
        <button
          className="w-8 h-8 absolute top-4 right-4 bg-white bg-opacity-75 hover:bg-opacity-100 text-black rounded-full flex items-center justify-center shadow-md z-10"
          onClick={closeModal}
          aria-label="Fermer le carousel"
        >
          &times;
        </button>
        {/* Carousel Swiper */}
        <Swiper
          modules={[Navigation, Pagination, EffectFade]}
          navigation
          autoHeight={true} 
          effect="fade"
          spaceBetween={50}
          slidesPerView={1}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <img src={image.url} alt={`${properties.name} ${index + 1}`} className="w-full h-full object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      </Modal>
    </div>
  );
};

export default MapboxPopup;
