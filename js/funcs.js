card2idx = {
  "2c": 1,  "2d": 2,  "2h": 3,  "2s": 4,
  "3c": 5,  "3d": 6,  "3h": 7,  "3s": 8,
  "4c": 9,  "4d": 10, "4h": 11, "4s": 12,
  "5c": 13, "5d": 14, "5h": 15, "5s": 16,
  "6c": 17, "6d": 18, "6h": 19, "6s": 20,
  "7c": 21, "7d": 22, "7h": 23, "7s": 24,
  "8c": 25, "8d": 26, "8h": 27, "8s": 28,
  "9c": 29, "9d": 30, "9h": 31, "9s": 32,
  "Tc": 33, "Td": 34, "Th": 35, "Ts": 36,
  "Jc": 37, "Jd": 38, "Jh": 39, "Js": 40,
  "Qc": 41, "Qd": 42, "Qh": 43, "Qs": 44,
  "Kc": 45, "Kd": 46, "Kh": 47, "Ks": 48,
  "Ac": 49, "Ad": 50, "Ah": 51, "As": 52
};

idx2card = {};
for (var key in card2idx) {
    if (card2idx.hasOwnProperty(key)) {           
        idx2card[card2idx[key]] = key;
    }
}

function ids2cards(ids) {
	cards = [];
	for (var i = 0; i < ids.length; i++) {
		cards[i] = idx2card[ids[i]];
	}
	return cards;
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function fill_cards(arr, num_cards, ids_left, ids_cnt) {
    cur_arr = [];
    var i = 0;
    for (; i < arr.length; i++) {
        cur_arr.push(card2idx[arr[i]]);
    }
    for (; i < num_cards; i++) {
        cur_arr.push(ids_left[ids_cnt[0]++]);
    }
	return cur_arr;
}

function calc_prob(game_info, num_samples) {
	var num_ops = parseInt(game_info["num_ops"]);
    var hand = game_info["cards_you"];
    var table = game_info["cards_table"];
    var ids_used = [];
    for (var key in game_info) {
        if (!game_info.hasOwnProperty(key)) {
            continue;
        }
        if (key === "num_ops")  {
            continue;
        }
        for (var i = 0; i < game_info[key].length; i++) {
            ids_used.push(card2idx[game_info[key][i]]);
        }
    }
    ids_used.sort(function(a, b){return a - b});
    var ids_left = [];
    var j = 0;
    for (var i = 1; i <= 52; i++) {
        if (i === ids_used[j]) {
            ++j;
            continue;
        }
        ids_left.push(i);
    }
    var num_wins = 0;
    var num_draws = 0;
  
    function map_fn(i) {
       	console.log("!"); 
		var ids_left_copy = ids_left.slice(0);
		shuffle(ids_left_copy);
        var ids_cnt = [0];
        var cur_hand = fill_cards(hand, 2, ids_left_copy, ids_cnt);
		var cur_table = fill_cards(table, 5, ids_left_copy, ids_cnt);
		var your_hand = Hand.solve(ids2cards(cur_hand.concat(cur_table)));
        var lost = 0;
        var draw = 0;
		for (var j = 1; j <= num_ops; j++) {
			var cur_op = fill_cards(game_info["cards_op" + j], 2, ids_left_copy, ids_cnt);
			var op_hand = Hand.solve(ids2cards(cur_op.concat(cur_table)));
			var winners = Hand.winners([your_hand, op_hand]);
            if (winners[0] !== your_hand) {
                lost = 1;
                break;
            }
            if (winners.length === 2) {
                draw = 1;
            }
		}
		if (lost === 1) {
            return 0;
        }
        if (draw === 1) {
            return 1;
        } else {
            return 2;
        }
    }; 
  
	function reduce_fn(d) {
        for (var i = 0; i < num_samples; ++i) { 
            if (d[i] === 0) {
                continue;
            }
            if (d[i] === 1) {
                ++num_draws;
            } else {
                ++num_wins;
            }
        }
    };

    var data = new Array(num_samples);
    for (var i = 0; i < num_samples; ++i) {
       data[i] = i;
	}

	if (false) {
		var pool = new Parallel(data, maxWorkers=12);  
		data.map(map_fn).then(reduce_fn);    
	} else {
		reduce_fn(data.map(map_fn));    
	}

    result_str = " Win: " + (100.0 * num_wins /  num_samples).toFixed(2) + "%<br>";
    result_str += "Draw: " + (100.0 * num_draws /  num_samples).toFixed(2) + "%<br>";
    result_str += "Lose: " + (100.0 - 100.0 * (num_draws + num_wins) /  num_samples).toFixed(2) + "%";
    return result_str;
}


$(function() {
    var form_elem = $('#prob-form');
    var result_field = $("#result-prob");

    $(form_elem).submit(function(event) {
        event.preventDefault();
        var form_data = $(form_elem).serializeArray();
        var cards_you = $.map($(".card-clicked"), function(elem, idx) {
            if ($($(elem).find(".card-posess")[0]).text() === "yours") {
                return $(elem).find("img").first().attr("src").split('/')[1].split('.')[0];
            }
        });
        form_data.push({name: "cards_you", value: cards_you});
        var cards_table = $.map($(".card-clicked"), function(elem, idx) {
            if ($($(elem).find(".card-posess")[0]).text() === "table") {
                return $(elem).find("img").first().attr("src").split('/')[1].split('.')[0];
            }
        });
        form_data.push({name: "cards_table", value: cards_table});        
        for (i = 1; i <= $("#opps-input").val(); i++) {
            var name = "op" + i.toString();
            var cards_op = $.map($(".card-clicked"), function(elem, idx) {
                if ($($(elem).find(".card-posess")[0]).text() === name) {
                    return $(elem).find("img").first().attr("src").split('/')[1].split('.')[0];
                }
            });
            form_data.push({name: "cards_" + name, value: cards_op});
        }
        var game_info = {};
        for (var i = 0; i < form_data.length; i++){
          game_info[form_data[i]['name']] = form_data[i]['value'];
        }
		var prob_msg = calc_prob(game_info, game_info['num_samples']);
        $(result_field).html(prob_msg);
    });
});


$("document").ready(function(){
    $(".card").click(function() {
        var posession = $("#selector").val();
        var num_clicked = 0;
        $(".card-clicked").each(function(idx)  {
            if ($($(this).find(".card-posess")[0]).text() === posession) {
                num_clicked += 1;
            }
        });
        var limit = 2;
        if (posession === "table") {
            limit = 5;
        }
        if (num_clicked < limit && $(this).hasClass("card")) {
            $(this).removeClass("card").addClass("card-clicked");
            $($(this).find(".card-posess")[0]).text(posession);
        } else {
            if ($(this).hasClass("card-clicked")) {
                $(this).removeClass("card-clicked").addClass("card");
                $($(this).find(".card-posess")[0]).text("");
            }
        }
    });
    $("#opps-input").change(function() {
        $('#selector').children().remove();
        $('#selector').append('<option value="yours">you</option>');
        $('#selector').append('<option value="table">table</option>');
        for (i = 1; i <= $(this).val(); i++) {
            var value = "op" + i.toString();
            $('#selector').append($("<option></option>").attr("value", value).text(value));
        }
    })
});
