"use strict";


function in_tbl_load() {
    if(!localStorage)
        return;
    var map = JSON.parse(localStorage.values);
    for(var i in this.rows) {
        var row = this.rows[i];
        try {
            if(row.cells[1].children[0].tagName != "INPUT")
                continue;
            var key = row.cells[0].innerText;
            row.cells[1].children[0].value = map[key];
        }
        catch(e) {}
    }
}

function in_tbl_save() {
    if(!localStorage)
        return;
    var map = {};
    for(var i in this.rows) {
        var row = this.rows[i];
        try {
            if(row.cells[1].children[0].tagName != "INPUT")
                continue;
            var key = row.cells[0].innerText;
            var val = row.cells[1].children[0].value;
            map[key] = val;
        }
        catch(e) {}
    }
    localStorage.values = JSON.stringify(map);
}

function in_tbl_validate() {
    for(var i in this.rows) {
        var row = this.rows[i];
        try {
            if(row.cells[1].children[0].tagName != "INPUT")
                continue;
            var val = row.cells[1].children[0].value;
            var min = row.cells[2].innerText;
            var max = row.cells[3].innerText;
            var step = row.cells[4].innerText;
            if(isNaN(val)) {
                row.cells[1].children[0].value = min;
                continue;
            }
            val = parseFloat(val);
        }
        catch(e) {}
    }
}

function in_tbl_calc(out_id) {
	var a = this.rows[1].cells[1].children[0].value;
	var b = this.rows[2].cells[1].children[0].value;
	var c = this.rows[3].cells[1].children[0].value;
	var gen_count = this.rows[4].cells[1].children[0].value;
	var pop_count = this.rows[5].cells[1].children[0].value;
}

function cmd_evol() {
    inTbl.save();
	inTbl.calc("out");
}


window.onload = function() {
	inTbl.load = in_tbl_load;
	inTbl.save = in_tbl_save;
	inTbl.validate = in_tbl_validate;
	inTbl.calc = in_tbl_calc;
    inTbl.load();
}

