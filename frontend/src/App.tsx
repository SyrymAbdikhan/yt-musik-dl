import "./App.css";
import { ThemeProvider } from "./components/theme-provider";
import { CardForm } from "./components/CardForm";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="fixed top-0 right-0 m-4">
        <ModeToggle />
      </div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <CardForm />
      </div>
    </ThemeProvider>
  );
}

export default App;
