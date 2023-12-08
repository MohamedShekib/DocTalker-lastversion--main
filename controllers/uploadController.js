const { connectDB } = require('../config/database');
const Doc = require('../models/document');
const slugify = require('slugify');
const {uploadFile} = require('../services/aws');
const {deleteFile}  = require('../services/aws');


 
exports.handler = async (req, res) => {

  const file = req.file
  // 1. only allow POST methods
  if (req.method !== 'POST') {
      return res.status(400).send('method not supported');
  }

  // check if the file pdf and its exist


  try {
      // 2. connect to the mongodb db

      await connectDB()
          .then(() => {
              console.log("db conntected in upload phase");
          });

      // Check if the file object exists
      if (!file) {
        return res.status(400).json({
            error: 'No file uploaded'
        });
      }
     
      console.log(file);

      
      // check if the file is pdf
      if (file.mimetype !== 'application/pdf') {
          res.json({
              error: 'Only PDF files are allowed.'  // TODO : ADD MORE FILE TYPES
          });
      }

      else {

      // Check if the necessary file properties are available
      // 4. upload the file to s3
      const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype)
      
    




     //////////////////////////// PINECONE ////////////////////////////


    //   // 5. initialize pinecone // initialize pinecone name index
    //   const filenameWithoutSpecial = file.originalname.split('.')[0];
    //   const filenameSlug = slugify(filenameWithoutSpecial, {
    //       lower: true,
    //       strict: true,
    //   });
     
    //   const pinecone = new Pinecone({
    //     environment: process.env.PDB_ENV,
    //     apiKey: process.env.PDB_KEY,
    // })

     // 6. create a pinecone index and check if it exists


    //   const indexes = await pinecone.listIndexes()

    //   if (!indexes.includes(filenameSlug)) {
    //       await pinecone.createIndex({
    //             name: filenameSlug,
    //             dimension: 768,
    //             metric: 'cosine',
      
    //       });
    //       console.log('index created');
    //   } else {
    //       throw new Error(`Index with name ${filenameSlug} already exists`);
    //   }

    //////////////////////////////////////////////////////




      // 7. save file info to the mongodb db

      const myFile = new Doc({
          FileName: file.originalname,
          FileUrl: dataLocation, // aws file url
      });

      await myFile.save()
      .then(() => {console.log("file info successfully saved in mongo db")})
      .catch((err) => {console.log("file faild to save on mongo db" ,err)});
      // await disconnectDB()


      // 8. return the success response
      return res.status(200).json({
          message: 'File uploaded to S3 and MongoDB successfully',
      });
      };

  } catch (e) {
      console.log('--error--', e);
      // await disconnectDB()
      return res.status(500).send({
          message: e.message,
      });
  }
}