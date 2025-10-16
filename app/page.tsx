import { LoginButton } from "@/components/auth/login-button";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br">
      <Header />

     

      <main className="flex-grow flex items-center justify-center px-4 bg-[url('/hero.jpeg')] bg-cover bg-center bg-no-repeat">
        <LoginButton>
          <Button
            size="lg"
            className="px-8 py-4 mb-80 bg-orange-500 font-extrabold"
          >
            Start Your Art Journey
          </Button>
        </LoginButton>
      </main>
    </div>
  );
}
