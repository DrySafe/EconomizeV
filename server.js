const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');
const requestIp = require('request-ip');
const logger = require('./logger'); // Importar o logger

const app = express();
const port = process.env.PORT || 3500;
const productsFilePath = path.join(__dirname, 'products.json');

let products = [];

// Verificar se o arquivo JSON de produtos existe e carregá-lo
if (fs.existsSync(productsFilePath)) {
    const productsData = fs.readFileSync(productsFilePath);
    products = JSON.parse(productsData);
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para registrar acessos
app.use((req, res, next) => {
    const clientIp = requestIp.getClientIp(req); 
    logger.info(`Acesso de IP: ${clientIp}, Rota: ${req.originalUrl}`);
    next();
});

app.post('/addProduct', (req, res) => {
    const product = req.body;
    products.push(product);
    saveProductsToFile();
    
    const clientIp = requestIp.getClientIp(req); 
    logger.info(`Produto adicionado de IP: ${clientIp}, Produto: ${JSON.stringify(product)}`);

    res.json({ message: 'Produto adicionado com sucesso!' });
});

app.post('/logEdit', (req, res) => {
    const product = req.body.product;
    const action = req.body.action;
    const clientIp = requestIp.getClientIp(req);
    
    logger.info(`Produto editado de IP: ${clientIp}, Ação: ${action}, Produto: ${JSON.stringify(product)}`);
    
    res.json({ message: 'Edição registrada com sucesso!' });
});


app.get('/getProducts', (req, res) => {
    res.json(products);
});

app.get('/exportToExcel', (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Produtos');
    worksheet.columns = [
        { header: '#', key: 'id', width: 5 },
        { header: 'Código', key: 'codigo', width: 8 },
        { header: 'Produto', key: 'produto', width: 32 },
        { header: 'Quantidade', key: 'quantidade', width: 12 },
        { header: 'Valor', key: 'valor', width: 12 },
        { header: 'Motivo', key: 'motivo', width: 13 },
        { header: 'Data de Vencimento', key: 'dataVencimento', width: 19 },
        { header: 'Usuário', key: 'usuario', width: 12 },
        { header: 'Data e Hora de Inserção', key: 'dataHoraInsercao', width: 25 },
        { header: '', key: 'empty', width: 2 },
        { header: 'ROTINA', key: 'novaColuna', width: 20 },
        { header: '', key: 'novaColuna2', width: 20 }
    ];

    products.forEach((product, index) => {
        const { codigo, produto, quantidade, valor, motivo, dataVencimento, usuario, dataHoraInsercao } = product;
        worksheet.addRow({ id: index + 1, codigo, produto, quantidade, valor, motivo, dataVencimento, usuario, dataHoraInsercao, empty: '', novaColuna: '' });
    });

    const listaDeItens = ['Filial', 'Cliente', 'Produtos', 'Quantidade', 'CÓD Fiscal', 'Conta Avaria', 'Conta Consumidor', '', 'TOTAL AVARIA', 'TOTAL USO LOJA', 'TOTAL VENCIMENTO'];
    listaDeItens.forEach((item, index) => {
        worksheet.getCell(index + 2, 11).value = item;
    });

    const listaDeItens2 = ['', '', '', '', '', '', '', '', '', '', ''];
    listaDeItens2.forEach((item, index) => {
        worksheet.getCell(index + 2, 12).value = item;
    });

    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        row.eachCell({ includeEmpty: false }, function (cell, colNumber) {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (rowNumber === 1) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'ff9800' }
                };
                cell.font = { bold: true };
            } else {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: rowNumber % 2 === 0 ? { argb: 'FFF6E7' } : { argb: 'F5F5F5' }
                };
            }
        });
    });

    worksheet.getColumn('novaColuna').alignment = { horizontal: 'left' };
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=produtos.xlsx');

    workbook.xlsx.write(res)
        .then(() => {
            res.end();
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Erro ao exportar para Excel');
        });
});

// Função para salvar os produtos em um arquivo JSON
function saveProductsToFile() {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 4));
}

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
