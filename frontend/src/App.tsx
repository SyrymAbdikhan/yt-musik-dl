import "./App.css";

import { useEffect, useState } from "react";

import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { Login, Logout } from "./components/AuthButtons";

import { DataForm } from "./components/DataForm";
import { LoginForm } from "./components/LoginForm";

import Cookies from "js-cookie";

function App() {
  const [loggedin, setLoggedin] = useState(false);
  const [token, setToken] = useState("");
  
  const readCookie = () => {
    let new_token = Cookies.get("token");
    if (new_token) {
      setLoggedin(true);
      setToken(new_token);
    }
  };
  
  useEffect(() => {
    readCookie();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed top-0 right-0 m-4 flex gap-4 items-center">
        {loggedin ?
          <Logout onClick={() => {
            Cookies.remove("token");
            setToken("");
            setLoggedin(false);}} /> :
          <Login onClick={() => {
            console.log('aepschu')
          }} />
        }
        <ModeToggle />
      </div>
      <div className="flex items-center justify-center min-h-screen p-4">
        {loggedin ? <DataForm token={token} /> : <LoginForm onLogin={() => {readCookie(); setLoggedin(true);}} />}
      </div>
    </ThemeProvider>
  );
}

export default App;
