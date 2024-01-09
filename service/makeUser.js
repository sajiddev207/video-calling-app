const db = require('../db');

let User = db.User;

makeUser = async () => {
    let data = {
        email: "demo@gmail.com",
        userPass: "123456",
        deviceId: ""
    }
    try {
        var testUser = new User(data);
        var responnse = await testUser.save();
        console.log("res ", responnse);

        process.exit(0);

    } catch (error) {

        console.log(error);
        process.exit(0);
    }
}

makeUser();