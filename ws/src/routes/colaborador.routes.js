const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Colaborador = require('../models/colaborador');

router.post('/', async (req, res) => {
        const db = mongoose.connection;
        const session = await db.startSession;

        try {

            const { colaborador, salaoId} = req.body;

            //VERIFICAR SE O COLABORADOR EXISTE
            const existentColaborador = await Colaborador.findOne({
                $or: [
                    { email: colaborador.email },
                    { telefone: colaborador.telefone },
                ]
            });

            //SE NAO EXISTIR O COLABORADOR
            if (!existentColaborador) {
                // CRIAR CONTA BANCARIA
                const { contaBancaria } = colaborador;

                //CRIAR RECEBEDOR
            }

        } catch (err) {
            await session.abortTransaction();
            session.endSession();
            res.json({ error: true, message: err.message});
        }
    
});

module.exports = router;
