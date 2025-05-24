import { getUserDataSlug } from '@/app/utils/utils';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const revalidate = 60; // ISR: Cache every 60s

const UserPublicProfile = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;

  let userData;

  try {
    userData = await getUserDataSlug(slug);
  } catch (error) {
    notFound();
  }

  return (
    <div className="bg-base-200 text-base-content py-12 mt-auto border-t border-base-300 transition-colors duration-300">
      {!userData ? (
        <p>No User userData!</p>
      ) : (
        <div className="min-h bg-base-100 p-4 text-base-content">
          <div className="mx-10 space-y-6">
            {/* Profile Section */}
            <div className="card dark:bg-base-800 shadow-lg rounded-lg flex justify-center items-center">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative transition duration-200 hover:scale-105 cursor-pointer">
                  <Image
                    loading="eager"
                    height={100}
                    width={100}
                    src={userData.photoURL}
                    fetchPriority="high"
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                    alt="Profile"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-base-content">{userData.displayName}</h2>
                  {/* <p className="text-sm text-base-content">{email}</p> */}
                </div>
              </div>

              <div className="text-sm space-y-1">
                {/* {user.phoneNumber && (
                  <p>
                    <strong className="text-base-content">Phone:</strong>{' '}
                    {user.phoneNumber || 'N/A'}
                  </p>
                )} */}
                {/* <p>
                  <strong className="text-base-content">Address:</strong> {user.address || 'N/A'}
                </p>
                {user.hobbies && user.hobbies.length > 0 && (
                  <p>
                    <strong className="text-base-content">Hobbies:</strong>{' '}
                    {user.hobbies?.join(', ') || 'N/A'}
                  </p>
                )} */}
                <p>
                  <strong className="text-base-content">Story:</strong> {userData.story || 'N/A'}
                </p>
                {/* {user.currentOccupation && (
                  <p>
                    <strong className="text-base-content">Occupation:</strong>{' '}
                    {user.currentOccupation || 'N/A'}
                  </p>
                )} */}
                <p>
                  <strong className="text-base-content">Vibe:</strong> {userData.vibe || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type Props = {
  params: { slug: string };
};

export default UserPublicProfile;
