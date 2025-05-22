'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../stores/user/userStore';
import InputField from '../components/Input/InputField';
import { Button } from '../components/Button/Button';

const SignUp = () => {
  // const { ready, hydrated } = useRedirectIfAuthenticated();
  const router = useRouter();
  const signUp = useUserStore((state) => state.signUp);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  // const [currentOccupation, setCurrentOccupation] = useState('');
  // const [hobbies, setHobbies] = useState<string[]>([]);
  // const [story, setStory] = useState(
  //   'Share a bit about yourself, your passions, and what drives you! 💬✨',
  // );
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const [vibe, setVibe] = useState('What’s your vibe today? Spill the tea! ☕️🔥');
  // const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, {
        displayName,
        // email,
        // phoneNumber,
        // address,
        // hobbies,
        // story,
        // currentOccupation,
        // vibe,
        // photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        //   displayName ?? '',
        // )}&rounded=true&background=0D8ABC&color=fff`,
      });
      router.replace('/');
    } catch (err) {
      console.error(err);
      setError('Error creating account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      router.replace('/api/auth/google');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-100 dark:bg-base-900 p-4">
      <div className="w-full max-w-2xl p-8 rounded-2xl shadow-2xl overflow-auto bg-base-200 dark:bg-base-800">
        <h2 className="text-2xl font-bold text-center mb-6 text-base-content">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`btn btn-outline gap-2 ${loading ? 'btn-disabled' : ''} text-base-content`}
          >
            {/* Google G Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.3H272.1v95.2h146.9c-6.3 33.5-25.2 61.9-53.7 81l86.9 67.6c50.6-46.7 81.3-115.6 81.3-193.5z"
                fill="#4285F4"
              />
              <path
                d="M272.1 544.3c72.9 0 134-24.2 178.6-65.6l-86.9-67.6c-24.1 16.1-55 25.6-91.7 25.6-70.4 0-130.2-47.6-151.5-111.4H31.6v69.9c44.6 88 135.9 149.1 240.5 149.1z"
                fill="#34A853"
              />
              <path
                d="M120.6 325.3c-10.5-31.5-10.5-65.3 0-96.8V158.6H31.6c-32.9 65.9-32.9 143.3 0 209.2l89-69.6z"
                fill="#FBBC05"
              />
              <path
                d="M272.1 107.6c39.7-.6 77.8 13.8 106.9 40.1l80.2-80.2C408.6 24 342.3-.2 272.1 0 167.5 0 76.2 61.1 31.6 149.1l89 69.6C141.9 155.2 201.7 107.6 272.1 107.6z"
                fill="#EA4335"
              />
            </svg>
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </div>

        <form onSubmit={handleSignUp}>
          <InputField
            id="displayName"
            label="Full Name"
            value={displayName}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setDisplayName(e.target.value)
            }
            required
          />

          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setEmail(e.target.value)
            }
            required
          />

          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setPassword(e.target.value)
            }
            required
          />

          <InputField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setConfirmPassword(e.target.value)
            }
            required
          />

          {/* <InputField
            id="currentOccupation"
            label="Current Occupation"
            value={currentOccupation}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setCurrentOccupation(e.target.value)
            }
            required
          />

          <InputField
            id="hobbies"
            label="Hobbies (comma separated)"
            value={hobbies.join(', ')}
            onChange={(e: { target: { value: string } }) =>
              setHobbies(e.target.value.split(',').map((h: string) => h.trim()))
            }
            required
          /> */}

          {/* <TextAreaField
            id="story"
            label="Your Story"
            value={story}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setStory(e.target.value)
            }
            required
          /> */}

          {/* <InputField
            id="phoneNumber"
            label="Phone Number"
            value={phoneNumber}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setPhoneNumber(e.target.value)
            }
            required
          />

          <InputField
            id="vibe"
            label="Vibe"
            value={vibe}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setVibe(e.target.value)
            }
            required
          /> */}

          {/* <TextAreaField
            id="address"
            label="Address"
            value={address}
            onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
              setAddress(e.target.value)
            }
            required
          /> */}

          <button
            type="submit"
            disabled={loading}
            className={`btn w-full mt-4 ${loading ? 'btn-disabled' : 'btn-primary'}`}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
