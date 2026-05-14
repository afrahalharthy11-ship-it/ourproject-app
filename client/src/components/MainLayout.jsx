import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ChatBot from "./ChatBot";

function MainLayout() {
  return (
    <div className="app-wrapper">
      <Header />
      <main className="app-main">
        <div className="container py-4">
          <Outlet />
        </div>
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}

export default MainLayout;
