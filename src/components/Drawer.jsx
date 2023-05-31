import { useState } from "react";

const Drawer = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(true);

  const handleClick = (e) => {
    setDrawerIsOpen(!drawerIsOpen);
  };
  return (
    <div className="absolute w-1/3 h-full z-10 flex">
      <div
        className={`bg-slate-300 w-full rounded shadow-lg m-5 p-5 transition-all transform ${
          drawerIsOpen ? "-translate-x-full" : "translate-x-0"
        } `}
      >
        <h2 className="text-xl font-bold mb-4">Informations</h2>

        <div>
          <p>Cliquez sur les zones de la carte pour afficher les informations</p>
        </div>
      </div>

      <div
        className={`absolute top-8 w-full transition-all transform border-1 border-red-300 ${
          drawerIsOpen ? "translate-x-8 " : "translate-x-full "
        } `}
      >
        {drawerIsOpen ? (
          <button onClick={handleClick} className="border-0 bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6"
            >
              <path
                fill-rule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleClick}
            className="border-0 bg-transparent transform rotate-180"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6"
            >
              <path
                fill-rule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Drawer;
