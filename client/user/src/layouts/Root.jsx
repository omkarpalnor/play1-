 
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Chatbot from "../components/common/Chatbot";

const Root = () => {
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <main className="flex-grow pt-16 ">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
};

export default Root;
