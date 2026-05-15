import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🎓</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          ISUFT Capstone Portal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Iloilo State University of Fisheries Science and Technology –{" "}
          College of Information and Communications Technology
        </p>
        <p className="text-gray-500 mt-2">
          Research Proposal Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            icon: "📝",
            title: "Submit Proposals",
            desc: "Create and submit your research proposals for adviser and panel review.",
          },
          {
            icon: "📊",
            title: "Track Progress",
            desc: "Use the Kanban board to manage and track research milestones.",
          },
          {
            icon: "⭐",
            title: "Digital Grading",
            desc: "Panelists and advisers can grade proposals with structured rubrics.",
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl shadow border p-6 text-center">
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Link
          href="/login"
          className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="border border-blue-700 text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
