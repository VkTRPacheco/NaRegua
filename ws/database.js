const mongoose = require('mongoose');
const URI = 'mongodb+srv://dbNaRegua:<dbNaRegua>@clusterdev.t5gofav.mongodb.net/?retryWrites=true&w=majority';

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose
    .connect(URI)
    .then(() => console.log('DB is Up!'))
    .catch(() => console.log('Erro!'));
