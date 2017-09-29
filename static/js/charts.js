const drawChart = (container, data) => {
  container.innerHTML = `<div uk-spinner></div>`;
  for (sens of data.sensors) {
    //moment(file + '.000Z')
    //sens.date
    const sensdate = new Date(sens.date);
    let filedate;
    let nearFileDate = null;
    for (file of data.files) {
      filedate = new Date(file.replace('.jpg', '.000Z'));
      if (Math.abs(sensdate - filedate) < Math.abs(sensdate - nearFileDate)) {
        nearFileDate = filedate;
      }
    }
    sens.file = '/static/photos/4/' + nearFileDate.toJSON().replace('.000Z', '.jpg');
    sens.fileValue = 0;
  }
  console.log(data);
  AmCharts.makeChart(container, {
    "type": "serial",
    "theme": "light",
    "language": "ru",
    "legend": {
        "useGraphSettings": true,
        "labelWidth": 120,
        "align": "center"
    },
    "dataProvider": data.sensors,
    "synchronizeGrid": true,
    "fontFamily": "Roboto",
    "valueAxes": [{
        "id":"vtemp",
        "axisColor": "#FF6600",
        "axisThickness": 2,
        "axisAlpha": 1,
        "position": "left"
    }, {
        "id":"vpress",
        "axisColor": "#FCD202",
        "axisThickness": 2,
        "offset": 50,
        "axisAlpha": 1,
        "position": "left"
    }],
    "graphs": [{
        "valueAxis": "vtemp",
        "balloonText": "[[value]] °C",
        "legendValueText": "[[value]] °C",
        "lineColor": "#FF6600",
        "bullet": "round",
        "bulletBorderThickness": 1,
        "hideBulletsCount": 30,
        "title": "Температура",
        "valueField": "temp",
        "type": "line",
        "fillAlphas": 0,
    }, {
        "valueAxis": "vpress",
        "balloonText": "[[value]] мрс",
        "legendValueText": "[[value]] мрс",
        "lineColor": "#FCD202",
        "bullet": "round",
        "bulletBorderThickness": 1,
        "hideBulletsCount": 30,
        "title": "Давление",
        "valueField": "press",
        "type": "line",
        "fillAlphas": 0
    }, {
        //"valueAxis": "v4",
        "bullet": "custom",
        "lineAlpha": 0,
        "showBalloon": false,
        "bulletSize": 80,
        "bulletOffset": 50,
        "customBulletField": "file",
        "bulletBorderThickness": 1,
        "hideBulletsCount": 300,
        "valueField": "fileValue",
        "fillAlphas": 0,
        "visibleInLegend": false,
        "stackable": false,
    }],
    "chartScrollbar": {
        "scrollbarHeight":2,
        "backgroundAlpha":0.1,
        "backgroundColor":"#888888",
        "selectedBackgroundColor":"#67b7dc",
        "selectedBackgroundAlpha":1,
    },
    "chartCursor": {
        "cursorPosition": "mouse",
        "selectWithoutZooming": false,
        "categoryBalloonDateFormat": "MMM DD JJ:NN",
        "cursorColor": "#444444"
    },
    //"startDuration": 0.5,
    "categoryField": "date",
    "categoryAxis": {
        "parseDates": true,
        "axisColor": "#DADADA",
        "minPeriod": "ss",
        "position": "top",
    },
    /*"listeners": [{
        "event": "clickGraphItem",
        "method": function(event) {
          openLB(event.item.dataContext);
        }
    }]*/
  });
}