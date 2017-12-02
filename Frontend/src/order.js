/**
 * Created by Administrator on 08.05.2017.
 */
var API = require("./API");

if(window.location.href == API.API_URL + "/order.html"){


    var $name_input = $("#inputName");
    var $name_form = $("#formName");
    var $phone_number_input = $("#inputPhone");
    var $phone_number_form = $("#formPhone");
    var $address_input = $("#inputAdress");
    var $address_form = $("#formAdress");

    var $submit_button = $(".button-continue");


    $(".button-edit").click(function(){
        window.location.href='/index.html';
    });/**/

    $name_input.keypress(function (e) {
        if(validateName(e) && e.keyCode == 13){
            $phone_number_input.focus();
        }
    });

    $phone_number_input.keypress(function (e) {
        if(validatePhoneNumber(e) && e.keyCode == 13){
            $address_input.focus();
        }
    });

    $address_input.keypress(function (e) {
        if(validateAddress(e) && e.keyCode == 13){
            $submit_button.click();
        }
    });

    $submit_button.click(function () {
        var e = {
            keyCode: 13
        };
        if(validateName(e) & validatePhoneNumber(e) & validateAddress(e)){
            API.createOrder({
                name: $name_input.val(),
                phone_number: $phone_number_input.val(),
                address: $address_input.val(),
                order: require("./pizza/PizzaCart").getPizzaInCart(),
                total: parseFloat($(".sum-number").text())
            }, function (err, server_data) {
                if(err){
                    console.log(err);
                }else{
                    LiqPayCheckout.init({
                        data: server_data.data,
                        signature: server_data.signature,
                        embedTo: "#liqpay",
                        mode: "popup"	//	embed	||	popup
                    }).on("liqpay.callback",	function(data){
                        console.log(data.status);
                        console.log(data);
                    }).on("liqpay.ready",	function(data){
                        //	ready
                    }).on("liqpay.close",	function(data){
                        //	close
                    });
                }
            });
        }
    });

    function validateName(e) {
        var val = e.keyCode == 13 ? $name_input.val() : $name_input.val() + String.fromCharCode(e.keyCode);
        if(val.length == 0){
            deny($name_form);
            return false;
        }
        for(var i=0, char=val.charAt(i); i<val.length; ++i, char=val.charAt(i)){
            if(!( (char>='a' && char<='z') || (char>='A' && char<='Z') || (char>='а' && char<='я') || (char>='А' && char<='Я') || (char=='\'') || (char==' ') || (char=='і') || (char=='ї') || (char=='І') || (char=='Ї') || (char=='є') || (char=='Є') || (char=='ґ') || (char=='Ґ') )) {
                deny($name_form);
                return false;
            }
        }
        grant($name_form);
        return true;
    }

    function validatePhoneNumber(e){
        var val = e.keyCode == 13 ? $phone_number_input.val() : $phone_number_input.val() + String.fromCharCode(e.keyCode);
        if(val.length == 0){
            deny($phone_number_form);
            return false;
        }
        if(val.charAt(0) == '0'){
            if(val.length != 10){
                deny($phone_number_form);
                return false;
            }{
                for(var i=0, char=val.charAt(i); i<val.length; ++i, char=val.charAt(i)) {
                    if(!( char>='0' && char<='9' )){
                        deny($phone_number_form);
                        return false;
                    }
                }
                grant($phone_number_form);
                return true;
            }
        }else if(val.charAt(0) == '+'){
            if(val.length != 13){
                deny($phone_number_form);
                return false;
            }else{
                if(val.slice(1, 4) != '380'){
                    deny($phone_number_form);
                    return false;
                }
                for(var i=4, char=val.charAt(i); i<val.length; ++i, char=val.charAt(i)) {
                    if(!( char>='0' && char<='9' )){
                        deny($phone_number_form);
                        return false;
                    }
                }
                grant($phone_number_form);
                return true;
            }
        }else{
            deny($phone_number_form);
            return false;
        }
    }

    function validateAddress(e) {
        var val = e.keyCode == 13 ? $address_input.val() : $address_input.val() + String.fromCharCode(e.keyCode);
        if(val.length == 0){
            deny($address_form);
            return false;
        }
        var denied = false;
        geocodeAddress(val, function(err, coordinates){
            if(err){
                denied = true;
            }else{
                showRoute(val, coordinates);
            }
        });
        if(denied){
            deny($address_form);
            return false;
        }
        grant($address_form);
        return true;
    }

    function deny(form){
        form.removeClass("has-success");
        form.addClass("has-error");
        form.find(".help-block").removeClass("hidden");
        if(form === $address_form){
            $(".time-info").text("невідомий");
            $(".address-info").text("невідома");
        }
    }

    function grant(form){
        form.removeClass("has-error");
        form.addClass("has-success");
        form.find(".help-block").addClass("hidden");
    }

    var default_location = new google.maps.LatLng(50.464379,30.519131);
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var default_location_marker	=	new	google.maps.Marker({
        position:	default_location,
        //map - це змінна карти створена за допомогою new google.maps.Map(...)
        icon:	"assets/images/map-icon.png",
        animation: google.maps.Animation.DROP,
        draggable:true
    });
    var destination_marker	=	new	google.maps.Marker({
        icon:	"assets/images/home-icon.png",
        animation: google.maps.Animation.DROP,
        draggable:false
    });

    function	initialize()	{
        //Тут починаємо працювати з картою
        var mapProp =	{
            center:	default_location,
            zoom: 13
        };
        var html_element =	document.getElementById("googleMap");
        var map	=	new	google.maps.Map(html_element, mapProp);
        //Карта створена і показана

        default_location_marker.setMap(map);
        destination_marker.setMap(map);
        destination_marker.setVisible(false);

        directionsDisplay.setMap(map);
        directionsDisplay.setOptions({suppressMarkers: true});

        google.maps.event.addListener(map, 'click', function(me){
            var coordinates	=	me.latLng;
            geocodeLatLng(coordinates,	function(err, address){
                if(!err) {
                    //Дізналися адресу
                    $address_input.val(address);
                    showRoute(address, coordinates);
                } else {
                    console.log("Can't find address");
                }
            });
        });
    }

    function geocodeLatLng(latlng, callback){
        //Модуль за роботу з адресою
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({'location': latlng}, function(results, status) {
            if	(status	===	google.maps.GeocoderStatus.OK&&	results[1]) {
                var address = results[1].formatted_address;
                callback(null, address);
            } else {
                callback(new Error("Can't find address"));
            }
        });
    }

    function	geocodeAddress(address,	 callback)	{
        var geocoder	=	new	google.maps.Geocoder();
        geocoder.geocode({'address':	address},	function(results,	status)	{
            if	(status	===	google.maps.GeocoderStatus.OK&&	results[0])	{
                var coordinates	=	results[0].geometry.location;
                callback(null, coordinates);
            }	else	{
                callback(new Error("Can not find the address"));
            }
        });
    }

    function calculateAndDisplayRoute(A_latlng, B_latlng, callback)	{
        var directionService = new google.maps.DirectionsService();
        directionService.route({
            origin: A_latlng,
            destination: B_latlng,
            travelMode: google.maps.TravelMode["DRIVING"]
        }, function(response, status)	{
            if ( status == google.maps.DirectionsStatus.OK ) {
                var leg = response.routes[ 0 ].legs[ 0 ];
                directionsDisplay.setDirections(response);
                default_location_marker.setPosition(A_latlng);
                default_location_marker.setDraggable(false);
                destination_marker.setVisible(true);
                destination_marker.setPosition(B_latlng);
                callback(null, {
                    duration: leg.duration
                });
            } else {
                callback(new Error("Can' not find direction"));
            }
        });
    }

    function showRoute(address, coordinates){
        calculateAndDisplayRoute(default_location, coordinates, function(err, duration){
            if(!err) {
                $(".time-info").text(duration.duration.text);
                $(".address-info").text(address);
            }else{
                deny($address_form);
                console.log("Can't calculate route");
            }
        });
    }

//Коли сторінка завантажилась
    google.maps.event.addDomListener(window, 'load', initialize);

}