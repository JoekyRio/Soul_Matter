import { signUp } from "@/app/auth/actions";
import AuthCard from "@/components/AuthCard";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <AuthCard mode="register" action={signUp} error={error} />;
}
