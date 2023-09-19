import React from 'react';
import PropTypes from 'prop-types';


function ArrowToGo({orientation}) {
  return (
    <div className={`${orientation === "top" ? "rotate-180" : ""} transform w-8 h-8 mt-8`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        data-name="Calque 2"
        viewBox="0 0 14.89 14.89"
      >
        <g data-name="Calque 1">
          <circle
            cx={7.44}
            cy={7.44}
            r={7.44}
            style={{
              fill: "#e94f1b",
            }}
          />
          <path
            d="M8.15 7.96c-.15 0-.3.02-.45.02.02-.45.05-.9.08-1.35.06-.91.21-1.93-.17-2.78-.09-.2-.37-.24-.54-.14-.2.11-.23.35-.14.54.16.37.13.8.12 1.19-.01.47-.04.94-.07 1.41l-.06 1.07c-.17-.04-.34-.09-.48-.18-.2-.12-.38-.04-.49.1-.16.1-.26.31-.14.52l1.53 2.67c.2.35.72.18.74-.2.04-.81.2-1.6.46-2.38.08-.23-.13-.52-.38-.5Z"
            style={{
              fill: "white",
            }}
          />
        </g>
      </svg>
    </div>
  );
}
ArrowToGo.propTypes = {
    orientation: PropTypes.oneOf(['top', 'bottom']).isRequired,
  };

export default ArrowToGo;
