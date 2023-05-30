import { Outlet, Link } from "react-router-dom";

export default function Root() {
  return (
    <div className="bg-red-100 h-full flex">
      <h2>Démo</h2>
      <ul>
        <li>
          <Link to={`map-indoor/`}>Map Indoor avec React-Map_gl</Link>
        </li>
        <li>
          <Link to={`map-indoor-mapbox/`}>Map Indoor avec mapbox</Link>
        </li>
      </ul>
    </div>
  );
}
