let iconCart = document.querySelector('.icon-cart');
let body = document.querySelector('body');
let closeCart = document.querySelector('.close');
let checkOut = document.querySelector('.checkOut');
let listProductHTML = document.querySelector('.product-list');
let listCartHTML = document.querySelector('.listCart');
let iconCartSpan = document.querySelector('.icon-cart span');
let cartHeader = document.querySelector('.cart-header');
let totalLabel = document.querySelector('.total-label');
let transaction = document.querySelector('.transaction-btn');

let listProducts = [];
let carts = [];

const addDataToHTML = () =>
{
    listProductHTML.innerHTML = '';
    if(listProducts.length > 0)
    {
        listProducts.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('product');
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
            <figure class="figure">
                <img src="${product.image}" class="figure-img img-fluid rounded">
                <figcaption class="figure-caption text-center"><div class="stock">STOCK: ${product.stock}</div><div class="price">$${product.price}</div></figcaption>
            </figure>
            `;
            listProductHTML.appendChild(newProduct);
        })
    }
}

if(document.body.classList.contains('home')) {
    listProductHTML.addEventListener('click', (event) => 
    {
        let positionClick = event.target;
        if(positionClick.classList.contains('figure-img')){
            let product_id = positionClick.parentElement.parentElement.dataset.id;
            addToCart(product_id);
            body.classList.add('showCart');
        }
    })
    iconCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    })
    closeCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    })
    checkOut.addEventListener('click', () => {
        location.href = "/checkout"; // New redirection using Flask route
    });
}

const addToCart = (product_id) => 
{
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
    if(carts.length <= 0){
        carts = [{
            product_id: product_id,
            quantity: 1
        }]
    }
    else if(positionThisProductInCart < 0)
    {
        carts.push({
            product_id: product_id,
            quantity: 1
        })
    }
    else
    {
        carts[positionThisProductInCart].quantity = carts[positionThisProductInCart].quantity + 1;
    }
    addCartToHTML();
    addCartToMemory();
}

const addCartToMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
}

const addCartToHTML = () => 
{
    listCartHTML.innerHTML = '';
    let totalQuantity = 0;
    let totalPrice = 0;
    if(carts.length > 0)
    {
        carts.forEach(cart => {
            totalQuantity = totalQuantity + cart.quantity;
            let newCart = document.createElement('div');
            newCart.classList.add('product');
            newCart.dataset.id = cart.product_id;
            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            let info = listProducts[positionProduct];
            totalPrice = totalPrice + info.price * cart.quantity;
            newCart.innerHTML = `
                <div class="product-image">
                    <img src="${info.image}">
                </div>
                <div class="name">
                    ${info.name}
                </div>
                <div class="totalPrice">
                    $${info.price}
                </div>
                <div class="quantity">
                    <span class="minus"><</span>
                    <span>${cart.quantity}</span>
                    <span class="plus">></span>
                </div>
                `;
            listCartHTML.appendChild(newCart);
        })
    }
    iconCartSpan.innerText = totalQuantity;
    cartHeader.innerText = `YOUR ORDER (${totalQuantity})`;
    totalLabel.innerText = `TOTAL PRICE: $${totalPrice}`;
}

listCartHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus'))
    {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = 'minus';
        if (positionClick.classList.contains('plus'))
        {
            type = 'plus';
        }
        changeQuantity(product_id, type);
    }
})

const changeQuantity = (product_id, type) => 
{
    let positionItemInCart = carts.findIndex((value) => value.product_id == product_id)
    if (positionItemInCart >= 0)
    {
        switch (type) 
        {
            case 'plus':
                carts[positionItemInCart].quantity = carts[positionItemInCart].quantity + 1;
                break;
            
            default:
                let valueChange = carts[positionItemInCart].quantity - 1;
                if (valueChange > 0) 
                {
                    carts[positionItemInCart].quantity = valueChange;
                }
                else
                {
                    carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToMemory();
    addCartToHTML();
}

if(window.location.pathname == '/bag') {
    transaction.addEventListener('click', function() {
        console.log('Cart:', carts);
        fetch('/stock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(carts)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data); // Log the response from the server
            carts = [];
            addCartToMemory();
            addCartToHTML();

        })
        .catch((error) => {
            console.error('Error:', error);
        });
    })
}


const initApp = () =>
{
    fetch('../static/products.json')
    .then(response => response.json())
    .then(data => 
        {
            listProducts = data;
            if(document.body.classList.contains('home')) {
                addDataToHTML();
            }
            // gets cart from memory
            if (localStorage.getItem('cart'))
            {
                carts = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }
        }
    )
}
initApp();