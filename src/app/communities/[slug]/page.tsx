// pages/communities/[slug].tsx
import { verifySession } from '@/app/utils/auth/auth';
import { CommunityType, getCommunityBySlug } from '@/app/utils/communities/communities';
import { getCommunityMembersByCommunityId } from '@/app/utils/communities/communityEnrich';
import { encryptJsonPayload, formatLocalDate } from '@/app/utils/utils';
import Image from 'next/image';
import Link from 'next/link';

export default async function CommunityDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community: CommunityType = await getCommunityBySlug(slug);
  const communityMembers = await getCommunityMembersByCommunityId(community.communityId);
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
          {communityMembers.filter((member) => member.userId == userId).length > 0 ||
          community.createdBy === userId ? (
            <>
              {community.createdBy !== userId && (
                <form method="POST" action="/api/communities/leave">
                  <input
                    type="hidden"
                    name="encryptedData"
                    value={encryptJsonPayload({
                      communityId: community.communityId,
                    })}
                  />
                  <button className="btn btn-outline btn-error btn-sm">Leave</button>
                </form>
              )}
              <button className="btn btn-outline btn-primary btn-sm">Invite</button>
            </>
          ) : (
            <form method="POST" action="/api/communities/join">
              <input
                type="hidden"
                name="encryptedData"
                value={encryptJsonPayload({
                  communityId: community.communityId,
                })}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Join Community
              </button>
            </form>
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
            <span className="font-semibold">Member Count:</span> {communityMembers.length}
          </div>
          <div>
            <span className="font-semibold">Created On:</span>{' '}
            {formatLocalDate(community.createdAt.toDate())}
          </div>
          <div>
            <span className="font-semibold">Owner:</span> {community.ownerName}
          </div>
        </div>
      </div>

      <div className="container mx-auto card bg-base-100 shadow-lg p-6 space-y-4 mt-4">
        <h1 className="text-2xl font-bold text-base-content mb-4">Community Members</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {communityMembers.map((member) => (
            <div
              key={member.userId}
              className="bg-base-200 border border-base-300 rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow ml-4"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 relative">
                  <Image
                    src={
                      member.photoURL ??
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        member.displayName ?? 'User',
                      )}&background=random&rounded=true`
                    }
                    alt="User Avatar"
                    fill
                    className="rounded-full object-cover"
                    fetchPriority="auto"
                  />
                </div>
                <div>
                  <Link href={`/user/${member.slug}`}>
                    <div>
                      <h2 className="font-semibold text-base-content">{member.displayName}</h2>
                      <p className="text-xs text-neutral-content">@{member.slug}</p>
                    </div>
                  </Link>
                  {/* <p className="text-xs text-neutral-content">{member.story}</p> */}
                  <p className="text-xs text-neutral-content capitalize">{member.role}</p>
                </div>
              </div>

              {/* If admin or owner, show more */}
              {/* {member.userId == userId && (
                <div className="mt-4 text-sm text-base-content">
                  <p>
                    <strong>Status:</strong> {member.story}
                  </p>
                  <p>
                    <strong>Joined:</strong> {formatLocalDate(member.joinedAt.toDate())}
                  </p>

                  <div className="mt-2">
                    <strong>Permissions:</strong>
                    <ul className="list-disc list-inside text-xs">
                      {Object.entries(member.permissions).map(([key, val]) =>
                        val ? <li key={key}>{key}</li> : null,
                      )}
                    </ul>
                  </div>

                  <div className="mt-2">
                    <strong>Notifications:</strong>
                    <ul className="list-disc list-inside text-xs">
                      {Object.entries(member.notificationPrefs).map(([key, val]) =>
                        val ? <li key={key}>{key}</li> : null,
                      )}
                    </ul>
                  </div>
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
