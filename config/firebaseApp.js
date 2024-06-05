import admin from 'firebase-admin';
import * as serviceAccount from "./pushNotification.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export { admin };

