import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { AuthContextProvider } from "./context/AuthContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
//redux 
import store from './redux/store'
import {Provider} from 'react-redux'
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
      <React.StrictMode>
        <AuthContextProvider>
          <DarkModeContextProvider>
            <App />
          </DarkModeContextProvider>
        </AuthContextProvider>
     </React.StrictMode>
  </Provider>
);
