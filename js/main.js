var $window = $(window);
var $root = $('html, body');
var $machine = $('.machine');
var $shelves = $('.shelves');
var $selection = $('.selection');
var $coins = $('.coins');
var $form = $('form');
var $input_selection = $form.find('[name="selection"]');
var $input_coinage = $form.find('[name="coinage"]');
var $tray = $('.tray');
var $return = $('.coin_return');

var stock = [
  {
    cat: 'F',
    name: 'Apple',
    price: 40,
    count: 1
  },
  {
    cat: 'F',
    name: 'Banana',
    price: 30,
    count: 10
  },
  {
    cat: 'F',
    name: 'Watermelon',
    price: 80,
    count: 12
  },
  {
    cat: 'P',
    name: 'Red Salted',
    price: 60,
    count: 8
  },
  {
    cat: 'P',
    name: 'Salty Vinegar',
    price: 60,
    count: 1
  },
  {
    cat: 'P',
    name: 'Cheese in Onion',
    price: 60,
    count: 20
  },
  {
    cat: 'S',
    name: 'Kola',
    price: 90,
    count: 12
  },
  {
    cat: 'S',
    name: 'Diet',
    price: 90,
    count: 10
  },
  {
    cat: 'S',
    name: 'Zero',
    price: 90,
    count: 12
  },
];

var cats = {};
$.each(stock, function(i, item) {
  cats[item.cat] ? cats[item.cat]++ : cats[item.cat] = 1;

  var $shelf = $('<div>')
  	.addClass('shelf')
    .attr('data-item', item.name.toLowerCase().replace(/\s+/g, '_'))
  	.attr('data-cat', item.cat)
  	.attr('data-num', cats[item.cat])
  	.attr('data-price', item.price)
  	.attr('data-stock', item.count)
  	.appendTo($shelves);

	var $item = $('<div>')
  	.addClass('item')
  	.attr('data-item', item.name.toLowerCase().replace(/\s+/g, '_'))
  	.attr('data-cat', item.cat)
  	.attr('data-num', cats[item.cat])
  	.attr('data-price', item.price)
  	.attr('data-stock', item.count)
  	.appendTo($shelf);

    var $details = $('<div>').addClass('detail').appendTo($shelf);
	$('<h3>').text(item.name).appendTo($details);
    $('<span>').addClass('code').text('' + item.cat + cats[item.cat]).appendTo($details);
    $('<span>').addClass('price').text(item.price).appendTo($details);
    $('<span>').addClass('in-stock').text('(' + item.count + ')').appendTo($details);
});

$selection.find('a').click(function() {
    var $selected = $(this);
    var value = $selected.text();
    var current = $input_selection.val();
    var prev = $selection.find('.active');

    $machine.removeClass('vending');
    $tray.empty();
    $return.empty();
    
    if (!prev.length) {
        $selected.addClass('active');
        $input_selection.val(value);
    }
  
    if (prev.length === 1) {
        if (isNaN(prev.first().text()) && !isNaN(value)) {
            $selected.addClass('active');
            $input_selection.val(current + value);
        } 
        if (!isNaN(prev.first().text()) && isNaN(value)) {
            $selected.addClass('active');
            $input_selection.val(value + current);
        }
    }
  
    if (prev.length === 2) {
        $selection.find('a').removeClass('active');
        $input_selection.val('');
        $selected.addClass('active');
        $input_selection.val(value);
    }
});

$coins.find('a').click(function() {
    var $coin = $(this);
    var slot_class = 'slotting';
    var value = parseInt($coin.attr('data-coin'));

    $machine.removeClass('vending');
    $tray.empty();
    $return.empty();
    $coin.addClass(slot_class);
    $coin.bind('webkitAnimationEnd mozAnimationEnd animationEnd', function(){
        $coin.removeClass(slot_class);
    });
    
    coinage = parseInt($input_coinage.val().replace('.', ''));
    new_coin = (coinage ? coinage : 0) + value;
    $input_coinage.val((new_coin/100).toFixed(2));
});

$(document).delegate( '.tray .item', 'click', function() {
    $('.tray').addClass('close-t');
    $(this).remove();
    if($('.coin_return').html() == ''){
        $('#res-box div').html('');
    }
});

$(document).delegate( '.coin_return', 'click', function() {
    $(this).addClass('close-t');
    $('.coin_return .coin').remove();
    if($('.tray').html() == ''){
        $('#res-box div').html('');
    }
});

$form.submit(function(e) {
    e.preventDefault();

    var code = $input_selection.val().toUpperCase();
    var item = $('.shelf[data-cat="' + code[0] + '"][data-num="' + code[1] + '"]');
    var price = (parseInt(item.attr('data-price')) / 100);
    var coins = parseFloat($input_coinage.val());
    
    if(item.find('.item').attr('data-stock') != 0) {
        if($('.tray').hasClass('close-t')){
            $('.tray').removeClass('close-t'); 
        }
        if($('.coin_return').hasClass('close-t')){
            $('.coin_return').removeClass('close-t'); 
        }
        if (!item.length) {
            $input_selection.addClass('invalid');
            setTimeout(function() {
            $input_selection.removeClass('invalid').val('');
            }, 800);
            return;
        }
        
        if (coins < price) {
            $input_coinage.addClass('invalid');
            setTimeout(function() {
            $input_coinage.removeClass('invalid');
            }, 800);
        } else {
            var change = (coins - price);
            var change_returned = parseFloat(change.toFixed(1));
            
            $selection.find('a').removeClass('active');
            $input_selection.val('');
            $input_coinage.val('');
            
            item.find('.item').first().clone().appendTo($tray);

            //stock
            console.log(stock);
            var set = item.find('.item').attr('data-stock');
            var dataNum = item.find('.item').attr('data-num');
            set = parseInt(set) - 1;
            item.find('.item').attr('data-stock', set);
            dataNum = dataNum = parseInt(set) - 1;
            stock[0].count = set;
            item.find('.in-stock').text(set);
            if(set == 0){
                item.find('.item').css('background-image', 'unset');
            }
            
            $('#res-box div').html('<p class="succ">Please pick up the product and return change</p>');

            if (change_returned  / .5 >= 1) {
                var fifties = parseInt(change_returned / .5);
                change_returned -= (fifties * 0.5);
                for (var i = 0; i < fifties; i++) {
                    $coins.find('.coin:eq(0)').clone().appendTo($return);
                }
                change_returned = parseFloat(change_returned.toFixed(1));
            }
    
            if (change_returned  / .2 >= 1) {
                var twenties = parseInt(change_returned / .2);
                change_returned -= (twenties * 0.2);
                for (var i = 0; i < twenties; i++) {
                    $coins.find('.coin:eq(1)').clone().appendTo($return);
                }
                change_returned = parseFloat(change_returned.toFixed(1));
            }
  
            if (change_returned  / .1 >= 1) {
                var tens = parseInt(change_returned / .1);
                change_returned -= (tens * 0.1);
                for (var i = 0; i < tens; i++) {
                    $coins.find('.coin:eq(2)').clone().appendTo($return);
                }
            }
 
            var pieces = $return.find('.coin');
            if (pieces.length) {
                pieces.each(function(i) {
                    var pos = i + 1;
                    $(this).css('left', ((-50 * (1/pieces.length)) * (((pieces.length / 2) + 0.5) - (pos))) + '%');
                });
            }
            
            setTimeout(function() { $machine.addClass('vending'); }, 10);
        }
    } else {
        $('#res-box div').html('<p class="err">Out of stock !!</p>');
    }
});