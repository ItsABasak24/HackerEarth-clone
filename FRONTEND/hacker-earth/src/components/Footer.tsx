import { Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-16 px-6 text-gray-400 relative">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">

        {/* Left Section */}
        <div>
          <h3 className="text-cyan-400 text-2xl font-bold mb-4">
            {"</>"} CodeEasy
          </h3>

          <p className="mb-6 max-w-sm">
            The smart way to prepare for coding interviews.
            Practice, learn, and succeed with our curated problem set.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-6">
            <a
              href="https://github.com/ItsABasak24"
              className="group transition-all duration-300 hover:scale-110"
            >
              <Github className="w-6 h-6 group-hover:text-cyan-400 transition duration-300 group-hover:drop-shadow-[0_0_10px_#22d3ee]" />
            </a>

            <a
              href="https://x.com/ABasak2004"
              className="group transition-all duration-300 hover:scale-110"
            >
              <Twitter className="w-6 h-6 group-hover:text-cyan-400 transition duration-300 group-hover:drop-shadow-[0_0_10px_#22d3ee]" />
            </a>

            <a
              href="https://www.linkedin.com/in/arnabbasak24/"
              className="group transition-all duration-300 hover:scale-110"
            >
              <Linkedin className="w-6 h-6 group-hover:text-cyan-400 transition duration-300 group-hover:drop-shadow-[0_0_10px_#22d3ee]" />
            </a>
          </div>
        </div>

        {/* Product Section */}
        {/* <div>
          <h4 className="text-white font-semibold mb-6">Product</h4>
          <ul className="space-y-4">
            {["Problems", "Contests", "Discuss", "Interview Prep"].map(
              (item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="relative group transition duration-300 hover:text-white"
                  >
                    {item}
                    <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              )
            )}
          </ul>
        </div> */}

        {/* Company Section */}
        {/* <div>
          <h4 className="text-white font-semibold mb-6">Company</h4>
          <ul className="space-y-4">
            {["About", "Careers", "Blog", "Contact"].map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  className="relative group transition duration-300 hover:text-white"
                >
                  {item}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
                </a>
              </li>
            ))}
          </ul>
        </div> */}
      </div>

      {/* Bottom */}
      <div className="mt-16 text-center text-gray-500 border-t border-white/10 pt-6">
        © 2026 CodeEasy. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
