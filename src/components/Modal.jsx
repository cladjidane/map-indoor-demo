// src/components/Modal.jsx
import React, { useEffect } from "react";

import ReactDOM from "react-dom";

const Modal = ({ isOpen, onClose, children }) => {
  // Toujours appeler les Hooks, indépendamment de l'état `isOpen`

  useEffect(() => {
    if (isOpen) {
      // Empêcher le scroll du fond lorsque le modal est ouvert
      document.body.style.overflow = "hidden";

      // Gérer la fermeture du modal avec la touche "Escape"
      const handleEsc = (event) => {
        if (event.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleEsc);

      // Nettoyage lors de la fermeture du modal
      return () => {
        document.body.style.overflow = "auto";
        document.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  // Ne pas rendre le contenu du modal si `isOpen` est faux
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} // Fermer le modal en cliquant sur le fond
    >
      <div
        className="rounded-lg w-11/12 md:w-3/4 lg:w-1/2 relative"
        onClick={(e) => e.stopPropagation()} // Empêcher la fermeture en cliquant à l'intérieur
      >
        {/* Bouton de fermeture */}
        <button
          className="absolute top-2 right-2 text-gray-700 hover:text-gray-900 text-2xl"
          onClick={onClose}
          aria-label="Fermer le modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
