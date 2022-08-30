/**
 * NODEJS API
 * DATABASE MONGODB
 * VERSION 1.0.0
 * POWERED BY SOFTLAB IT
 * DEVELOP BY MD IQBAL HOSSEN
 */
 const express = require("express");
 const mongoose = require('mongoose');
 const crossUnblocker = require('./middileware/cros-unblocker');
 const path = require('path');
 const dotenv = require('dotenv').config();
 const schedule = require('node-schedule');
 
 // Cross Unblocked File..
 const cors = require('cors');
 const errorHandler = require('./middileware/error-handler');
 
 const utils = require('./helpers/utils');

 
 
 /**
  *  Router File Import
  */
 const adminRoutes = require('./routes/admin');
 const searchRoutes = require('./routes/search.js'); 
 const productRoutes = require('./routes/product');
 const adjustmentRoutes = require('./routes/adjustment');
 const purchaseRoutes = require('./routes/purchase');
 const categoryRoutes = require('./routes/product-category');
 const subCategoryRoutes = require('./routes/product-sub-category');
 const bulkSmsRoutes = require("./routes/bulk-sms");
 const userRoutes = require('./routes/user');
 const sizeChart = require('./routes/size-chart');
 const stockControl = require('./routes/stock-control');
 const uploadRoutes = require('./routes/upload');
 const cartRoutes = require('./routes/cart');
 const orderRoutes = require('./routes/order');
 const invoiceRoutes = require('./routes/invoice');
 const returnRoutes = require('./routes/return');
 const tagRoutes = require('./routes/tag');
 const categoryMenuRoutes = require('./routes/category-menu');
 const galleryRoutes = require('./routes/gallery');
const imageFolderRoutes = require('./routes/image-folder');
const conversionRateRoutes = require('./routes/conversion-rate');

// Payment SSL
const paymentSSLRoutes = require("./routes/payment-ssl");

const zilaRoutes = require('./routes/zila');
const thanaRoutes = require('./routes/thana');
const cityRoutes = require('./routes/city');
 
 /**
  * MAIN APP CONFIG
  * REPLACE BODY PARSER WITH EXPRESS PARSER
  */
  // var whitelist = ['https://www.myntra.com/', 'https://www.flipkart.com', 'https://amazon.com/', 'https://www.aliexpress.com/','http://localhost:5501'];
  // var corsOptions = {
  //   origin: function (origin, callback) {
  //     if (whitelist.indexOf(origin) !== -1) {
  //       console.log('whitelist');
  //       callback(null, true)
  //     } else {
  //       callback(new Error('Not allowed by CORS'))
  //     }
  //   }
  // }

 const app = express();
//  app.use(crossUnblocker.allowCross);
 app.use(cors());
 app.options("*",cors());
 app.use(express.json({limit: '50mb'}));
 app.use(express.urlencoded({limit: '50mb', extended: true}));

// var whitelist = ['myntra.com', 'flipkart.com']
// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
//  app.options('/api/search', cors(corsOptions));
 /**
  * IMAGE UPLOAD STATIC DIR
  */
 app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
   
 
 /**
  * MAIN BASE ROUTER WITH IMPORTED ROUTES
  */
 app.use('/api/admin', adminRoutes);
 app.use('/api/search', searchRoutes);
 app.use('/api/product', productRoutes);
 app.use('/api/adjustment', adjustmentRoutes);
 app.use('/api/purchase', purchaseRoutes);
 app.use('/api/product-category', categoryRoutes);
 app.use('/api/product-sub-category', subCategoryRoutes);
 app.use('/api/bulk-sms', bulkSmsRoutes);
 app.use('/api/user', userRoutes);
 app.use('/api/size-chart', sizeChart);
 app.use('/api/stock-control', stockControl);
 app.use('/api/upload', uploadRoutes);
 app.use('/api/cart', cartRoutes);
 app.use('/api/order',orderRoutes);
 app.use('/api/invoice',invoiceRoutes);
 app.use('/api/return',returnRoutes);
 app.use('/api/tag', tagRoutes);
 app.use('/api/category-menu',categoryMenuRoutes);
 app.use('/api/gallery', galleryRoutes);
app.use('/api/image-folder', imageFolderRoutes);
app.use("/api/conversion-rate", conversionRateRoutes);

//ssl
app.use('/api/payment-ssl', paymentSSLRoutes);

app.use('/api/city', cityRoutes);
app.use('/api/thana', thanaRoutes);
app.use('/api/zila', zilaRoutes);

 /**
  * MAIN BASE GET PATH
  */
 app.get('/', (req, res) => {
    console.log(req.ip);
     res.send('<div style="width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center"><h1 style="color: blueviolet; text-transform: uppercase">TEST API RUNNING...</h1><p style="color: lightcoral">Powered by Saniul Islam</p></div>')
 })
 
 
 /**
  * Error Handler
  * 401 UnAuthorized, Access Denied
  * 406 Already Exists, Not Acceptable
  * 404 Not Found
  * 422 Input Validation Error, Unprocessable Entity
  * 500 Database Operation Error, Internal Server Error
  */
 app.use(errorHandler.route);
 app.use(errorHandler.next);
 
 
 /**
  * NODE SCHEDULER
  */
 


 
 // const expDate = new Date('2021-09-11T17:06:14+06:00');
 
 // schedule.scheduleJob(expDate, () => {
 //     console.log('NODE JOB Called in Date', new Date().toString())
 // });
 
//  const sJobTwoEveryTwoHour = schedule.scheduleJob('0 */2 * * *', () => {
//      console.log('NODE JOB Called in Every schedule time', new Date().toString());
//      updateData().then();
 
 
//      // setTimeout(() => {
//      //     sJob.cancel();
//      // }, 1000)
//  });
 
//  const sJobTwoEveryDay = schedule.scheduleJob('0 0 * * *', () => {
//      console.log('NODE JOB Called in Every Day', new Date().toString());
//      removeTempData().then();
 
//  });
 
//  async function updateData() {
//      const today = utils.getDateString(new Date());
//      const campaignProducts = await Product.find({
//          $or: [
//              { campaignStartDate: { $ne: null } },
//              { campaignEndDate: {$ne: null} }
//          ]
//      });
 
//      campaignProducts.forEach((f, i) => {
//          // Time Logic
//          const endDateTime = utils.convertToDateTime(f.campaignEndDate , f.campaignEndTime ? f.campaignEndTime: '23:59');
//          const endTimeFromNow = utils.getDateTimeDifference(endDateTime);
 
//          // const expDate = utils.getDateString(f.campaignEndDate);
//          // const timeLeftDay = utils.getDateDifference('d', expDate, today)
//          if (endTimeFromNow <= 0) {
//              Product.findByIdAndUpdate(f._id, {
//                  $set: {
//                      discountType: null,
//                      discountAmount: 0,
//                      campaignStartDate: null,
//                      campaignStartTime: null,
//                      campaignEndDate: null,
//                      campaignEndTime: null
//                  }
//              }).exec();
//          } else {
//              // console.log('Time Not Expired')
//          }
//      })
//  }
 
 async function removeTempData() {
     const today = new Date();
     today.setDate(today.getDate() - 2);
     const todayStr = utils.getDateString(today);
     await OrderTemporary.deleteMany({
         createdAt: {$lt: todayStr}
     });
 }
  
 /**
  * NODEJS SERVER
  * PORT CONTROL
  * MongoDB Connection
  * IF PASSWORD contains @ then encode with https://meyerweb.com/eric/tools/dencoder/
  * Database Name roc-ecommerce
  * User Access authSource roc-ecommerce
  */
 mongoose.connect(
    
    //  `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017/${process.env.DB_NAME}?authSource=${process.env.AUTH_SOURCE}`,
      `mongodb://localhost:27017/${process.env.DB_NAME}`,

     {
         useNewUrlParser: true,
        //  useFindAndModify: false,
         useUnifiedTopology: true,
        //  useCreateIndex: true
     }
 )
     .then(() => {
         const port = process.env.PORT || 3000;
         app.listen(port, () => console.log(`Server is running at port:${port}`));
         console.log('Connected to mongoDB');
         
 
     })
     .catch(err => {
         console.error('Oops! Could not connect to mongoDB Cluster0', err);
     })
