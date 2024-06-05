import { admin } from './firebaseApp.js';

const sendNotification = async (tokens, notification, data) => {
  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification,
      data,
    });
    console.log('Successfully sent notification:', response);
    console.log(response.responses[0].error);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    return error;
  }
};

export { sendNotification };

