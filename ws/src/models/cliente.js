const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cliente = new Schema({
    nome: {
        type: String,
        required: true,
    },
    telefone: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    senha: {
        type: String,
        required: true,
    },
    foto: {
        type: String,
        required: true,
    },
    dataNascimento: {
        type: String, // YYYY--MM--DD
        required: true,
    },
    sexo: {
        type: String, 
        enum: ['M', 'F'],
        required: true,
    },
    status: {
        type: String, 
        enum: ['A', 'I'],
        required: true,
        default: 'A'
    },    
    documento: {
        tipo: {
            type: String,
            enum: ['cpf', 'cnpj'],
            required: true
        },
        numero: {
            type: String,
            required: true
        },
    },
    endereco: {
        cidadae: String,
        uf: String,
        cep: String,
        logradouro: String,
        numero: String,
        pais: String,
    },
    custumerId: {
        type: String,
        required: true,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    },  
});



module.exports = mongoose.model('Cliente', cliente);