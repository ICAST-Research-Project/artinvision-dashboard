import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main
      className="
        flex
        flex-col
        items-center
        justify-start     
        md:justify-center  
      
        min-h-screen       
        px-4               
        py-8               
      "
    >
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}
