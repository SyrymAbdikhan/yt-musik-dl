
import { Cat, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

interface AuthButtonProps {
  text: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface ButtonProps {
  onClick?: () => void;
}

function AuthButton({text, icon, onClick}: AuthButtonProps) {
  return (
    <Button variant="outline" onClick={onClick}>
      {icon}
      <span>{text}</span>
    </Button>
  )
}

function Login({onClick}: ButtonProps) {
  return <AuthButton text="Login" icon={<Cat />} onClick={onClick} />;
}

function Logout({onClick}: ButtonProps) {
  return <AuthButton text="Logout" icon={<LogOut />} onClick={onClick} />;
}

export { Login, Logout };