import { createBrowserRouter } from "react-router-dom";
import Root from "./layouts/Root";
import Home from "./pages/Home";
import About from "./pages/About";
import WhyUs from "./pages/WhyUs";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/auth/Profile";
import DeleteProfileRequest from "./pages/auth/DeleteProfileRequest";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyDeleteRequest from "./pages/auth/VerifyDeleteRequest";
import CheckEmail from "./pages/auth/CheckEmail";
import Turf from "./components/turf/Turf";
import TurfDetails from "./components/turf/TurfDetails";
import BecomeOwner from "./features/becomeOwner/BecomeOwner";
import ProtectedLayout from "./layouts/ProtectedLayout";
import Reservation from "./components/Reservation";
import TurfBookingHistory from "./components/turf/TurfBookingHistory";
import NotFound from "./components/common/NotFound";
import UserNotifications from "./components/notifications/UserNotifications";
import ContactUs from "./pages/ContactUs";
import UserMessages from "./components/messages/UserMessages";
import TournamentList from "./components/tournament/TournamentList.jsx";
import TournamentDetails from "./components/tournament/TournamentDetails.jsx";
import TournamentRegistration from "./components/tournament/TournamentRegistration.jsx";
import MyTournament from "./components/tournament/MyTournament.jsx";

// 1. Import Matchmakingfeed
import MatchmakingFeed from "./pages/MatchmakingFeed";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "why-us",
        element: <WhyUs />,
      },
      {
        path: "contact",
        element: <ContactUs />,
      },
      {
        path: "matchmaking",
        element: <MatchmakingFeed />,
      },
      {
        path: "messages",
        element: <UserMessages />,
      },
      {
        path: "messages/:conversationId",
        element: <UserMessages />,
      },
      {
        path: "turf/:id",
        element: <TurfDetails />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
  path: "tournaments",
  element: <TournamentList />,
},

{
  path: "my-tournaments",
  element: <MyTournament />,
},
{
  path: "tournaments/:id",
  element: <TournamentDetails />,
},
{
  path: "tournaments/:id/register",
  element: <TournamentRegistration />,
},
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "verify-email/:token",
        element: <VerifyEmail />,
      },
      {
        path: "verify-email",
        element: <CheckEmail />,
      },
      {
        path: "verify-delete-request/:token",
        element: <VerifyDeleteRequest />,
      },
      {
        path: "turfs",
        element: <Turf />,
      },
      {
        path: "turf/:id",
        element: <TurfDetails />,
      },
    ],
  },
  {
    path: "/auth",
    element: <ProtectedLayout />,
    // errorElement: <div>Error</div>,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "turfs",
        element: <Turf />,
      },
      {
        path: "matchmaking",
        element: <MatchmakingFeed />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "why-us",
        element: <WhyUs />,
      },
      {
        path: "contact",
        element: <ContactUs />,
      },
      {
        path: "turf/:id",
        element: <TurfDetails />,
      },

      {
        path: "reserve/:id",
        element: <Reservation />,
      },
      {
        path: "become-owner",
        element: <BecomeOwner />,
      },
      {
        path: "booking-history",
        element: <TurfBookingHistory />,
      },
      {
        path: "notifications",
        element: <UserNotifications />,
      },
      {
        path: "messages",
        element: <UserMessages />,
      },
      {
        path: "messages/:conversationId",
        element: <UserMessages />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "profile/delete-request",
        element: <DeleteProfileRequest />,
      },
    ],
  },
]);

export default router;