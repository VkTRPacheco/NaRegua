const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const pagarme = require('../services/pagarme');
const Cliente = require('../models/cliente');
const SalaoCliente = require('../models/relationship/salaoCliente');


router.post('/', async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession;
    session.startTransaction();

    try {
        const { cliente, salaoId} = req.body;
        let newCliente = null;

        //VERIFICAR SE O CLIENTE EXISTE
        const existentClient = await cliente.findOne({
            $or: [
                { email: cliente.email }, { telefone: cliente.telefone }
            ]
        });

        //SE NAO EXISTIR O CLIENTE
        if (!existentClient) {
           
            const _id = mongoose.Types.ObjectId();

            //CRIAR CUSTOMER
            const pagarmeCustomer = await pagarme('/customer', {
                external_id: _id,
                name: cliente.nome,
                type: cliente.documento.tipo == 'cpf' ? 'individual' : 'corporation',
                country: cliente.endereco.pais,
                email: cliente.email,
                documents: [
                    {
                        type: cliente.documento.tipo,
                        number: cliente.documento.numero,
                    },
                ],
                phone_numbers: [cliente.telefone],
                birthday: cliente.dataNascimento,
            });

            if (pagarmeCustomer.error) {
                throw pagarmeCustomer;
            }

            //CRIANDO CLIENTE
            newCliente = await Cliente ({
                ...cliente,
                _id,
                customerId: pagarmeCustomer.id
            }).save({ session });

        }

        //RELACIONAMENTO
        const clienteId = existentClient 
            ? existentClient._id
            : newCliente._id;

        //VERIFICA SE JA EXISTE O RELACIONAMENTO COM O SALAO
        const existentRelationship = await SalaoCliente.findOne({
            salaoId,
            clienteId,
            status: { $ne: 'E'},
        });

        //SE NAO ESTIVER VINCULADO
        if (!existentRelationship) {
            await new SalaoCliente({
            salaoId,
            clienteIdId,
            }).save({ session });
        }

        //SE JA EXISTIR O VINCULO ENTRE CLIENTE E SALAO
        if (existentClient) {
            const existentRelationship = await SalaoCliente.findOneAndUpdate(
                {
                salaoId,
                clienteId,
                },
                { status: 'A'},
                { session }
            );
        } 


        await session.commitTransaction();
        session.endSession();

        if (existentClient && existentRelationship) {
            res.json({ error: true, message: 'Cliente já Cadastrado.' })
        } else {
            res.json({ error: false, })
        }
        
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message});
    }

});

router.post('/filter', async (req, res) => {
    try {
        
        const cliente = await Cliente.find(req.body.filters);
        res.json({ error: false, cliente });

    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        let listaColaboradores = [];

        // RECUPERAR VINCULOS
        const clientes = await SalaoCliente.find({
            salaoId,
            status: { $ne: 'E' },
        })
            .populate('clienteId')
            .select('clienteId dataCadastro');

       
        res.json({
            error: false,
            clientes: clientes.map((vinculo) => ({
                ...vinculo.clienteId._doc,
                vinculoId: vinculo._id,
                dataCadastro: vinculo.dataCadastro,
            })),
        });

    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/vinculo/:id', async (req, res) => {
    try {
        await SalaoCliente.findByIdAndUpdate(req.params.id, { status: 'E' });
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router;