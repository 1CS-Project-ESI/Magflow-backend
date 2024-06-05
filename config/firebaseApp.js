import fs from 'fs';
import admin from 'firebase-admin'

const jsonData = JSON.parse(fs.readFileSync('./config/pushNotification.json', 'utf-8'));
admin.initializeApp({
  credential: admin.credential.cert(jsonData)
});

export {admin};


