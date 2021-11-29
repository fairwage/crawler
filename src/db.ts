import { connect } from 'mongoose';

const username = 'fairwage-admin';
const password = 'BLGYTjz86zhqnx5';
const cluster = 'fairwage.nlmwo';
const dbname = 'myFirstDatabase';

const CONNECTION_STRING = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbname}?retryWrites=true&w=majority`;

export function connectDb() {
  connect(CONNECTION_STRING)
    .then(() => {
      console.log('Connected to the database!');
    })
    .catch((err) => {
      console.log('Cannot connect to the database!', err);
      process.exit();
    });
}
