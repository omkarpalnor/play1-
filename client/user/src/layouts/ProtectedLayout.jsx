import { Navigate, Outlet } from "react-router-dom";
import AuthNavbar from "../components/auth/AuthNavbar";
import {useSelector} from "react-redux"
import Chatbot from "../components/common/Chatbot";

 

export default function ProtectedLayout() {
 const { isAuthenticated } = useSelector(state => state.auth);

if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
}

  return (
    <div className="flex flex-col min-h-screen ">
      <AuthNavbar />
      <main className="flex-grow pt-16 ">
        <Outlet />
      </main>
      <Chatbot />
    </div>
  );
}
