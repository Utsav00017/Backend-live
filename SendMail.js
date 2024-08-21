var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'utsavbutani1234@gmail.com',
      pass: 'ltpj uzeb npto zvld'
    }
  });
  
  var mailOptions = {
    from: 'utsavbutani1234@gmail.com',
    to: 'utsavbutani1234@gmail.com',
    subject: 'Sending Email using Node.js',
    text: '!'
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });