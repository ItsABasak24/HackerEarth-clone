import { motion } from "framer-motion";

const features = [
  {
    title: "Real Interview Problems",
    desc: "Practice with problems asked at Google, Amazon, Meta and more.",
  },
  {
    title: "Smart Learning Path",
    desc: "AI-powered recommendations based on your skill level and goals.",
  },
  {
    title: "Instant Feedback",
    desc: "Run code against test cases and get immediate results.",
  },
  {
    title: "Track Progress",
    desc: "Monitor your improvement with detailed analytics and streaks.",
  },
  {
    title: "Community Driven",
    desc: "Learn from solutions and discussions by top programmers.",
  },
  {
    title: "Interview Ready",
    desc: "Mock interviews and timed challenges to build confidence.",
  },
];

const Features = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
        Why Choose{" "}
        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
          CodeEasy
        </span>
        ?
      </h2>

      <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
        Everything you need to prepare for technical interviews, all in one place.
      </p>

      <div className="grid md:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative bg-white/5 border border-white/10 
            rounded-2xl p-8 backdrop-blur-lg 
            transition-all duration-500 ease-out
            hover:-translate-y-4 hover:bg-white/10
            hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          >
            {/* Glow overlay */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>

            <h3 className="text-xl font-semibold mb-4 relative z-10">
              {feature.title}
            </h3>

            <p className="text-gray-400 relative z-10">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Features;
