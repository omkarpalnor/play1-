import React from 'react'
import ReactDOM from 'react-dom/client'
 import './index.css'
import { Provider } from 'react-redux'
import {store, persistor} from "./redux/store";
import { PersistGate } from 'redux-persist/integration/react'
import { RouterProvider } from 'react-router-dom'
import router from "./router"
import { Toaster } from 'react-hot-toast'
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const app = (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
      <Toaster position="bottom-center" duration={500} />
    </PersistGate>
  </Provider>
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>{app}</GoogleOAuthProvider>
    ) : (
      app
    )}
  </React.StrictMode>
);
