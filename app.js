const express=require('express');
const bodyParser=require('body-parser');
const mysql=require('mysql2');
const app=express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'123456',
    database:'SCHOOLMANAGEMENT'
});

db.connect((err)=>{
    if(err)throw err;
    console.log('Connected to Mysql');
});


app.post('/addSchool',(req,res)=>{
    const{name,address,latitude,longitude}=req.body;

    if(!name||!address||!latitude||!longitude)
    {
        return res.status(400).send('All fields are required.');
    }
    const query='INSERT INTO school (name,address,latitude,longitude) VALUES(?,?,?,?)';
    db.query(query,[name,address,latitude,longitude],(err,result)=>{
        if(err)
        {
            return res.status(500).send('Error inserting data');
        }
        res.status(201).send('Data added successfully');
    });
});
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance;
  };


app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;
  
    if (!latitude || !longitude) {
      return res.status(400).send('Latitude and longitude are required.');
    }
  
    const query = 'SELECT * FROM school';
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).send('Error fetching school data.');
      }
  
      const schoolsWithDistance = results.map(school => {
        const distance = calculateDistance(latitude, longitude, school.latitude, school.longitude);
        return { ...school, distance };
      });
  
      
      schoolsWithDistance.sort((a, b) => a.distance - b.distance);
  
      res.status(200).json(schoolsWithDistance);
    });
  });
  
  









app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})