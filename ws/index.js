const  express =  require('express');
const app = express();
const morgan = require('morgan');


//Middlewares
app.use(morgan('dev'));


//Variaveis
app.set('port', 8000);

app.listen(app.get('port'), () => {
    console.log(`WS Escutando na porta ${app.get('port')}`);

});
