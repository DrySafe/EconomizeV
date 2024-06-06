const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const os = require('os');
const ExcelJS = require('exceljs');
const winston = require('winston');


const app = express();
const port = process.env.PORT || 3600;
const userDataDir = path.join(os.homedir(), 'economizeData');
const productsFilePath = path.join(userDataDir, 'vencimento.json');
const logFilePath = path.join(userDataDir, 'access.log');

if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir);
}

let products = [];

if (fs.existsSync(productsFilePath)) {
    const productsData = fs.readFileSync(productsFilePath);
    products = JSON.parse(productsData);
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: logFilePath })
    ]
});

app.post('/addProduct', (req, res) => {
    const product = req.body;
    products.push(product);
    saveProductsToFile();
    res.json({ message: 'Produto adicionado com sucesso!' });
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
        { header: 'Quantidade em Loja', key: 'quantidadeEmLoja', width: 20 },
        { header: 'Quantidade em Estoque', key: 'quantidadeEmEstoque', width: 20 },
        { header: 'Data de Vencimento', key: 'dataVencimento', width: 19 },
        { header: 'Usuário', key: 'usuario', width: 12 },
        { header: 'Data e Hora de Inserção', key: 'dataHoraInsercao', width: 25 }
    ];

    products.forEach((product, index) => {
        const { codigo, produto, quantidadeEmLoja, quantidadeEmEstoque, dataVencimento, usuario, dataHoraInsercao } = product;
        worksheet.addRow({ id: index + 1, codigo, produto, quantidadeEmLoja, quantidadeEmEstoque, dataVencimento, usuario, dataHoraInsercao });
    });

    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        row.eachCell({ includeEmpty: false }, function (cell) {
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

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=vencimento.xlsx');

    workbook.xlsx.write(res)
        .then(() => {
            res.end();
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Erro ao exportar para Excel');
        });
});

app.post('/resetProducts', (req, res) => {
    const { password } = req.body;

    if (password !== '1234') {
        return res.status(401).json({ message: 'Senha incorreta' });
    }

    const backupFilePath = path.join(userDataDir, `vencimento_backup_${Date.now()}.json`);
    fs.copyFileSync(productsFilePath, backupFilePath);

    products = [];
    saveProductsToFile();

    res.json({ success: true, message: 'Lista de vencimento resetada com sucesso' });
    logger.log('info', 'Lista de vencimento resetada e backup criado');
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

function saveProductsToFile() {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 4));
}

function logAccess(req) {
    macaddress.one((err, mac) => {
        if (err) {
            console.error('Erro ao obter o endereço MAC:', err);
            return;
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            mac: mac
        };

        logger.info(logEntry);
    });
}

app.use((req, res, next) => {
    logAccess(req);
    next();
});
