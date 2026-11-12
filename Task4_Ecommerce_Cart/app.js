
var apiUrl = "https://fakestoreapi.com/products";

var products = [];
var cart = JSON.parse(localStorage.getItem("shopEaseCart")) || [];

var productsContainer = document.getElementById("productsContainer");
var searchInput = document.getElementById("searchInput");
var categoryFilter = document.getElementById("categoryFilter");
var sortFilter = document.getElementById("sortFilter");
var productCount = document.getElementById("productCount");
var message = document.getElementById("message");

var cartButton = document.getElementById("cartButton");
var cartOverlay = document.getElementById("cartOverlay");
var closeCart = document.getElementById("closeCart");
var cartItems = document.getElementById("cartItems");
var cartCount = document.getElementById("cartCount");

var subtotalElement = document.getElementById("subtotal");
var taxElement = document.getElementById("tax");
var shippingElement = document.getElementById("shipping");
var totalElement = document.getElementById("total");

var checkoutButton = document.getElementById("checkoutButton");
var checkoutOverlay = document.getElementById("checkoutOverlay");
var closeCheckout = document.getElementById("closeCheckout");
var checkoutForm = document.getElementById("checkoutForm");
var checkoutMessage = document.getElementById("checkoutMessage");

function formatPrice(amount) {
    return "$" + amount.toFixed(2);
}

async function loadProducts() {

    productsContainer.textContent = "Loading products...";
    message.textContent = "";

    try {

        var response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Unable to load products.");
        }

        products = await response.json();

        loadCategories();
        displayProducts(products);

    }
    catch (error) {

        productsContainer.textContent = "";
        message.textContent =
            "Products could not be loaded. Please check your internet connection.";

        productCount.textContent = "No products available";

    }
}

function loadCategories() {

    var categories = [];

    products.forEach(function (product) {

        if (!categories.includes(product.category)) {
            categories.push(product.category);
        }

    });

    categories.forEach(function (category) {

        var option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);

    });
}

function displayProducts(productList) {

    productsContainer.innerHTML = "";

    productCount.textContent =
        productList.length + " Products Found";

    if (productList.length === 0) {

        productsContainer.textContent = "No products found.";
        return;

    }

    productList.forEach(function (product) {

        var card = document.createElement("div");
        card.className = "product-card";

        var imageBox = document.createElement("div");
        imageBox.className = "product-image";

        var image = document.createElement("img");
        image.src = product.image;
        image.alt = product.title;
        image.loading = "lazy";

        imageBox.appendChild(image);

        var category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        var title = document.createElement("h3");
        title.textContent = product.title;

        var rating = document.createElement("p");
        rating.className = "product-rating";
        rating.textContent =
            "★ " + product.rating.rate + " (" +
            product.rating.count + " reviews)";

        var price = document.createElement("p");
        price.className = "product-price";
        price.textContent = formatPrice(product.price);

        var button = document.createElement("button");
        button.className = "add-button";
        button.textContent = "Add to Cart";

        button.addEventListener("click", function () {
            addToCart(product.id);
        });

        card.appendChild(imageBox);
        card.appendChild(category);
        card.appendChild(title);
        card.appendChild(rating);
        card.appendChild(price);
        card.appendChild(button);

        productsContainer.appendChild(card);

    });
}

function filterProducts() {

    var searchText = searchInput.value.toLowerCase();
    var selectedCategory = categoryFilter.value;
    var sortValue = sortFilter.value;

    var filteredProducts = products.filter(function (product) {

        var matchesSearch =
            product.title.toLowerCase().includes(searchText);

        var matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesSearch && matchesCategory;

    });

    if (sortValue === "low") {

        filteredProducts.sort(function (a, b) {
            return a.price - b.price;
        });

    }
    else if (sortValue === "high") {

        filteredProducts.sort(function (a, b) {
            return b.price - a.price;
        });

    }
    else if (sortValue === "rating") {

        filteredProducts.sort(function (a, b) {
            return b.rating.rate - a.rating.rate;
        });

    }

    displayProducts(filteredProducts);
}

function saveCart() {

    localStorage.setItem("shopEaseCart", JSON.stringify(cart));

    updateCart();

}

function addToCart(productId) {

    var existingItem = cart.find(function (item) {
        return item.id === productId;
    });

    if (existingItem) {

        existingItem.quantity++;

    }
    else {

        var product = products.find(function (item) {
            return item.id === productId;
        });

        if (product) {

            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });

        }

    }

    saveCart();

    message.textContent = "Product added to cart.";

}

function updateCart() {

    cartItems.innerHTML = "";

    var totalItems = 0;
    var subtotal = 0;

    cart.forEach(function (item) {

        totalItems += item.quantity;
        subtotal += item.price * item.quantity;

        var itemBox = document.createElement("div");
        itemBox.className = "cart-item";

        var image = document.createElement("img");
        image.src = item.image;
        image.alt = item.title;

        var info = document.createElement("div");
        info.className = "cart-item-info";

        var title = document.createElement("h4");
        title.textContent = item.title;

        var price = document.createElement("p");
        price.textContent = formatPrice(item.price * item.quantity);

        var controls = document.createElement("div");
        controls.className = "quantity-controls";

        var decreaseButton = document.createElement("button");
        decreaseButton.textContent = "-";

        decreaseButton.addEventListener("click", function () {
            changeQuantity(item.id, -1);
        });

        var quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        var increaseButton = document.createElement("button");
        increaseButton.textContent = "+";

        increaseButton.addEventListener("click", function () {
            changeQuantity(item.id, 1);
        });

        controls.appendChild(decreaseButton);
        controls.appendChild(quantity);
        controls.appendChild(increaseButton);

        var removeButton = document.createElement("button");
        removeButton.className = "remove-button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", function () {
            removeFromCart(item.id);
        });

        info.appendChild(title);
        info.appendChild(price);
        info.appendChild(controls);
        info.appendChild(removeButton);

        itemBox.appendChild(image);
        itemBox.appendChild(info);

        cartItems.appendChild(itemBox);

    });

    if (cart.length === 0) {

        cartItems.textContent = "Your cart is empty.";

    }

    var tax = subtotal * 0.05;

    var shipping = 0;

    if (subtotal > 0 && subtotal < 100) {
        shipping = 10;
    }

    var total = subtotal + tax + shipping;

    cartCount.textContent = totalItems;

    subtotalElement.textContent = formatPrice(subtotal);
    taxElement.textContent = formatPrice(tax);
    shippingElement.textContent = formatPrice(shipping);
    totalElement.textContent = formatPrice(total);

    checkoutButton.disabled = cart.length === 0;

    checkoutButton.style.opacity =
        cart.length === 0 ? "0.5" : "1";

}

function changeQuantity(productId, amount) {

    var item = cart.find(function (product) {
        return product.id === productId;
    });

    if (!item) {
        return;
    }

    item.quantity += amount;

    if (item.quantity <= 0) {

        removeFromCart(productId);

    }
    else {

        saveCart();

    }
}

function removeFromCart(productId) {

    cart = cart.filter(function (item) {
        return item.id !== productId;
    });

    saveCart();

}

cartButton.addEventListener("click", function () {

    cartOverlay.classList.add("active");

});

closeCart.addEventListener("click", function () {

    cartOverlay.classList.remove("active");

});

cartOverlay.addEventListener("click", function (event) {

    if (event.target === cartOverlay) {
        cartOverlay.classList.remove("active");
    }

});

searchInput.addEventListener("input", filterProducts);

categoryFilter.addEventListener("change", filterProducts);

sortFilter.addEventListener("change", filterProducts);

checkoutButton.addEventListener("click", function () {

    if (cart.length === 0) {
        return;
    }

    checkoutMessage.textContent = "";
    checkoutOverlay.classList.add("active");

});

closeCheckout.addEventListener("click", function () {

    checkoutOverlay.classList.remove("active");

});

checkoutOverlay.addEventListener("click", function (event) {

    if (event.target === checkoutOverlay) {
        checkoutOverlay.classList.remove("active");
    }

});

checkoutForm.addEventListener("submit", function (event) {

    event.preventDefault();

    if (cart.length === 0) {
        checkoutMessage.textContent = "Your cart is empty.";
        return;
    }

    var name = document.getElementById("customerName").value.trim();

    checkoutMessage.textContent =
        "Thank you, " + name + "! Your demo order has been placed.";

    cart = [];

    saveCart();

    checkoutForm.reset();

    setTimeout(function () {

        checkoutOverlay.classList.remove("active");
        cartOverlay.classList.remove("active");
        checkoutMessage.textContent = "";

    }, 2500);

});

updateCart();
loadProducts();
