const express = require('express');
const router = express.Router();
const Busboy = require('busboy');
const aws = require('../services/aws');
const Salao = require('../models/salao');
const Servico = require('../models/servico');

router.post('/', async (req, res) => {
    let busboy = new Busboy({ headers: req.header });
    busboy.on('finish', async () => {
        try {
            const { salaoId } = req.body;
            let erros = [];
            let arquivos = [];

            /* 
                {
                    "123123123123": { ... },
                    "123123123123": { ... },
                    "123123123123": { ... }
                },
            */
            if (req.files && Object.keys(req.files) > 0 ) {
                for (let key of Object.keys(req.files)) {
                    const file = req.files[key];

                    //123123123.jpg
                    const nameParts = file.name.slit('.') //[123123123, jpg]
                    const fileName = `${new Date().getTime()}.${
                        nameParts[nameParts.length - 1]
                    }`;
                    const path = `servicos/`;
                }
            }
        } catch (err) {
            res.json({ error: true, message: err.message})
        }
    });
    req.pipe(busboy);  
});


module.exports = router;