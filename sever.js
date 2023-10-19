const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const cloudinary = require('cloudinary').v2; 
const uuid = require('uuid');
const multer = require('multer');
const serviceAccount = require('./screat.json');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://zur-backend-default-rtdb.firebaseio.com',
});

const db = admin.firestore();


const upload = multer({
  storage: multer.memoryStorage(), 
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

cloudinary.config({
    cloud_name: 'dfxu5hvrw', 
    api_key: '235297942498392', 
    api_secret: '-N970A8IobIZ-n_KrHlkOeK7mmY' 
  });

app.post('/api/data', upload.single('contentImage'), async (req, res) => {
    
  try {
    const {
      firstname,
      lastname,
      date,
      time,
      title,
      topic,
      content,
      country,
      pricing,
      timezonetype,
      nextAvailable,
      linkToMentorProfile,
      available 
      
    } = req.body
      
    const contentImageBuffer = req.file.buffer;
    
    const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
    if (!urlPattern.test(linkToMentorProfile)) {
      return res.status(400).json({ error: 'Invalid URL format for "linkToMentorProfile"' });
    }

    
    if (!req.file) {
      return res.status(400).json({ error: 'content picture is required' });
    }
    
    const contentImageString = contentImageBuffer.toString('base64')

    

    const contentImageDataUri = `data:${req.file.mimetype};base64,${contentImageBuffer.toString('base64')}`
    
    cloudinary.uploader.upload(contentImageDataUri,
      {
        resource_type: 'auto',
        public_id: `profilePictures/${uuid.v4()}`,
        file: contentImageString
      },
      (error, result) => {
        if (error) {
          console.error('Error uploading image to Cloudinary:', error);
          return res.status(500).json({ error: 'Something went wrong' });
        }

        const contentImageURL = result.secure_url;

        const data = {
  id: uuid.v4(),
  firstname,
  lastname,
  title,
  timezonetype,
  country,
  review: 5.0,
  nextAvailable,
  date,
  time,
  topic,
  content,
  contentImage: contentImageURL,
  available,
  pricing,
  linkToMentorProfile,
  timezone:`${timezonetype} ${country}`
};

    
        db.collection('workers')
          .add(data)
          .then((docRef) => {
            console.log('Document written with ID:', docRef.id);
            res.status(201).json({ message: 'Data created successfully' });
          })
          .catch((error) => {
            console.error('Error adding document:', error);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


app.get('/api/get_data', (req, res) => {
  const data = [];

  db.collection('workers')
    .get()
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
