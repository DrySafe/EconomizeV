import { productCodes, productNames, userNames, setEditingRow } from './form-handler.js';

let productCount = 0;

export function addProductToTable(produto) {
    productCount++;
    const tableBody = document.getElementById('productTable').querySelector('tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${productCount}</td>
        <td>${produto.codigo}</td>
        <td>${produto.produto}</td>
        <td>${produto.quantidadeEmLoja}</td>
        <td>${produto.quantidadeEmEstoque}</td>
        <td>${produto.dataVencimento}</td>
        <td>${produto.usuario}</td>
        <td>${produto.dataHoraInsercao}</td>
        <td><button class="edit-button" onclick="editProduct(this)">Editar</button></td>
    `;

    tableBody.appendChild(row);

    if (!productCodes.includes(produto.codigo)) productCodes.push(produto.codigo);
    if (!productNames.includes(produto.produto)) productNames.push(produto.produto);
    if (!userNames.includes(produto.usuario)) userNames.push(produto.usuario);
}

export function editProduct(button) {
    const row = button.parentElement.parentElement;
    setEditingRow(row);

    document.getElementById('codigo').value = row.children[1].innerText;
    document.getElementById('produto').value = row.children[2].innerText;
    document.getElementById('quantidadeEmLoja').value = row.children[3].innerText;
    document.getElementById('quantidadeEmEstoque').value = row.children[4].innerText;
    document.getElementById('dataVencimento').value = row.children[5].innerText;
    document.getElementById('usuario').value = row.children[6].innerText;
}

export function updateProductInTable(row, produto) {
    row.children[1].innerText = produto.codigo;
    row.children[2].innerText = produto.produto;
    row.children[3].innerText = produto.quantidadeEmLoja;
    row.children[4].innerText = produto.quantidadeEmEstoque;
    row.children[5].innerText = produto.dataVencimento;
    row.children[6].innerText = produto.usuario;
    row.children[7].innerText = produto.dataHoraInsercao;

    alert('Produto atualizado com sucesso!');
}
