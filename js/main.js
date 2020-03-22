function load() {
    var table = $('#dtBasicExample').DataTable({
        paging: false
    });
    $('.dataTables_length')['addClass']('bs-select');
    $.getJSON('https://api.rootnet.in/covid19-in/stats/latest', function(result) {

        var totalCases = result['data']['summary']['total'];
        var deaths = result['data']['summary']['deaths'];
        var cured = result['data']['summary']['discharged'];

        document.getElementById('total_cases').innerHTML = totalCases;
        document.getElementById('indians').innerHTML = result['data']['summary']['confirmedCasesIndian'];
        document.getElementById('foreigners').innerHTML = result['data']['summary']['confirmedCasesForeign'];
        document.getElementById('cured').innerHTML = cured;
        document.getElementById('deaths').innerHTML = deaths;
        document.getElementById('active_cases').innerHTML = totalCases - (deaths + cured);

        $.each(result['data']['regional'], function(key, value) {
            var confirmedCasesIndian = value['confirmedCasesIndian'];
            var confirmedCasesForeign = value['confirmedCasesForeign'];
            var total = confirmedCasesIndian + confirmedCasesForeign;
            table['row']['add']([value['loc'], total, confirmedCasesIndian, confirmedCasesForeign, value['deaths'], value['discharged']])['draw'](false)
        });
    });
}

function getHelplines() {
    $.getJSON('https://api.rootnet.in/covid19-in/contacts', function(result) {
        $.each(result['data']['contacts']['regional'], function(key, value) {
            var mobile = value['number'];
            if(mobile.indexOf(',') > 0)
                mobile = mobile.substring(0,mobile.indexOf(','));
            var data = "<div class='card'> <div class='header'><h6 class='mb-0 text-center' style='color: #323232'>"+value['loc']+"</h6> </div> <div class='body'><p class='black-text mb-0 text-center'>"+mobile+"</p></div></div>";
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

    $.each(data, function(i, item) {
        if(!today_cases)
            today_cases = isToday(new Date(item.day));

        if(today_cases && !isDone) {
            document.getElementById('today_cases').innerHTML = item.summary.total - prev_cases;
            isDone = true;
        }
        if(!today_cases)    
            prev_cases = item.summary.total;

        result.dates.push(item.day);
        result.indians.push(item.summary.confirmedCasesIndian);
        result.total.push(item.summary.total);
        result.foreigners.push(item.summary.confirmedCasesForeign);
        result.cured.push(item.summary.discharged);
        result.deaths.push(item.summary.deaths);
    });
    if(!today_cases)
        document.getElementById('today_cases').innerHTML = 0;
    return result;
}

function getGrowthRate(res)
{   
        let original = 0;
        let sum = 0;
        $.each(res.total, function(i,item){
            if( i == 0 )
                original = item;
            else
            {
                var rate = (( item - original ) / original) * 100;
                sum += rate;
                original = item;
            }
        });
        return (sum/res.total.length).toFixed(2);
}

function loadChart() {
    $.getJSON('https://api.rootnet.in/covid19-in/stats/daily', function(data) {
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
                        callback: function(value, index, values) {
                            if(window.matchMedia("(max-width: 480px)").matches)
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
                        callback: function(value, index, values) {
                            if(window.matchMedia("(max-width: 480px)").matches)
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
}
