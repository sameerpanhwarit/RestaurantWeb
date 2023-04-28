const addToCartButtons = document.querySelectorAll('.book-btn');
addToCartButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const itemName = event.target.parentNode.querySelector('h3').textContent;
    const itemPrice = event.target.parentNode.querySelector('span').textContent.replace('$', '');
    const itemQuantity = event.target.parentNode.querySelector('input[name=quantity]').value;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/add-to-cart');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      console.log(xhr.responseText);
    };
    xhr.send(JSON.stringify({ name: itemName, price: itemPrice, quantity: itemQuantity }));
  });
});
