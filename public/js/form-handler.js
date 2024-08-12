import { addProductToTable, updateProductInTable } from './table-handler.js';

let productCount = 0;
let editingRow = null;

export const productCodes = [];
export const productNames = [];
export const userNames = [];

export function setEditingRow(row) {
    editingRow = row;
}

export function handleFormSubmit(event) {
    event.preventDefault();

    const codigo = document.getElementById('codigo').value;
    const produto = document.getElementById('produto').value;
    const quantidade = document.getElementById('quantidade').value;
    const motivo = document.getElementById('motivo').value;
    let dataVencimento = document.getElementById('dataVencimento').value;
    const valor = document.getElementById('valor').value;

    // Formatar dataVencimento para dd/mm/aaaa
    if (motivo === 'VENCIDO' && dataVencimento) {
        const [year, month, day] = dataVencimento.split('-');
        dataVencimento = `${day}/${month}/${year}`;
    }

    const usuario = document.getElementById('usuario').value;
    const dataHoraInsercao = new Date();
    const dataFormatada = dataHoraInsercao.toLocaleDateString('pt-BR');
    const horaFormatada = dataHoraInsercao.toLocaleTimeString('pt-BR');
    const dataHoraFormatada = `${dataFormatada} ${horaFormatada}`;

    const produtoData = {
        codigo,
        produto,
        quantidade,
        motivo,
        dataVencimento: motivo === 'VENCIDO' ? dataVencimento : '',
        usuario,
        valor,
        dataHoraInsercao: dataHoraFormatada
    };

    if (editingRow !== null) {
        updateProductInTable(editingRow, produtoData);

        // Registrar edição no log
        fetch('/logEdit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'edit',
                product: produtoData
            })
        });

        editingRow = null;
        document.getElementById('productForm').reset();
        document.getElementById('dataVencimentoGroup').style.display = 'none';
    } else {
        fetch('/addProduct', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(produtoData)
        })
        .then(response => response.json())
        .then(data => {
            alert('Produto adicionado com sucesso!');
            addProductToTable(produtoData);
            document.getElementById('productForm').reset();
            document.getElementById('dataVencimentoGroup').style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}




// Tornar editProduct acessível no escopo global
import { editProduct } from './table-handler.js';
window.editProduct = editProduct;
