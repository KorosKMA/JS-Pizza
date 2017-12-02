/**
 * Created by chaika on 02.02.16.
 */
var Templates = require('../Templates');
var API = require('../API');

//Перелік розмірів піци
var PizzaSize = {
    Big: "big_size",
    Small: "small_size"
};

//Змінна в якій зберігаються перелік піц в кошику
var Cart = [];

//HTML едемент куди будуть додаватися піци
var $cart_container = $("#cart");
var $cart = $cart_container.find('.order-box');
var $sum = $(".sum");
var $order_button = $(".button-order");
var ordered = false;

$(".clear-orders-button").click(function(){
    Cart.length = 0;
    updateCart();
});

$(".button-order").click(function(){
    window.location.href='/order.html';
});/**/

function addToCart(pizza, size) {
    //Додавання однієї піци в кошик покупок
    var new_pizza = $.grep(Cart, function(item){
        return JSON.stringify(item.pizza) === JSON.stringify(pizza) && item.size === size;
    });
    if(new_pizza.length > 0)
        new_pizza[0].quantity += 1;
    else

    //Приклад реалізації, можна робити будь-яким іншим способом
        Cart.push({
            pizza: pizza,
            size: size,
            quantity: 1
        });

    //Оновити вміст кошика на сторінці
    updateCart();
}

function removeFromCart(cart_item) {
    //Видалити піцу з кошика
    Cart.splice(Cart.indexOf(cart_item), 1);
    //Після видалення оновити відображення
    updateCart();
}

function initialiseCart() {
    //Фукнція віпрацьвуватиме при завантаженні сторінки
    //Тут можна наприклад, зчитати вміст корзини який збережено в Local Storage то показати його
    var _cart = parseInt(localStorage.getItem("length"), 10);
    for(var i=0; i<_cart; ++i){
        Cart.push(JSON.parse(localStorage[i]));
    }
    ordered = (window.location.href == API.API_URL + "/order.html");
    updateCart();
}

function getPizzaInCart() {
    //Повертає піци які зберігаються в кошику
    return Cart;
}

function updateCart() {
    //Функція викликається при зміні вмісту кошика
    //Тут можна наприклад показати оновлений кошик на екрані та зберегти вміт кошика в Local Storage

    //Очищаємо старі піци в кошику
    $cart.html("");

    //Онволення однієї піци
    function showOnePizzaInCart(cart_item) {
        var html_code = ordered ? Templates.PizzaCart_OneItem_Ordered(cart_item) : Templates.PizzaCart_OneItem(cart_item);

        var $node = $(html_code);
        $node.find(".price").text((cart_item.quantity * cart_item.pizza[cart_item.size].price) + "грн");

        $node.find(".plus").click(function(){
            //Збільшуємо кількість замовлених піц
            cart_item.quantity += 1;

            //Оновлюємо відображення
            updateCart();
        });

        $node.find(".minus").click(function(){
            if(--cart_item.quantity <= 0)
                removeFromCart(cart_item);
            else

            //Оновлюємо відображення
                updateCart();
        });

        $node.find(".count-clear").click(function(){
            removeFromCart(cart_item);
        });

        $cart.append($node);
    }

    $(".num-of-orders-circle").text(Cart.length);

    var sum = 0;
    Cart.forEach(function(item, i){
        sum+= item.quantity * item.pizza[item.size].price;
        localStorage.setItem(i, JSON.stringify(item));
    });
    localStorage.setItem("length", Cart.length);

    $sum.find(".sum-number").text(sum+"грн");

    if(Cart.length == 0){
        $cart_container.css("padding-bottom", "0px");
        $sum.addClass("hidden");
        $order_button.prop("disabled", true);
        $cart.append($('<div class="empty-cart-text">Пусто в холодильнику?<br>Замовте піцу!</div>'));
    }else {
        $cart_container.css("padding-bottom", "23px");
        $sum.removeClass("hidden");
        $order_button.prop("disabled", false);
        Cart.forEach(showOnePizzaInCart);
    }
}

exports.removeFromCart = removeFromCart;
exports.addToCart = addToCart;

exports.getPizzaInCart = getPizzaInCart;
exports.initialiseCart = initialiseCart;

exports.PizzaSize = PizzaSize;