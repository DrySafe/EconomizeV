import { productCodes, productNames, userNames, setEditingRow } from './form-handler.js';

let productCount = 0;

export function addProductToTable(produto) {
    productCount++;
    const tableBody = document.getElementById('productTable').querySelector('tbody');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${productCount}</td>
        <td>${produto.codigo}</td>
        <td>${produto.valor}</td> <!-- Novo campo de valor -->
        <td>${produto.produto}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.motivo}</td>
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
    document.getElementById('valor').value = row.children[2].innerText; // Novo campo de valor
    document.getElementById('produto').value = row.children[3].innerText;
    document.getElementById('quantidade').value = row.children[4].innerText;
    document.getElementById('motivo').value = row.children[5].innerText;
    document.getElementById('dataVencimento').value = row.children[6].innerText;
    document.getElementById('usuario').value = row.children[7].innerText;

    if (row.children[5].innerText === 'VENCIDO') {
        document.getElementById('dataVencimentoGroup').style.display = 'block';
    } else
    {
        document.getElementById('dataVencimentoGroup').style.display = 'none';
    }
}

export function updateProductInTable(row, produto) {
    row.children[1].innerText = produto.codigo;
    row.children[2].innerText = produto.valor; // Atualiza o valor do produto
    row.children[3].innerText = produto.produto;
    row.children[4].innerText = produto.quantidade;
    row.children[5].innerText = produto.motivo;
    row.children[6].innerText = produto.dataVencimento;
    row.children[7].innerText = produto.usuario;
    row.children[8].innerText = produto.dataHoraInsercao; // Atualiza a nova coluna de data e hora

    alert('Produto atualizado com sucesso!');
}
