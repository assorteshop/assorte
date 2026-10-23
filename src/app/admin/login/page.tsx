import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-[380px] py-16">
      <h1 className="text-[28px]">Вхід в адмінку</h1>
      <LoginForm />
    </div>
  );
}
