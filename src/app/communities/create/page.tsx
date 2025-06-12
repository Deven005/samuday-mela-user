// /app/community/create/page.tsx
import { createCommunityAction } from './actions';

export const metadata = {
  title: 'Create Community | Samuday Mela',
};

export default function CreateCommunityPage() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4 text-base-content">
      <h1 className="text-3xl font-bold mb-6 text-base-content">Create a Community</h1>

      <form action={createCommunityAction} className="space-y-4" spellCheck>
        <input
          name="name"
          type="text"
          placeholder="Community Name"
          required
          className="w-full border px-4 py-2 rounded"
          maxLength={20}
          minLength={5}
        />
        <textarea
          name="description"
          placeholder="Description"
          required
          className="w-full border px-4 py-2 rounded"
          maxLength={200}
          minLength={5}
        />
        <select name="visibility" className="w-full border px-4 py-2 rounded">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button type="submit" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Create Community
        </button>
      </form>
    </div>
  );
}
