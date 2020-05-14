var maxConfirmed = 0, maxCured = 0, maxDeaths = 0;
var st = ["Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Daman and Diu", "Dadra and Nagar Haveli", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Pondicherry", "Rajasthan", "Sikkim", "Tamil Nadu", "Tripura", "Telengana", "Uttar Pradesh", "Uttarakhand", "West Bengal"]
var stateData = {};

$("#choropleth_switch_1").click(function () {
    choropleth(0, maxConfirmed);
});

$("#choropleth_switch_2").click(function () {
    choropleth(1, maxCured);
});

$("#choropleth_switch_3").click(function () {
    choropleth(2, maxDeaths);
});


function load() {
    var table = $('#dtBasicExample').DataTable({
        paging: false,
        fixedHeader: true
    });
    $('.dataTables_length')['addClass']('bs-select');

    $.getJSON('https://api.rootnet.in/covid19-in/stats/latest', function (result) {

        var totalCases = result['data']['summary']['total'];
        var deaths = result['data']['summary']['deaths'];
        var cured = result['data']['summary']['discharged'];

        document.getElementById('total_cases').innerHTML = totalCases;
        document.getElementById('indians').innerHTML = result['data']['summary']['confirmedCasesIndian'];
        document.getElementById('foreigners').innerHTML = result['data']['summary']['confirmedCasesForeign'];
        document.getElementById('cured').innerHTML = cured;
        document.getElementById('deaths').innerHTML = deaths;
        document.getElementById('active_cases').innerHTML = totalCases - (deaths + cured);

        $.each(result['data']['regional'], function (key, value) {
            var state = value['loc'];
            var index;
            for (index = 0; index < st.length; index++) {
                var element = st[index];
                if (state.includes(element)) {
                    break;
                }
            }

            var confirmedCasesIndian = value['confirmedCasesIndian'];
            var confirmedCasesForeign = value['confirmedCasesForeign'];
            var confirmed = confirmedCasesIndian + confirmedCasesForeign;
            var cured = value['discharged'];
            var deaths = value['deaths'];

            table['row']['add']([state, confirmed, confirmedCasesIndian, confirmedCasesForeign, deaths, cured])['draw'](false)
            stateData[st[index]] = [confirmed, cured, deaths];

            if (confirmed > maxConfirmed) {
                maxConfirmed = confirmed;
            }
            if (cured > maxCured) {
                maxCured = cured;
            }
            if (deaths > maxDeaths) {
                maxDeaths = deaths;
            }
        });
        document.getElementsByClassName('switch-choropleth')[0].style.visibility = 'visible';
        choropleth(0, maxConfirmed);
    });

}


function getHelplines() {
    $.getJSON('https://api.rootnet.in/covid19-in/contacts', function (result) {
        $.each(result['data']['contacts']['regional'], function (key, value) {
            var mobile = value['number'];
            if (mobile.indexOf(',') > 0)
                mobile = mobile.substring(0, mobile.indexOf(','));
            var data = "<div class='card'> <div class='header'><h6 class='mb-0 text-center' style='color: #323232'>" + value['loc'] + "</h6> </div> <div class='body'><p class='black-text mb-0 text-center'><a href='tel:" + mobile.replace(new RegExp('-', 'g'), "") + "'>" + mobile + "</a></p></div></div>";
            $('#help-cards').append(data);
        });
    });
}

const isToday = (someDate) => {
    const today = new Date()
    return someDate.getDate() == today.getDate() &&
        someDate.getMonth() == today.getMonth() &&
        someDate.getFullYear() == today.getFullYear()
}

function getDataForChart(data) {
    var result = JSON.parse('{ "size": ' + data.length + ',"dates": [],"total": [],"indians": [],"foreigners": [],"deaths": [],"cured": []}');

    var today_cases = false;
    var prev_cases = 0;
    var isDone = false;

    $.each(data, function (i, item) {
        if (!today_cases)
            today_cases = isToday(new Date(item.day));

        if (today_cases && !isDone) {
            document.getElementById('today_cases').innerHTML = item.summary.total - prev_cases;
            isDone = true;
        }
        if (!today_cases)
            prev_cases = item.summary.total;

        result.dates.push(item.day);
        result.indians.push(item.summary.confirmedCasesIndian);
        result.total.push(item.summary.total);
        result.foreigners.push(item.summary.confirmedCasesForeign);
        result.cured.push(item.summary.discharged);
        result.deaths.push(item.summary.deaths);
    });
    if (!today_cases)
        document.getElementById('today_cases').innerHTML = 0;
    return result;
}

function getGrowthRate(res) {
    let original = 0;
    let sum = 0;
    $.each(res.total, function (i, item) {
        if (i == 0)
            original = item;
        else {
            var rate = ((item - original) / original) * 100;
            sum += rate;
            original = item;
        }
    });

    return (sum / res.total.length).toFixed(1);
}

function loadChart() {
    $.getJSON('https://api.rootnet.in/covid19-in/stats/daily', function (data) {
        if (data.success) {
            var chartData = getDataForChart(data['data']);
            var avgGrowthRate = getGrowthRate(chartData);
            document.getElementById('growth_rate').innerHTML = avgGrowthRate + '%';
            chartInit(chartData);
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
            legend: {
                display: false
            },
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
                        display: false,
                        labelString: 'Date'
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (window.matchMedia("(max-width: 480px)").matches)
                                return '';
                            else
                                return value;
                        },
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Data'
                    },
                    ticks: {
                        callback: function (value, index, values) {
                            if (window.matchMedia("(max-width: 480px)").matches)
                                return '';
                            else
                                return value;
                        },
                    }
                }]
            }
        }
    };
    var ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = new Chart(ctx, config);
    
    // float table head
    var $table = $('#dtBasicExample');
    $table.floatThead({
        responsiveContainer: function ($table) {
            return $table.closest(".table-responsive");
        }
    });
    $("#dtBasicExample").floatThead({
        autoReflow: true
    });
}


function choropleth(choroplethType, maxCount) {
    var title;
    switch (choroplethType) {
        case 0:
            title = 'Confirmed Cases';
            break;
        case 1:
            title = 'Cured Cases';
            break;
        case 2:
            title = 'Death Cases';
            break;
        default:
            break;
    }

    function tooltipHtml(state, data) {
        return "<h4>" + state + "</h4>" +
            "<table>" +
            "<tr><td>Confirmed</td><td>" + (data[0]) + "</td></tr>" +
            "<tr><td>Cured</td><td>" + (data[1]) + "</td></tr>" +
            "<tr><td>Deaths</td><td>" + (data[2]) + "</td></tr>" +
            "</table>";
    }

    states.draw("#mapsvg", choroplethType, stateData, maxCount, tooltipHtml);

    // Draw scale
    const svg = d3.select("#mapsvg");

    const maxInterpolation = 0.8;
    var color;
    choroplethType === 0 ?
        color = d3.scaleSequential(d3.interpolateReds).domain([0, maxCount / maxInterpolation || 10])
        : choroplethType === 1 ?
            color = d3.scaleSequential(d3.interpolateGreens).domain([0, maxCount / maxInterpolation || 10])
            : choroplethType === 2 ?
                color = d3.scaleSequential(d3.interpolateGreys).domain([0, maxCount / maxInterpolation || 10])
                : '';

    let cells = null;
    let label = null;

    label = ({ i, genLength, generatedLabels, labelDelimiter }) => {
        if (i === genLength - 1) {
            const n = Math.floor(generatedLabels[i]);
            return `${n}+`;
        } else {
            const n1 = 1 + Math.floor(generatedLabels[i]);
            const n2 = Math.floor(generatedLabels[i + 1]);
            return `${n1} - ${n2}`;
        }
    };

    const numCells = 6;
    const delta = Math.floor((maxCount < numCells ? numCells : maxCount) / (numCells - 1));

    cells = Array.from(Array(numCells).keys()).map((i) => i * delta);

    svg
        .append('g')
        .attr('class', 'legendLinear')
        .attr('transform', 'translate(40, 450)');

    const legendLinear = d3.legendColor()
        .shapeWidth(36)
        .shapeHeight(10)
        .cells(cells)
        .titleWidth(3)
        .labels(label)
        .title(title)
        .orient('vertical')
        .scale(color);

    svg
        .select('.legendLinear')
        .call(legendLinear)
        .selectAll('text')
        .style('font-size', '10px');
}