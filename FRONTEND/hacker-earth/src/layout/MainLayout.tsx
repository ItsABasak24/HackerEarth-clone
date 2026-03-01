import React from "react";
import Navbar from "../components/Navbar";

interface Props {
  children: React.ReactNode;
}

const MainLayout = ({ children }: Props) => {
  return (
    <div className="min-h-screen bg-[#050816] text-white">
      <Navbar />
      <div className="pt-24 px-6">
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
