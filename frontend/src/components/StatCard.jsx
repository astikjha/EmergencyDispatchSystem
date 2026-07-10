function StatCard({ title, value, subtitle, color = "red" }) {
  const colors = {
    red: "border-red-500 text-red-400",
    green: "border-green-500 text-green-400",
    blue: "border-blue-500 text-blue-400",
    yellow: "border-yellow-500 text-yellow-400",
    purple: "border-purple-500 text-purple-400",
  };

  return (
    <div className={`bg-slate-800 border-l-4 ${colors[color]} rounded-lg p-4`}>
      <p className="text-slate-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colors[color].split(" ")[1]}`}>
        {value}
      </p>
      {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
}

export default StatCard;