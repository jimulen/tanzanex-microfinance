export function StatCard({
    title,
    value,
  }: {
    title: string;
    value: string;
  }) {
    return (
      <div className="bg-white p-4 rounded shadow">
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
      </div>
    );
  }
  