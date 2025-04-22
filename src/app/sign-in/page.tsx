"use client";

import { useState } from "react";
import { useUserStore } from "../stores/user/userStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useShallow } from "zustand/shallow";
import InputField from "../components/Input/InputField";
import { useRedirectIfAuthenticated } from "../hooks/useRedirectIfAuthenticated";
import { Button } from "../components/Button/Button";

const SignIn = () => {
  // const { ready, hydrated } = useRedirectIfAuthenticated();
  const user = useUserStore(useShallow((state) => state.user));
  const signIn = useUserStore((state) => state.signIn);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError("Invalid email or password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  //  !ready || user || !hydrated ? (
  //   <div className="text-center py-10">Loading...</div>
  // ) :
  return (
    <div className="flex justify-center items-center bg-gray-100 p-7">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSignIn}>
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => setEmail(e.target.value)}
            required
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e: {
              target: { value: React.SetStateAction<string> };
            }) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end">
            <Link className="link link-hover py-4" href="/sign-up">
              Sign Up
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`btn w-full mt-2 ${
              loading ? "btn-disabled" : "btn-primary"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
