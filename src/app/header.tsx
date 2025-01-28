"use client";
import React, { useState } from "react";

const Header: React.FC = () => {
  // State to toggle mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">
          <a href="/" className="text-primary-foreground">
            Schema Builder
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
