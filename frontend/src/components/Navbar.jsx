import { useNavigate } from "react-router-dom";
import { logout, getFullName, getRole } from "../auth/authUtils";

function Navbar({ title }) {
  const navigate = useNavigate();
  const role = getRole();

  const roleColors = {
    admin: "bg-purple-600",
    patient: "bg-blue-600",
    hospital: "bg-green-600",
    driver: "bg-orange-600",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚑</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">
              EmergencyDispatch
            </h1>
            <p className="text-slate-400 text-xs">{title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white text-sm font-medium">{getFullName()}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full text-white ${roleColors[role]}`}>
              {role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;