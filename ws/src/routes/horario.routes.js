const express = require('express');
const router = express.Router();
const _ = require('lodash');

const Horario = require('../models/horario');
const ColaboradorServico = require('../models/relationship/colaboradorServico');

router.post('/', async (req, res) => {
    try {
        const horario = await new horario(req.body).save;
        res.json({ horario });
    } catch (err) {
        res.json({ error: true, message: err.message});
    }
});

router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        const horarios = await Horario.find({
            salaoId,
        });    

        res.json({ horario });
    } catch (err) {
        res.json({ error: true, message: err.message});
    }
});

router.put('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;
        const horario = req.body;
        
        await Horario.findByIdAndUpdate(horarioId, horario);

        res.json({ horario });
    } catch (err) {
        res.json({ error: true, message: err.message});
    }
});


router.post('/colaboradores', async (req, res) => {
    try {
        const colaboradorServico = await ColaboradorServico.find({
            // [123,123,123]
            servicoId: { $in: req.body.servico },
            status: 'A',
        })
            .populate('colaboradorId', 'nome')
            .select('colaborador -_id');

        const listaColaboradores = _.uniqBy(
            colaboradorServico,
            (vinculo) => vinculo
            .colaboradorId._id.toString()
            ).map(vinculo => ({
            label: vinculo.colaboradorId.nome, 
            value: vinculo.colaboradorId._id,
        }));

        res.json({ error: false, listaColaboradores });
    } catch (err) {
        res.json({ error:true, message: err.message});
        }
});

router.delete('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;        
        await Horario.findByIdAndDelete(horarioId);
        res.json({ horario });
    } catch (err) {
        res.json({ error: true, message: err.message});
    }
});



module.exports = router;
