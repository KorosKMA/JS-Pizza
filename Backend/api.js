/**
 * Created by chaika on 09.02.16.
 */
var Pizza_List = require('./data/Pizza_List');

exports.getPizzaList = function(req, res) {
    res.send(Pizza_List);
};

exports.createOrder = function(req, res) {
    var order_info = req.body;
    var order_description = getDescription(order_info);
    console.log("Creating Order\n", order_description);
    var order = {
        version: 3,
        public_key: LIQPAY_PUBLIC_KEY,
        action: "pay",
        amount: order_info.total,
        currency: "UAH",
        description: order_description,
        order_id: Math.random(),
//!!!Важливо щоб було 1,	бо інакше візьме гроші!!!
        sandbox: 1
    };
    var data = base64(JSON.stringify(order));
    var signature = sha1(LIQPAY_PRIVATE_KEY + data + LIQPAY_PRIVATE_KEY);

    res.send({
        success: true,
        data: data,
        signature: signature
    });
};

function getDescription(order_info) {
    var description = "Замовлення піци: ";
    description += order_info.name + "\n";
    description += "Адреса доставки: ";
    description += order_info.address + "\n";
    description += "Телефон: ";
    description += order_info.phone_number + "\n";
    description += "Замовлення:\n";
    order_info.order.forEach(function(item){
        description += "- ";
        description += item.quantity + "шт. ";
        if(item.size == "big_size")
            description += "[Велика] ";
        else
            description += "[Мала] ";
        description += item.pizza.title + "\n";
    });
    description += "\nРазом: ";
    description += order_info.total + "грн";
    return description;
}

var LIQPAY_PUBLIC_KEY = "i5664594128";
var LIQPAY_PRIVATE_KEY = "private_key_here"; //without private key LiqPay won't work

function base64(str){
    return new Buffer(str).toString('base64');
}

var crypto = require('crypto');
function sha1(string)	{
    var sha1 = crypto.createHash('sha1');
    sha1.update(string);
    return sha1.digest('base64');
}