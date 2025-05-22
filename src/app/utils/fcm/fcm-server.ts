import { Message } from 'firebase-admin/messaging';
import { serverMessaging } from '../../config/firebase.server.config';

interface SubScribeFcmType {
  tokens: string[];
  topic: string;
}

export const subscribeToFcmTopicServerSide = async ({ tokens, topic }: SubScribeFcmType) => {
  try {
    // Subscribe the token to the topic
    const messSubscribe = await serverMessaging.subscribeToTopic(tokens, topic);

    if (messSubscribe.errors.length > 0) throw messSubscribe.errors;

    const messages: Message[] = [
      {
        topic,
        notification: {
          title: 'Testing Message!',
          body: 'This is testing message, no worries!',
        },
      },
      ...tokens.map(
        (token) =>
          ({
            token,
            notification: {
              title: 'Testing Message!',
              body: 'This is testing message, no worries!',
            },
          }) as Message,
      ),
    ];

    const fcmRes = await serverMessaging.sendEach(messages, true);

    if (fcmRes.failureCount > 0) throw fcmRes.responses.map((e) => e.error);

    return { success: true, fcmRes };
  } catch (error) {
    console.error('FCM subscription failed:', error);
    throw { success: false, error };
  }
};
