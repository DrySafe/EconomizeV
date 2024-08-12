const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const os = require('os');
const ExcelJS = require('exceljs');
const logger = require('./logger');

const app = express();
const port = process.env.PORT || 3500;

const userDataDir = path.join(os.homedir(), 'EconomizeData');
if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir);
}

const productsFilePath = path.join(userDataDir, 'products.json');

let products = [];

if (fs.existsSync(productsFilePath)) {
    const productsData = fs.readFileSync(productsFilePath);
    products = JSON.parse(productsData);
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/addProduct', (req, res) => {
    const product = req.body;

    // Converter dataVencimento de dd/mm/aaaa para YYYY-MM-DD
    if (product.dataVencimento) {
        const [day, month, year] = product.dataVencimento.split('/');
        product.dataVencimento = `${year}-${month}-${day}`;
    }

    products.push(product);
    saveProductsToFile();
    res.json({ message: 'Produto adicionado com sucesso!' });
    logger.log(`Produto adicionado: ${JSON.stringify(product)}`);
});



app.get('/getProducts', (req, res) => {
    res.json(products);
    logger.log(`Produtos acessados. Total: ${products.length}`);
});

app.get('/exportToExcel', async (req, res) => {
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
        { header: 'Data e Hora de Inserção', key: 'dataHoraInsercao', width: 25 }
    ];

    products.forEach((product, index) => {
        worksheet.addRow({
            id: index + 1,
            ...product,
            dataVencimento: product.motivo === 'VENCIDO' ? product.dataVencimento : '',
        });
    });

    worksheet.eachRow({ includeEmpty: false }, function (row, rowNumber) {
        row.eachCell({ includeEmpty: false }, function (cell, colNumber) {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            if (rowNumber === 1) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF9800' }
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

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=produtos.xlsx');

    await workbook.xlsx.write(res);
    res.end();

    logger.log('Exportação para Excel realizada');
});

app.post('/resetProducts', (req, res) => {
    const { password } = req.body;

    if (password !== '1234') {
        return res.status(401).json({ message: 'Senha incorreta' });
    }

    const backupFilePath = path.join(userDataDir, `products_backup_${Date.now()}.json`);
    fs.copyFileSync(productsFilePath, backupFilePath);

    products = [];
    saveProductsToFile();

    res.json({ success: true, message: 'Lista de produtos resetada com sucesso' });
    logger.log('Lista de produtos resetada e backup criado');
});

function saveProductsToFile() {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 4));
}

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
