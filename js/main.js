var _0x3ce4=["\x23\x64\x74\x42\x61\x73\x69\x63\x45\x78\x61\x6D\x70\x6C\x65","\x62\x73\x2D\x73\x65\x6C\x65\x63\x74","\x61\x64\x64\x43\x6C\x61\x73\x73","\x2E\x64\x61\x74\x61\x54\x61\x62\x6C\x65\x73\x5F\x6C\x65\x6E\x67\x74\x68","\x68\x74\x74\x70\x73\x3A\x2F\x2F\x61\x70\x69\x2E\x72\x6F\x6F\x74\x6E\x65\x74\x2E\x69\x6E\x2F\x63\x6F\x76\x69\x64\x31\x39\x2D\x69\x6E\x2F\x73\x74\x61\x74\x73\x2F\x6C\x61\x74\x65\x73\x74","\x6C\x6F\x67","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x74\x6F\x74\x61\x6C\x5F\x63\x61\x73\x65\x73","\x67\x65\x74\x45\x6C\x65\x6D\x65\x6E\x74\x42\x79\x49\x64","\x74\x6F\x74\x61\x6C","\x73\x75\x6D\x6D\x61\x72\x79","\x64\x61\x74\x61","\x69\x6E\x64\x69\x61\x6E\x73","\x63\x6F\x6E\x66\x69\x72\x6D\x65\x64\x43\x61\x73\x65\x73\x49\x6E\x64\x69\x61\x6E","\x66\x6F\x72\x65\x69\x67\x6E\x65\x72\x73","\x63\x6F\x6E\x66\x69\x72\x6D\x65\x64\x43\x61\x73\x65\x73\x46\x6F\x72\x65\x69\x67\x6E","\x63\x75\x72\x65\x64","\x64\x69\x73\x63\x68\x61\x72\x67\x65\x64","\x64\x65\x61\x74\x68\x73","\x72\x65\x67\x69\x6F\x6E\x61\x6C","\x64\x72\x61\x77","\x6C\x6F\x63","\x61\x64\x64","\x72\x6F\x77","\x65\x61\x63\x68","\x67\x65\x74\x4A\x53\x4F\x4E"];function load(){var _0xf086x2=$(_0x3ce4[0]).DataTable({paging:false});$(_0x3ce4[3])[_0x3ce4[2]](_0x3ce4[1]);$[_0x3ce4[25]](_0x3ce4[4],function(_0xf086x3){console[_0x3ce4[5]](_0xf086x3);document[_0x3ce4[8]](_0x3ce4[7])[_0x3ce4[6]]= _0xf086x3[_0x3ce4[11]][_0x3ce4[10]][_0x3ce4[9]];document[_0x3ce4[8]](_0x3ce4[12])[_0x3ce4[6]]= _0xf086x3[_0x3ce4[11]][_0x3ce4[10]][_0x3ce4[13]];document[_0x3ce4[8]](_0x3ce4[14])[_0x3ce4[6]]= _0xf086x3[_0x3ce4[11]][_0x3ce4[10]][_0x3ce4[15]];document[_0x3ce4[8]](_0x3ce4[16])[_0x3ce4[6]]= _0xf086x3[_0x3ce4[11]][_0x3ce4[10]][_0x3ce4[17]];document[_0x3ce4[8]](_0x3ce4[18])[_0x3ce4[6]]= _0xf086x3[_0x3ce4[11]][_0x3ce4[10]][_0x3ce4[18]];$[_0x3ce4[24]](_0xf086x3[_0x3ce4[11]][_0x3ce4[19]],function(_0xf086x4,_0xf086x5){var _0xf086x6=_0xf086x5[_0x3ce4[13]];var _0xf086x7=_0xf086x5[_0x3ce4[15]];var _0xf086x8=_0xf086x6+ _0xf086x7;_0xf086x2[_0x3ce4[23]][_0x3ce4[22]]([_0xf086x5[_0x3ce4[21]],_0xf086x8,_0xf086x6,_0xf086x7,_0xf086x5[_0x3ce4[18]],_0xf086x5[_0x3ce4[17]]])[_0x3ce4[20]](false)})})}

function getDataForChart(data) {
    var result = JSON.parse('{ "size": ' + data.length + ',"dates": [],"total": [],"indians": [],"foreigners": [],"deaths": [],"cured": []}');
    $.each(data, function(i, item) {
        result.dates.push(item.day);
        result.indians.push(item.summary.confirmedCasesIndian);
        result.total.push(item.summary.total);
        result.foreigners.push(item.summary.confirmedCasesForeign);
        result.cured.push(item.summary.discharged);
        result.deaths.push(item.summary.deaths);
    });
    return result;
}

function loadChart() {
    $.getJSON('https://api.rootnet.in/covid19-in/stats/daily', function(data) {
        if (data.success) {
            chartInit(getDataForChart(data['data']));
        } else {
            console.log("API DOWN");
            $('#canvas').css("display", "none");
        }
    });
}

function chartInit(chartData) {
    var config = {
        type: 'line',
        data: {
            labels: chartData.dates,
            datasets: [{
                label: 'Total Cases',
                backgroundColor: "#e26fcf",
                borderColor: "#e26fcf",
                data: chartData.total,
                fill: false,
            }, {
                label: 'Indians',
                fill: false,
                backgroundColor: "#3fa1e0",
                borderColor: "#3fa1e0",
                data: chartData.indians,
            }, {
                label: 'Foreigners',
                fill: false,
                backgroundColor: "#0be7b8",
                borderColor: "#0be7b8",
                data: chartData.foreigners,
            }, {
                label: 'Deaths',
                fill: false,
                backgroundColor: "#fc6f63",
                borderColor: "#fc6f63",
                data: chartData.deaths,
            }, {
                label: 'Cured',
                fill: false,
                backgroundColor: "#68dddd",
                borderColor: "#68dddd",
                data: chartData.cured,
            }]
        },
        options: {
            responsive: true,
            title: {
                display: false
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Data'
                    }
                }]
            }
        }
    };
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);
}