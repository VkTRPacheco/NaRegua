const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const moment = require('moment');
const pagarme = require('../services/pagarme');
const _ = require('lodash');
const util = require('../services/util');
const keys = require('../data/keys.json')

const Cliente = require('../models/cliente');
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Colaborador = require('../models/colaborador');
const Agendamento = require('../models/agendamento');
const Horario = require('../models/horario');



router.post('/', async (req, res) => {
    const db = mongoose.connection;
    const session = await db.startSession();
    session.startTransaction();
    try {
        const { clienteId, salaoId, servicoId, colaboradorId } = req.body;

        /*
            FAZER VERIFICAÇÃO SE AINDA EXISTE AQUELE HORARIO DISPONIVEL 
        */

        // RECUPERAR O CLIENTE
        const cliente = Cliente.findById(clienteId).select('nome endereco customerId');

        // RECUPERAR O SALAO
        const salao = Salao.findById(salaoId).select('recipientId');

        // RECUPERAR O SERVICO
        const servico = Servico.findById(servicoId).select('preco titulo comissao');

        // RECUPERAR O COLABORADOR
        const colaborador = Colaborador.findById(colaboradorId).select('recipientId');

        //CRIANDO PAGAMENTO
        const precoFinal = util.toCents(servico.preco);  //39,90 => 3990

        // COLABORADOR SPLIT RULES
        const colaboradorSplitRule = {
            recipient_id: colaborador.recipientId,
            amount: parseInt(precoFinal * (servico.comissao /100)),
        };

        const createPayment = await pagarme('/', {
            // PRECO TOTAL
            amount: precoFinal,

            // DADOS DO CARTAO
            card_number: "4111111111111111",
            card_cvv: "123",
            card_expiration_date: "0830",
            card_holder_name: "Morpheus Fishburne",
            
            // DADOS DO CLIENTE
            customer: {
                id: cliente.customerId
            },

            // DADOS DO ENDERECO DO CLIENTE
            billing: {
                name: cliente.nome,
                address: {
                    country: cliente.endereco.pais,
                    state: cliente.endereco.uf,
                    city: cliente.endereco.cidade,
                    street: cliente.endereco.logradouro,
                    street_number: cliente.endereco.numero,
                    zipcode: cliente.endereco.cep
                }
            },
            // ITENS DA VENDA
            "items": [
            {
                id: servicoId,
                title: servico.titulo,
                unit_price: precoFinal,
                quantity: 1,
                tangible: false
            },
            ]
            split_rules: [
                // TAXA DO SALAO
                {
                    recipientId: salao.recipientId,
                    amount: precoFinal - keys.app_fee - colaboradorSplitRule.amount,
                },
                // TAXA DO COLABORADOR
                colaboradorSplitRule,
                // TAXA DO APP
                {
                    recipientId: keys.recipient_id,
                    amount: keys.app_fee,
                },
            ],
        });


        if(createPayment.error) {
            throw createPayment;
        }

        // CRIAR AGENDAMENTO
        const agendamento = await new Agendamento({
            ...req.body,
            transactionId: createPayment.data.id,
            comissao: servico.comissao,
            valor: servico.preco,
        }).save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ error: false, agendamento });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter', async (req, res) => {
    try {

        const { periodo, salaoId } = req.body;

        const agendamento = await Agendamento.find({
            salaoId,
            data: {
                $gte: moment(periodo.inicio).startOf('day'),
                $lte: moment(periodo.final).endOf('day'),
            },
        }).populate([
            { path: 'servicoId', select: 'titulo duracao' },
            { path: 'colaboradorId', select: 'nome' },
            { path: 'clienteId', select: 'nome' },
        ]);

        res.json({ error: false, agendamento });

    } catch (err) {
        res.json({ error: true, message: err.message })
    }
});

router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, salaoId, servicoId } = req.body;
        const horarios = await Horario.find({ salaoId });
        const servico = await Servico.findById(servicoId).select('duracao');

        let agenda = [];
        let colaboradores = [];
        let lastDay = moment(data);

        // DURAÇÃO DO SERVICO
        const servicoMinutos = util.hourToMinutes(moment(servico.duracao).format('HH:mm'));

        const servicoSlots = util.sliceMinutes(
            moment(servico.duracao).format('HH:mm'),
            moment(servico.duracao).add(servicoMinutos, 'minutes'),
            util.SLOT_DURATION,
        ).length;

            /* PROCURE NOS PROXIMOS 365 DIAS ATE A  AGENDA CONTER 7 DIAS DISPONIVEIS */

        for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
            const espacosValidos = horarios.filter(horario => {
                // VERIFICAR O DIA DA SEMANA
                const diaSemanaDisponivel = horario.dias.includes(moment(lastDay).day());

                // VERIFICAR ESPECIALIDADES DISPONIVEL
                const servicoDisponivel = horario.especialidades.includes(servicoId);

                return diaSemanaDisponivel && servicoDisponivel;
            });

            /*  
            TODOS OS COLABORADORES DISPONIVEIS E SEUS HORARIOS NO DIA
            [
                {
                    "2023-08-30": {
                        "123654321654321": [
                            15:00,
                            15:00,
                            15:00,
                        ]
                    }
                }
            ]

            */

            if (espacosValidos.length > 0 ) {

                let todosHorariosDias = {};
                
                for (let spaco of espacosValidos) {
                    for (let colaborador of spaco.colaboradores) {
                        if (!todosHorariosDias[colaboradorId]) {
                            todosHorariosDias[colaboradorId] = []
                        }

                        /*
                        PEGAR TODOS OS HORARIOS E JOGAR PRA DENTRO DO COLABORADOR
                        */

                        todosHorariosDias[colaboradorId] = [
                            ...todosHorariosDias[colaboradorId],
                            ...util.sliceMinutes(
                                util.mergeDateTime(lastDay, spaco.inicio),
                                util.mergeDateTime(lastDay, spaco.fim),
                                util.SLOT_DURATION,
                            ),
                        ];
                    }
                }

                //OCUPAÇAO DE CADA ESPECIALISTA NO DIA
                for(let colaboradorId of Object.keys(todosHorariosDias)) {
                    // RECUPERAR AGENDAMENTOS
                    const agendamentos = Agendamento.find({
                        colaboradorId,
                        data: {
                            $gte: moment(lastDay).startOf('day'),
                            $lte: moment(lastDay).endOf('day'),
                        },
                    })
                        .select('data servicoId -_id');
                        .populate('servicoId', 'duracao');


                    // RECUPERAR HORARIO AGENDADOS
                    let horariosOcupados = agendamentos.map(agendamento => ({
                        inicio: moment(agendamento.data),
                        final: moment(agendamento.data).add(util.hourToMinutes(
                        moment(agendamento.servicoId.duracao).format('HH:mm')
                        ),
                        'minutes'
                        ),
                    }));

                    // RECUPERAR TODOS OS SLOTS ENTRE OS AGENDAMENTOS
                    horariosOcupados = horariosOcupados
                        .map(horario => 
                            util.sliceMinutes(
                                horario.inicio,
                                horario.final,
                                util.SLOT_DURATION
                            )
                        )
                        .flat();

                    // REMOVENDO TODOS OS HORARIOS/ SLOT OCUPADOS
                    let horariosLivres = util.splitByValue(todosHorariosDias[colaboradorId].map(horarioLivre => {
                        return horariosOcupados.includes(horariosLivre) ? '-' : horarioLivre;
                    }), '-' ).filter((space) = space.length > 0);

                    // VERIFICANDO SE EXISTE ESPAÇO SUFICIENTE NO SLOT
                    horariosLivres = horariosLivres.filter((horarios) => horarios.length >= servicoSlots);

                    /*
                    VERIFICANDO SE OS HORARIOS DENTRO DO SLOT 
                    TEM A QUANTIDADE NECESSARIA
                    */ 

                    horariosLivres = horarioLivres.map((slot) => slot.filter((horario, index) => slot.length - index >= servicoSlots)
                    ).flat();
                    
                    // FORMATANDO OS HORARIOS DE 2 EM 2
                    horariosLivres = _.chunk(horariosLivres, 2);

                    // REMOVER COLABORADOR CASO NÃO TENHA NENHUM ESPAÇO
                    if (horariosLivres.length == 0) {
                        todosHorariosDia = _.omit(todosHorariosDia, colaboradorId);
                    } else {
                        todosHorariosDias[colaboradorId] = horariosLivres;
                    }
                }

                // VERIFICAR SE TEM ESPECIALISTA DISPONIVEL NAQUELE DIA
                const totalEspecialistas = Object.keys(todosHorariosDia).length;

                if (totalEspecialistas > 0) {
                    colaboradores.push(Object.keys(todosHorariosDia));
                    agenda.push({[
                    lastDay.format('YYYY-MM-DD')]: todosHorariosDias,
                     });
                }

                
            }

            lastDay = lastDay.add(1, 'day');
        };


        // RECUPERANDO DADOS DOS COLABORADORES
        colaboradores = _.uniq(colaboradores.flat());
       
        colaboradores = await Colaborador.find({
            _id: { $in: colaboradores},
        }).select('nome foto');

        colaboradores = colaboradores.map(c => ({
            ...c._doc,
            nome: c.nome.split(' ')[0],
        }));

        res.json({ 
            error: false,
            colaboradores,
            agenda,
         });
    } catch (err) {
        res.json({ error: true, message: err.message })
    }
});


module.exports = router;
