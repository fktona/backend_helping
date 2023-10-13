const express = require('express');
const admin = require('firebase-admin');
//const bodyParser = require('body-parser');
const cors = require('cors');
const uuid = require('uuid');


const app = express();
app.use(express.json());
app.use(cors())

const serviceAccount = require('./screat.json'); 
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://zur-backend-default-rtdb.firebaseio.com"
  });
  


const db = admin.firestore();


app.post('/api/data', (req, res) => {
  const {  name, position, company, location, timeZone, rating, timeAvailable } = req.body;

  const data = {
    id: uuid.v4(),
    name,
    position,
    company,
    location,
    timeZone,
    rating,
    timeAvailable,
  };

  db.collection('workers').add(data)
    .then((docRef) => {
      console.log('Document written with ID:', docRef.id);
      res.status(201).json({ message: 'Data created successfully' });
    })
    .catch((error) => {
      console.error('Error adding document:', error);
      res.status(500).json({ error: 'Something went wrong' });
    });
});


app.get('/api/get_data', (req, res) => {
  const data = [];

  db.collection('workers').get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        data.push(doc.data());
      });
      res.status(200).json(data);
    })
    .catch((error) => {
      console.error('Error getting documents:', error);
      res.status(500).json({ error: 'Something went wrong' });
    });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
