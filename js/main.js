



var map = {};

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
            map[value['loc']] = total;
            table['row']['add']([value['loc'], total, confirmedCasesIndian, confirmedCasesForeign, value['deaths'], value['discharged']])['draw'](false)
        });
        google.charts.load('current', {
            'packages':['geochart'],
            'mapsApiKey': 'Add your google map api key here'
          });
        google.charts.setOnLoadCallback(drawRegionsMap);
    });
}

function getHelplines() {
    $.getJSON('https://api.rootnet.in/covid19-in/contacts', function(result) {
        $.each(result['data']['contacts']['regional'], function(key, value) {
            var mobile = value['number'];
            if(mobile.indexOf(',') > 0)
                mobile = mobile.substring(0,mobile.indexOf(','));
                var data = "<div class='card'> <div class='header'><h6 class='mb-0 text-center' style='color: #323232'>"+value['loc']+"</h6> </div> <div class='body'><p class='black-text mb-0 text-center'><a href='tel:"+mobile.replace(new RegExp('-', 'g'),"")+"'>"+mobile+"</a></p></div></div>";
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

function getDataForMap(data){
    
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
        return (sum/res.total.length).toFixed(1);
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




function check(key1){
    if(key1 in map)
    {
    return map[key1];
    }else{
        return 0;
    }
  }

function drawRegionsMap() {
    console.log("called")
    var data = google.visualization.arrayToDataTable([
    ['State Code', 'State', 'Corona stats (COVID - 19)'],
    ['IN-MH','Maharashtra',check('Maharashtra')],     
    [ 'IN-UP','Uttar Pradesh', check('Uttar Pradesh')],
    ['IN-BR','Bihar', check('Bihar')],
    ['IN-WB','West Bengal', check('West Bengal')],
    ['IN-MP','Madhya Pradesh', check('Madhya Pradesh')],
    ['IN-TN','Tamil Nadu - ' + check('Tamil Nadu') + '\n Puducherry-'+ check('Puducherry'), check('Tamil Nadu') + check('Puducherry')],
    ['IN-RJ','Rajasthan', check('Rajasthan')],
    ['IN-KA','Karnataka', check('Karnataka')],
    ['IN-GJ','Gujarat', check('Gujarat')],
    ['IN-AP','Andhra Pradesh - ' + check('Andhra Pradesh') + '\n\nTelengana - ' + check('Telengana') , check('Andhra Pradesh') + check('Telengana')],
    ['IN-OR','Odisha', check('Odisha')],
    ['IN-KL','Kerala', check('Kerala')],
    ['IN-JH','Jharkhand', check('Jharkhand')],
    ['IN-AS','Assam', check('Assam')],
    ['IN-PB','Punjab', check('Punjab')],
    ['IN-CT','Chhattisgarh', check('Chhattisgarh')],
    ['IN-HR','Haryana', check('Haryana')],
    ['IN-JK','Jammu and Kashmir - ' + check('Jammu and Kashmir') + '\n Ladakh - ' +check('Ladakh') , check('Jammu and Kashmir') + check('Ladakh')],
    ['IN-UT','Uttarakhand', check('Uttarakhand')],
    ['IN-HP','Himachal Pradesh', check('Himachal Pradesh')],
    ['IN-TR','Tripura',check('Tripura') ],
    ['IN-ML','Meghalaya', check('Meghalaya')],
    ['IN-MN','Manipur', check('Manipur')],
    ['IN-NL','Nagaland', check('Nagaland')],
    ['IN-GA','Goa', check('Goa')],
    ['IN-AR', 'Arunachal Pradesh', check('Arunachal Pradesh')],
    ['IN-MZ','Mizoram', check('Mizoram')],
    ['IN-SK','Sikkim', check('Sikkim')],
    ['IN-DL','Delhi', check('Delhi')],
    ['IN-PY','Puducherry', check('Puducherry')],
    ['IN-CH','Chandigarh', check('Chandigarh')],
    ['IN-AN','Andaman and Nicobar', Math.max(check('Andaman and Nicobar Islands'),check('Andaman and Nicobar'))],
    ['IN-DN','Dadra and Nagar Haveli', check('Dadra and Nagar Haveli')],
    ['IN-DD','Daman and Diu', check('Daman and Diu')],
    ['IN-LD','Lakshadweep', check('Lakshadweep')]
    ]);

    var options = {
        region: 'IN',
        domain:'IN',
        resolution: 'provinces',
        datalessRegionColor: 'transparent',
        is3D : true,
        keepAspectRatio: true,
    };

    options['colorAxis'] = {colors : ['#ffffff','#f54c4c']};
    

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
    
    chart.draw(data, options);
}

$(window).resize(function(){
    drawRegionsMap();
});