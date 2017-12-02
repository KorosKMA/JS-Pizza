/**
 * Created by chaika on 02.02.16.
 */
var Templates = require('../Templates');
var PizzaCart = require('./PizzaCart');
var Pizza_List = require('../Pizza_List');

var API = require('../API');
 API.getPizzaList(function (err, pizza_list) {
     if(!err) {
         Pizza_List = pizza_list;
         initialiseMenu();
     }else{
         console.error(err);
     }
 });

//HTML едемент куди будуть додаватися піци
var $pizza_list = $("#pizza_list");

function showPizzaList(list) {
    //Очищаємо старі піци в кошику
    $pizza_list.html("");

    //Онволення однієї піци
    function showOnePizza(pizza) {
        var html_code = Templates.PizzaMenu_OneItem({pizza: pizza});

        var $node = $(html_code);

        $node.find(".buy-big").click(function(){
            PizzaCart.addToCart(pizza, PizzaCart.PizzaSize.Big);
        });
        $node.find(".buy-small").click(function(){
            PizzaCart.addToCart(pizza, PizzaCart.PizzaSize.Small);
        });

        $pizza_list.append($node);
    }
    $(".pizza-number-total").text(list.length);
    list.forEach(showOnePizza);
}

$(".pizza-filter-button").click(function(){
    if(!$(this).hasClass("active")){
        $(".pizza-filter-button.active").removeClass("active");
        $(this).addClass("active");
        filterPizza($(this).attr("id"));
    }
});

function filterPizza(filter) {
    //Масив куди потраплять піци які треба показати
    var pizza_shown = [];
    var pizza_type_name = "Піци";
    if (filter == "all"){
        pizza_shown = Pizza_List;
        pizza_type_name = "Усі піци";
    }
    else if(filter == "vega"){
        Pizza_List.forEach(function(pizza){
            if(pizza.type == "Вега піца")
                pizza_shown.push(pizza);
        });
        pizza_type_name = "Вегетаріанські піци";
    }
    else{
        Pizza_List.forEach(function(pizza){
            //Якщо піка відповідає фільтру
            //pizza_shown.push(pizza);

            Object.keys(pizza.content).forEach(function (item) {
                if(item == filter)
                    pizza_shown.push(pizza);
            });
        });
        switch(filter){
            case "meat": pizza_type_name = "М'ясні піци"; break;
            case "pineapple": pizza_type_name = "Піци з ананасами"; break;
            case "mushroom": pizza_type_name = "Піци з грибами";break;
            case "ocean": pizza_type_name = "Піци з морепродуктами"; break;
        }
    }
    $(".pizza-type-name").text(pizza_type_name);
    //Показати відфільтровані піци
    showPizzaList(pizza_shown);
}

function initialiseMenu() {
    //Показуємо усі піци
    showPizzaList(Pizza_List)
}

exports.filterPizza = filterPizza;
exports.initialiseMenu = initialiseMenu;