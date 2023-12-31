const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salao = new Schema({
    nome: {
        type: String,
        required: [true, 'Nome é Obrigatório!'],
    },
    foto: String,
    capa: String,
    email: {
        type: String,
        required: [true, 'E-mail é Obrigatório!'],
    },
    senha: {
        type: String,
        default: null,
    },
    telefone: String,
    endereco: { 
        cidadae: String,
        uf: String,
        cep: String,
        numero: String,
        pais: String,
    },
    geo:{
        type: String,
        coordinates: [Number],
    },
    recipientId: {
        type: String,
    },
    dataCadastro: {
        type: Date,
        default: Date.now,
    }
});

salao.index({ geo: '2dsphere'});

module.exports = mongoose.model('Salao', salao);