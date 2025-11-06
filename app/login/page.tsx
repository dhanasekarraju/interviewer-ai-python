import { LoginForm } from "@/components/auth/login-form"

export default function Page() {
  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="w-full max-w-lg">
        <LoginForm />
      </div>
    </main>
  )
}
