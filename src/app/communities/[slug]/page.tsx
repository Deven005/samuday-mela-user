// pages/communities/[slug].tsx
import { verifySession } from '@/app/utils/auth/auth';
import { CommunityType, getCommunityBySlug } from '@/app/utils/communities/communities';
import { Timestamp } from 'firebase-admin/firestore';
import Image from 'next/image';

export default async function CommunityDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community: CommunityType = await getCommunityBySlug(slug);
  let userId = undefined;
  try {
    userId = await verifySession();
  } catch (error) {
    userId = undefined;
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content px-4 py-8">
      {/* Banner */}
      <div className="relative w-full h-52 md:h-64 rounded-xl overflow-hidden shadow-xl mb-6">
        <Image
          src={community.banner}
          alt="Community Banner"
          fill
          className="object-cover"
          fetchPriority="high"
        />
      </div>

      {/* Avatar + Title */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 relative rounded-full overflow-hidden border-4 border-base-100 shadow-md">
            <Image
              src={community.logo}
              alt="Community Avatar"
              fill
              className="object-fill"
              fetchPriority="high"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{community.name}</h1>
            <p className="text-sm opacity-70">@{community.slug}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {community.isJoined || community.createdBy === userId ? (
            <>
              {community.createdBy !== userId && (
                <button className="btn btn-outline btn-error btn-sm">Leave</button>
              )}
              <button className="btn btn-outline btn-primary btn-sm">Invite</button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm">Join Community</button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="card bg-base-100 shadow-lg p-6 space-y-4">
        <p className="text-sm">{community.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-semibold">Visibility:</span>{' '}
            <span className="badge badge-info badge-outline lowercase">{community.visibility}</span>
          </div>
          <div>
            <span className="font-semibold">Members:</span> {community.membersCount}
          </div>
          <div>
            <span className="font-semibold">Created On:</span>{' '}
            {new Date((community.createdAt as Timestamp).toDate()).toLocaleDateString()}
          </div>
          <div>
            <span className="font-semibold">Owner:</span> {community.ownerName}
          </div>
        </div>
      </div>

      {/* Optional: Tabs for Posts / Members */}
      <div className="mt-10">
        <div role="tablist" className="tabs tabs-boxed">
          <a role="tab" className="tab tab-active">
            Posts
          </a>
          <a role="tab" className="tab">
            Members
          </a>
        </div>

        {/* Placeholder section for posts */}
        <div className="mt-4">
          <div className="text-center text-sm opacity-70">
            (Posts or member list can go here based on selected tab)
          </div>
        </div>
      </div>
    </div>
  );
}
