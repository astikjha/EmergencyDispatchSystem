import { useNavigate } from "react-router-dom";
import { logout, getFullName } from "../../auth/authUtils";

function PatientDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Patient Dashboard</h1>
          <p className="text-slate-400">Welcome, {getFullName()}</p>
        </div>
        <button onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm">
          Logout
        </button>
      </div>
      <p className="text-slate-400">Patient dashboard coming next...</p>
    </div>
  );
}

export default PatientDashboard;