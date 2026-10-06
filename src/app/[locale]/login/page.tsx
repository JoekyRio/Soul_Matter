import { signIn } from "@/app/auth/actions";
import AuthCard from "@/components/AuthCard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;
  return <AuthCard mode="login" action={signIn} error={error} info={info} />;
}
