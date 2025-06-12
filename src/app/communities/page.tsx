import Link from 'next/link';
import { CommunityType, getCommunities } from '../utils/communities/communities';
import { formatLocalDate } from '../utils/utils';
import { verifySession } from '../utils/auth/auth';

export const metadata = {
  title: 'Communities | Samuday Mela',
};

const Communities = async () => {
  let communities: CommunityType[];

  try {
    communities = await getCommunities(await verifySession());
  } catch (error) {
    communities = await getCommunities();
  }
  return (
    <div className="container p-6 space-y-4 mx-auto px-4 relative bg-base-200 text-base-content py-6 mt-auto border-t border-base-300 transition-colors duration-300">
      <h1 className="text-2xl font-bold text-base-content">Communities</h1>

      {communities.length === 0 ? (
        <div className="text-center text-base-content/70 text-sm">No communities found.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {communities.map((community, index) => (
            <div
              key={`${index}-${community.slug}`}
              className="card bg-base-100 shadow-md border border-base-300 hover:shadow-lg transition-shadow"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <h2 className="card-title text-primary">{community.name}</h2>
                  <span className="badge badge-outline text-xs">{community.visibility}</span>
                </div>

                <p className="text-sm text-base-content/80 line-clamp-3">{community.description}</p>

                <div className="mt-4 text-sm text-base-content/60">
                  <span>By: {community.ownerName}</span>
                  <br />
                  <span>Created: {formatLocalDate(community.createdAt.toDate())}</span>
                </div>

                <div className="card-actions mt-4">
                  <Link href={`/communities/${community.slug}`} className="btn btn-sm btn-primary">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Communities;
