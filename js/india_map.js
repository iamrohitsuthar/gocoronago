google.charts.load('current', {
        'packages':['geochart'],
        'mapsApiKey': 'Add your google map api key here'
      });
      google.charts.setOnLoadCallback(drawRegionsMap);

      
      function drawRegionsMap() {
        $.getJSON('https://api.rootnet.in/covid19-in/stats/latest', function(result) {
        var map = {};
        $.each(result['data']['regional'], function(key, value) {
          var confirmedCasesIndian = value['confirmedCasesIndian'];
          var confirmedCasesForeign = value['confirmedCasesForeign'];
          var total = confirmedCasesIndian + confirmedCasesForeign;
          map[value['loc']] = total;
        });
        console.log(map);

        function check(key1){
          if(key1 in map)
          {
            return map[key1];
          }
          else{
            return 0;
          }
        }

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
        };

        options['colorAxis'] = {colors : ['#ffffff','#f54c4c']};
        

        var chart = new google.visualization.GeoChart(document.getElementById('regions_div'));
        
        google.visualization.events.addListener(chart, 'select', function () {
        var selection = chart.getSelection();
        if (selection.length) {
        alert(data.getValue(selection[0].row, 0));
        }
});
        
        chart.draw(data, options);
      });
    }

       $(window).resize(function(){
            drawRegionsMap();
        });