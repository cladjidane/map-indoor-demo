import { useState } from "react";

const Drawer = ({drawerIsOpen, setDrawerIsOpen, drawerContent}) => {

  const handleClick = (e) => {
    setDrawerIsOpen(!drawerIsOpen);
  };
  
  if(!drawerContent) return
  return (
    <div className="absolute w-1/3 h-full z-[1000] left-0 pointer-events-none">
      <div
        className={`bg-black text-white rounded-xl w-full shadow-lg m-5 p-5 transition-all transform p-8 ${
          !drawerIsOpen ? "-translate-y-96" : "translate-y-0"
        } `}
      >
        <img className="w-full h-48 rounded-xl object-cover mb-8" src="https://brestarena.fr/sites/default/files/08062015-_igp4198_benjamin_deroche_bd.jpg" />
        <h2 className="text-xl font-bold mb-4">{drawerContent.name}</h2>
        <div
          dangerouslySetInnerHTML={{__html: drawerContent.desc}}
        />

        <div
          className={`absolute right-0 top-2 w-8 transition-all transform border-1 border-red-300 pointer-events-auto`}
        >
          <button
            onClick={handleClick}
            className="border-0 bg-transparent transform -rotate-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fillRule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
