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
    const quantidadeEmLoja = document.getElementById('quantidadeEmLoja').value;
    const quantidadeEmEstoque = document.getElementById('quantidadeEmEstoque').value;
    let dataVencimento = document.getElementById('dataVencimento').value;

    if (dataVencimento) {
        dataVencimento = new Date(dataVencimento).toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    const usuario = document.getElementById('usuario').value;

    const dataHoraInsercao = new Date();
    const dataFormatada = dataHoraInsercao.toLocaleDateString('pt-BR');
    const horaFormatada = dataHoraInsercao.toLocaleTimeString('pt-BR');
    const dataHoraFormatada = `${dataFormatada} ${horaFormatada}`;

    const produtoData = {
        codigo,
        produto,
        quantidadeEmLoja,
        quantidadeEmEstoque,
        dataVencimento,
        usuario,
        dataHoraInsercao: dataHoraFormatada
    };

    if (editingRow !== null) {
        updateProductInTable(editingRow, produtoData);
        editingRow = null;
        document.getElementById('productForm').reset();
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
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

import { editProduct } from './table-handler.js';
window.editProduct = editProduct;
