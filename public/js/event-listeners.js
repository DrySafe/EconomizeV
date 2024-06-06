import { handleFormSubmit } from './form-handler.js';
import { exportToExcel } from './export-handler.js';
import { productCodes, productNames, userNames } from './form-handler.js';
import { autocomplete } from './autocomplete.js';

document.getElementById('exportExcelButton').addEventListener('click', exportToExcel);

document.getElementById('productForm').addEventListener('submit', handleFormSubmit);

document.getElementById('resetProductsButton').addEventListener('click', function () {
    const password = prompt('Digite a senha para resetar os produtos:');
    if (password) {
        fetch('/resetProducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
            } else {
                alert('Erro ao resetar produtos: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

window.onload = function () {
    fetch('/getProducts')
        .then(response => response.json())
        .then(data => {
            data.forEach(produto => addProductToTable(produto));
        });

    autocomplete(document.getElementById('codigo'), productCodes);
    autocomplete(document.getElementById('produto'), productNames);
    autocomplete(document.getElementById('usuario'), userNames);
};
