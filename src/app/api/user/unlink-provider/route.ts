// src/app/api/user/unlink-provider/route.ts
import { serverAuth, serverFirestore } from '@/app/config/firebase.server.config';
import { parseError, removeUndefinedDeep, rsaDecrypt } from '@/app/utils/utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { encryptedData } = await req.json();

    const { providerIds } = JSON.parse(rsaDecrypt(encryptedData));

    console.log('providerIds: ', providerIds);

    if (!providerIds || providerIds.length <= 0) {
      throw { message: 'No id found!', code: 'no_id_found' };
    }

    const decodedUser = await serverAuth.verifySessionCookie(
      (await cookies()).get('session')!.value,
      true,
    );

    const user = await serverAuth.getUser(decodedUser.uid);
    const linkedProviders = user.providerData.map((p) => p.providerId);
    const unlinkAble: string[] = providerIds.filter((pid: string) => linkedProviders.includes(pid));

    if (unlinkAble.length === 0) {
      throw { message: 'No matching providers to unlink', status: 400, code: 'NO_PROVIDER' };
    } else if (user.providerData.length === 1) {
      throw { message: 'Unlink is not available!', code: 'UNLINK_NOT_ALLOWED' };
    }

    await serverAuth.updateUser(user.uid, { providersToUnlink: unlinkAble });

    await serverFirestore.doc(`Users/${user.uid}`).update(
      removeUndefinedDeep({
        providerData: (await serverAuth.getUser(decodedUser.uid)).providerData,
      }),
      { exists: true },
    );

    return NextResponse.json({ message: 'Provider unlinked successfully!' }, { status: 200 });
  } catch (error) {
    const parsed = parseError(error);

    return NextResponse.json(
      { error: parsed.message, code: parsed.code },
      { status: parsed?.status ?? 500 },
    );
  }
}
