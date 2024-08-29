const bcrypt = require('bcrypt'); // Or 'bcryptjs' if you installed bcryptjs

bcrypt.hash('testPassword', 10, (err, hash) => {
    if (err) throw err;
    console.log('Hash:', hash);
});
