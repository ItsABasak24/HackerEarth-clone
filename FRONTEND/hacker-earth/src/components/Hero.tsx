import { useNavigate } from "react-router-dom";
const Hero: React.FC = () => {
const navigate = useNavigate();
return (
    <section className="relative z-10 pt-40 pb-32 text-center px-6">

      {/* Floating Code Editor */}
<div className="hidden md:block absolute left-10 top-40 
bg-[#0f172a]/80 backdrop-blur-xl 
border border-white/10 rounded-xl 
p-6 w-[320px] text-sm font-mono 
animate-float shadow-[0_0_30px_rgba(34,211,238,0.2)]">

  <div className="flex items-center gap-2 mb-4">
    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
  </div>

  <pre className="text-cyan-400 leading-6">
{`function twoSum(nums, target) {
  const map = new Map();
}`}
  </pre>
</div>


      {/* Floating Problem Card */}
<div className="hidden md:block absolute right-16 top-52 
bg-[#0f172a]/80 backdrop-blur-xl 
border border-white/10 rounded-xl 
p-6 w-[220px] animate-float-slow
shadow-[0_0_30px_rgba(168,85,247,0.2)]">

  <div className="flex justify-between items-center mb-3">
    <span className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
      Easy
    </span>
    <span className="text-gray-400 text-xs">Solved ✓</span>
  </div>

  <h4 className="text-white font-semibold">Two Sum</h4>
  <p className="text-gray-400 text-sm mt-2">
    Find indices of two numbers that add up to target.
  </p>

  <div className="mt-4 text-yellow-400 text-sm">
    ⚡ Runtime: 4ms
  </div>
</div>


      {/* Badge */}
      <div className="inline-block mb-8 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-lg text-gray-300">
        ✦ The smart way to ace your coding interviews
      </div>

      <h1 className="text-6xl md:text-7xl font-bold leading-tight">
        Master{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          Coding
        </span>
        <br />
        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
          Interview Skills
        </span>
      </h1>

      <p className="mt-8 text-gray-400 max-w-2xl mx-auto text-lg">
        Practice with curated problems from top tech companies. Build
        confidence with our intelligent coding platform and land your dream job.
      </p>

      <div className="mt-12 flex justify-center gap-6 flex-wrap">
         <button
  onClick={() => navigate("/register")}
  className="group relative px-10 py-4 rounded-xl font-semibold text-black
  bg-gradient-to-r from-cyan-400 to-blue-500
  transition-all duration-300
  hover:scale-105
  hover:shadow-[0_0_40px_rgba(34,211,238,0.6)]
  active:scale-95"
>
  Get Started Free →
  <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition duration-300"></span>
</button>


        <button
  onClick={() => navigate("/login")}
  className="px-10 py-4 rounded-xl font-medium
  border border-white/20 text-white
  hover:border-cyan-400 hover:text-cyan-400
  hover:bg-white/5
  transition-all duration-300
  active:scale-95"
>
  Sign In
</button>

      </div>

      {/* Stats */}
      <div className="mt-20 flex justify-center gap-16 text-cyan-400 text-3xl font-bold">
        <div>
          2,500+
          <p className="text-gray-400 text-base font-normal">Problems</p>
        </div>
        <div>
          150K+
          <p className="text-gray-400 text-base font-normal">Users</p>
        </div>
        <div>
          50+
          <p className="text-gray-400 text-base font-normal">Companies</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
