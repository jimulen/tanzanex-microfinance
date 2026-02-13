export default function Navbar() {
  return (
    <nav className="bg-secondary text-white px-6 py-4 flex justify-between">
      <h1 className="text-xl font-bold">Microfinance System</h1>
      <button className="bg-accent text-dark px-4 py-1 rounded-lg font-semibold">
        Logout
      </button>
    </nav>
  );
}
