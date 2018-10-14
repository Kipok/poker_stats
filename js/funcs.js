$(function() {
    var form_elem = $('#prob-form');
    var result_field = $("#result-prob");

    $(form_elem).submit(function(event) {
        $(result_field).text("...Processing...");
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

        var num_workers = game_info["num_workers"];
        var num_samples = game_info["num_samples"];
        var promises = [];
        for (var i = 0; i < num_workers; i++) {
            promises.push(new Promise(function (fulfill, reject) {
                var worker = new Worker('js/worker.js');
                worker.onmessage = function(event) {
                    fulfill(event.data);
                };
                worker.onerror = function(event) {
                    reject(event.error);
                };
                worker.postMessage({game_info: game_info, num_samples: Math.floor(num_samples / num_workers)});
            }));
        }

        Promise.all(promises)
            .then(function(data) {
                var num_wins = 0, num_draws = 0;
                var actual_num_samples = Math.floor(num_samples / num_workers) * num_workers;
                for (var i = 0; i < data.length; i++) {
                    num_wins += data[i][0];
                    num_draws += data[i][1];
                }
                prob_str = " Win: " + (100.0 * num_wins /  actual_num_samples).toFixed(2) + "%<br>";
                prob_str += "Draw: " + (100.0 * num_draws /  actual_num_samples).toFixed(2) + "%<br>";
                prob_str += "Lose: " + (100.0 - 100.0 * (num_draws + num_wins) /  actual_num_samples).toFixed(2) + "%";
                $(result_field).html(prob_str);
            })
            .catch(function(error) {
                console.log(error);
            });        
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
