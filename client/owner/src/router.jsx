import { createBrowserRouter } from "react-router-dom";

// import {ProtectedRoute} from "@components/ProtectedRoute"

import Home from "@pages/Home.jsx";
import About from "@pages/About.jsx";
import WhyUs from "@pages/WhyUs.jsx";
import Login from "@pages/Login";
import SignUp from "@pages/SignUp";
import ForgotPassword from "@pages/ForgotPassword";
import ResetPassword from "@pages/ResetPassword";
import Profile from "@pages/Profile";
import VerifyEmail from "@pages/VerifyEmail";
import CheckEmail from "@pages/CheckEmail";
import ContactUs from "@pages/ContactUs.jsx";
import OwnerMessages from "@components/messages/OwnerMessages.jsx";
import TournamentList from "@components/owner/Tournament/TournamentList";
import CreateTournament from "@components/owner/Tournament/CreateTournament";
import EditTournament from "@components/owner/Tournament/EditTournament";
import TournamentRegistrations from "@components/owner/Tournament/TournamentRegistrations";

//  all the components that are used in the layout
import { AdminLayout, OwnerLayout, GuestLayout } from "@layouts";

//  all the components that are used in the owner dashboard
import {
  AddTurf,
  OwnerDashboard,
  TurfManagement,
  OwnerReviews,
  OwnerBookings,
  OwnerCoupons,
  OwnerNotifications,
  OwnerReports,
} from "@components/owner";

//  all the components that are used in the admin dashboard
import {
  UserManagement,
  NewOwnerRequests,
  RejectedOwnerRequests,
  AdminDashboard,
  OwnerViewer,
  TurfList,
  AllTurf,
  TransactionSection,
  AdminMessages,
  AdminReports,
} from "@components/admin";
import ProtectedRoute from "@components/ProtectedRoute/ProtectedRoute";

// 404 page

import { NotFound } from "@components/common";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "about",
        element: <About audience="guest" />,
      },
      {
        path: "why-us",
        element: <WhyUs />,
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
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "about", element: <About audience="admin" /> },
      { path: "profile", element: <Profile /> },
      { path: "messages", element: <AdminMessages /> },
      { path: "messages/:conversationId", element: <AdminMessages /> },
      {
        path: "owner-requests",
        children: [
          { path: "new", element: <NewOwnerRequests /> },
          { path: "rejected", element: <RejectedOwnerRequests /> },
        ],
      },
      { path: "users", element: <UserManagement /> },
      {
        path: "owners",
        children: [
          { path: "", element: <OwnerViewer /> },
          { path: ":ownerId/turf", element: <TurfList /> },
        ],
      },

      { path: "turfs", element: <AllTurf /> },
      { path: "transactions", element: <TransactionSection /> },
      { path: "reports", element: <AdminReports /> },
    ],
  },
  {
    path: "/owner",
    element: (
      <ProtectedRoute requiredRole="owner">
        <OwnerLayout />
      </ProtectedRoute>
    ),
    children: [
     { index: true, element: <OwnerDashboard /> },
      { path: "about", element: <About audience="owner" /> },
      { path: "contact", element: <ContactUs /> },
      { path: "add-turf", element: <AddTurf /> },
      { path: "turfs", element: <TurfManagement /> },
      { path: "reviews", element: <OwnerReviews /> },
      { path: "bookings", element: <OwnerBookings /> },
      { path: "tournaments", element: <TournamentList /> },
{ path: "create-tournament", element: <CreateTournament /> },
{ path: "edit-tournament/:id", element: <EditTournament /> },
      { path: "reports", element: <OwnerReports /> },
      { path: "coupons", element: <OwnerCoupons /> },
      { path: "notifications", element: <OwnerNotifications /> },
      { path: "messages", element: <OwnerMessages /> },
      { path: "messages/:conversationId", element: <OwnerMessages /> },
      { path: "profile", element: <Profile /> },
      {
  path: "tournaments/:id/registrations",
  element: <TournamentRegistrations />,
},
    ],
  },
]);

export default router;
