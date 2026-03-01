import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const Explore = () => {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Navbar />

      {/* HERO SECTION */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl font-bold mb-6">
          Start Exploring
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Solve coding problems, compete in contests, and improve your programming
          skills step by step. Everything you need to prepare for placements
          and interviews.
        </p>

        <Link
          to="/problems"
          className="bg-green-500 hover:bg-green-600 transition px-6 py-3 rounded-lg font-semibold"
        >
          Browse Problems
        </Link>
      </section>

      {/* FEATURE CARDS */}
      <section className="px-10 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">

          {/* Problems & Contests */}
          <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-green-500 transition">
            <h2 className="text-xl font-semibold mb-4 text-green-400">
              Questions & Contests
            </h2>

            <p className="text-gray-400 mb-6">
              Practice curated coding problems from basic to advanced.
              Participate in timed contests to test your skills.
            </p>

            <Link
              to="/problems"
              className="text-green-400 hover:underline"
            >
              View Problems →
            </Link>
          </div>

          {/* Companies */}
          <div className="bg-[#0f172a] p-8 rounded-xl border border-gray-800 hover:border-blue-500 transition">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              Companies & Hiring
            </h2>

            <p className="text-gray-400 mb-6">
              Get ready for technical interviews. Solve company-specific
              questions and prepare for placements.
            </p>

            <Link
              to="/companies"
              className="text-blue-400 hover:underline"
            >
              Explore Companies →
            </Link>
          </div>

        </div>
      </section>

      {/* TRENDING PROBLEMS SECTION */}
      <section className="px-10 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">
            Trending Problems
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800 hover:border-yellow-500 transition">
              <h3 className="font-semibold mb-2">Two Sum</h3>
              <p className="text-sm text-gray-400 mb-4">
                Find two numbers that add up to target.
              </p>
              <span className="text-green-400 text-sm">Easy</span>
            </div>

            <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800 hover:border-yellow-500 transition">
              <h3 className="font-semibold mb-2">Longest Substring</h3>
              <p className="text-sm text-gray-400 mb-4">
                Without repeating characters.
              </p>
              <span className="text-yellow-400 text-sm">Medium</span>
            </div>

            <div className="bg-[#0f172a] p-6 rounded-xl border border-gray-800 hover:border-yellow-500 transition">
              <h3 className="font-semibold mb-2">LRU Cache</h3>
              <p className="text-sm text-gray-400 mb-4">
                Design a least recently used cache.
              </p>
              <span className="text-red-400 text-sm">Hard</span>
            </div>

          </div>
        </div>
      </section>

      {/* DEVELOPER PLAYGROUND PREVIEW */}
      <section className="px-10 pb-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">
            Developer Playground
          </h2>

          <p className="text-gray-400 mb-10">
            Write and test your code instantly in multiple languages.
          </p>

          <div className="bg-[#0f172a] rounded-xl border border-gray-800 overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 text-sm text-gray-400">
              Python
            </div>

            <div className="grid md:grid-cols-2">
              <textarea
                className="bg-[#0f172a] p-4 h-56 outline-none border-r border-gray-800 text-sm"
                defaultValue={`def hello():\n    print("Hello Developer")\n\nhello()`}
              />
              <div className="p-4 text-left text-green-400 bg-black text-sm">
                Hello Developer
              </div>
            </div>
          </div>

          <Link
            to="/playground"
            className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
          >
            Open Playground →
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Explore;