// const { Server } = require("socket.io");

const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const Joi = require('joi')
const jwtToken = require('jsonwebtoken')
const serviceRedis = require('./service/redisService')
const { jwtAuthenticate } = require('./service/jwt/jwt')
require('dotenv').config();
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
  }
});
const db = require('./db');

const User = db.User;

// const User = [
//   {
//     email: "sajid@gmail.com",
//     userPass: "1234",
//     deviceId: "ctqjyhTif2LHDSkzB1Viae:APA91bGgc0IR5O80dVcabuzBlNAkHjKi5FLoOAUWekIKljZCcnhFi_9ieq9CSy4ZaKOXyL1tIxBpDWprnHpUnNsaq01paLPkrfpp7zNvooUsHLoUMuQska3BmGhwXknQfBhXi-9Rqbck"
//   },
//   {
//     email: "demo@gmail.com",
//     userPass: "1234",
//     deviceId: "ctqjyhTif2LHDSkzB1Viae:APA91bGgc0IR5O80dVcabuzBlNAkHjKi5FLoOAUWekIKljZCcnhFi_9ieq9CSy4ZaKOXyL1tIxBpDWprnHpUnNsaq01paLPkrfpp7zNvooUsHLoUMuQska3BmGhwXknQfBhXi-9Rqbck"
//   },
//   {
//     email: "annu@gmail.com",
//     userPass: "1234",
//     deviceId: "ctqjyhTif2LHDSkzB1Viae:APA91bGgc0IR5O80dVcabuzBlNAkHjKi5FLoOAUWekIKljZCcnhFi_9ieq9CSy4ZaKOXyL1tIxBpDWprnHpUnNsaq01paLPkrfpp7zNvooUsHLoUMuQska3BmGhwXknQfBhXi-9Rqbck"
//   },
//   {
//     email: "ap@gmail.com",
//     userPass: "1234",
//     deviceId: "ctqjyhTif2LHDSkzB1Viae:APA91bGgc0IR5O80dVcabuzBlNAkHjKi5FLoOAUWekIKljZCcnhFi_9ieq9CSy4ZaKOXyL1tIxBpDWprnHpUnNsaq01paLPkrfpp7zNvooUsHLoUMuQska3BmGhwXknQfBhXi-9Rqbck"
//   },
//   {
//     email: "raja@gmail.com",
//     userPass: "1234",
//     deviceId: "ctqjyhTif2LHDSkzB1Viae:APA91bGgc0IR5O80dVcabuzBlNAkHjKi5FLoOAUWekIKljZCcnhFi_9ieq9CSy4ZaKOXyL1tIxBpDWprnHpUnNsaq01paLPkrfpp7zNvooUsHLoUMuQska3BmGhwXknQfBhXi-9Rqbck"
//   },

// ]

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
})
app.use(bodyParser.json())
app.post('/createUser', async (req, res) => {

  try {
    const registerParamSchema = Joi.object({
      email: Joi.string().required(),
      userPass: Joi.string().required(),
      deviceId: Joi.string().required(),
    });

    const validateData = registerParamSchema.validate(req.body, {
      abortEarly: true
    })
    if (validateData && validateData.error) {
      return res.status(200).json({ message: validateData.error.details[0].message.replace(/\"/g, ""), error: true, data: null })
    }
    let resData = await User.findOne({ email: req.body.email });
    console.log('resData______________-resData_???????????????', resData, req.body);
    if (resData) {
      res.status(200).json({ message: "User Already Exist", data: null, error: true })
    }
    else {
      try {
        var testUser = new User(req.body);
        var responnse = await testUser.save();
        console.log("res ", responnse);
        return res.status(200).json({ message: "User Create Successfully", error: false, data: responnse })
      } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error, error: true, data: null })
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: error.message, data: null, error: true })
  }
});
app.post('/loginUser', async (req, res) => {

  try {
    const registerParamSchema = Joi.object({
      email: Joi.string().required(),
      userPass: Joi.string().required(),
      deviceId: Joi.string().required(),
    });
    console.log('loginUser_______', req.body);
    const validateData = registerParamSchema.validate(req.body, {
      abortEarly: true
    })
    if (validateData && validateData.error) {
      return res.status(200).json({ message: validateData.error.details[0].message.replace(/\"/g, ""), error: true, data: null })
    }
    let resData = await User.findOne({ email: req.body.email });
    console.log('resData______________-resData_???????????????', resData, req.body);
    if (resData) {
      let verifypass = null;
      try {
        verifypass = await bcrypt.compare(req.body.userPass, resData.userPass);
        console.log('verifypass__________', verifypass);
      } catch (error) {
        console.log('error____occur', error);
        res.status(400).json({ message: "Server Error", error: true, data: null })
      }
      if (verifypass) {
        const token = jwtToken.sign(
          {
            email: resData.email,
            userId: resData._id,
          },
          "ANY"
        );
        let data = {
          email: resData.email,
          token: token,
          deviceId: resData.deviceId

        }
        resData.deviceId = req.body.deviceId
        await resData.save();
        res.json({ message: "Success", data: data, error: false })
      } else {
        res.status(200).json({ message: "Invalid Credential", data: null, error: true })
      }

    }
    else {
      res.status(200).json({ message: "User Not Found", error: true, data: null })
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message, data: null, error: true })
  }
});
app.get('/getUserList', jwtAuthenticate, async (req, res) => {
  try {
    User.find({ _id: { $ne: req.user.userId } })
      .then((data) => {
        return res.json({ message: "Success", data: data, error: false })
      })
      .catch((err) => {
        console.log('err____', err);
        return res.status(400).json({ message: err, data: null, error: true })
      })
  } catch (error) {
    console.log(error);
    res.json({ message: error.message, data: null })

  }
});

// const io = new Server(8000, {
//   cors: true,
// });

http.listen(process.env.PORT, () => {
  console.log(`listening on : ${process.env.PORT}`);
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
let roomList = []

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  socket.on("room:join", async (data) => {
    if (roomList.includes(data.room)) {
      const callFrom = data.room.split('_')[0];
      const callTo = data.room.split('_')[1];
      if (data.email == callTo) {
        const { email, room, } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        console.log('emailToSocketIdMap_________', emailToSocketIdMap, socketidToEmailMap);
        io.emit("notify:user", data);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
      } else {
        console.log('ELSE_____');
        socket.emit('user:busy', { "message": `${data.to} is busy` })
      }

    }
    else {
      roomList.push(data.room)
      await serviceRedis.setKey(data.email, 'busy');

      const getData = await serviceRedis.getKey(data.to);
      if (getData && getData.data) {
        console.log('getData________', getData);
        socket.emit('user:busy', { "message": `${data.to} is busy` })
      } else {
        await serviceRedis.setKey(data.to, 'busy');
        const { email, room, } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketidToEmailMap.set(socket.id, email);
        console.log('emailToSocketIdMap_________', emailToSocketIdMap, socketidToEmailMap);
        io.emit("notify:user", data);
        io.to(room).emit("user:joined", { email, id: socket.id });
        socket.join(room);
        io.to(socket.id).emit("room:join", data);
      }
    }

  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    // console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    // console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });



  socket.on("end:call", async (data) => {
    roomList.pop(data.room)
    console.log("end:call", data, emailToSocketIdMap, socketidToEmailMap);
    let remoteSocketId = emailToSocketIdMap.get(data.toEmail);
    let remoteEmail = socketidToEmailMap.get(data.to);
    let localEmail = socketidToEmailMap.get(data.from);
    if (data && data.to) {
      emailToSocketIdMap.delete(remoteEmail);
      socketidToEmailMap.delete(data.to);
      await serviceRedis.delKey(remoteEmail);
    } else if (data && data.toEmail) {
      emailToSocketIdMap.delete(data.toEmail);
      socketidToEmailMap.delete(remoteSocketId);
      await serviceRedis.delKey(data.toEmail);
    }
    socketidToEmailMap.delete(data.from);
    emailToSocketIdMap.delete(localEmail);
    await serviceRedis.delKey(localEmail);
    console.log('data && data.to ? data.to : remoteSocketId', data && data.to ? data.to : remoteSocketId);
    io.emit("end:call", { to: data && data.to ? data.to : remoteSocketId, toEmail: data.toEmail });
  });
});

// app.listen(8080, () => {
//   console.log('Server running on 8080');
// })