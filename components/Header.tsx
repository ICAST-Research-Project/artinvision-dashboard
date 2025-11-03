import { LoginButton } from "@/components/auth/login-button";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header
      className="
      bg-white
      rounded-full
      border
      border-orange-200
      px-6
      py-3
      my-4
      mx-auto
      mt-8
    "
    >
      <div className="flex items-center justify-between space-x-16">
        <h1 className="text-xl font-bold text-orange-600 ">Art Connect</h1>
        <LoginButton>
          <Button
            variant="outline"
            size="sm"
            className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white transition"
          >
            Get Started
          </Button>
        </LoginButton>
      </div>
    </header>
  );
}
