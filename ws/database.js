const mongoose = require('mongoose');
const URI = 'mongodb+srv://dbNaRegua:dbNaReguaEtec@clusterdev.t5gofav.mongodb.net/?retryWrites=true&w=majority&authMechanism=SCRAM-SHA-1';


mongoose.connect(URI, { useNewUrlParser: true });
mongoose.createConnection(URI, { useNewUrlParser: true });

mongoose
    .connect(URI)
    .then(() => console.log('DB is Up!'))
    .catch(() => console.log(err));