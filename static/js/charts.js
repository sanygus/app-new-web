const drawChart = (container, data) => {
  container.innerHTML = `<div uk-spinner></div>`;
  //prepare sensors (add files)
  for (sens of data.sensors) {
    const sensdate = new Date(sens.date);
    let filedate;
    let nearFileDate = null;
    for (file of data.files) {
      filedate = new Date(file.replace('.jpg', '.000Z'));
      if (Math.abs(sensdate - filedate) < Math.abs(sensdate - nearFileDate)) {
        nearFileDate = filedate;
      }
    }
    if (nearFileDate) {
      sens.file = '/static/photos/4/' + nearFileDate.toJSON().replace('.000Z', '.jpg');
      sens.fileValue = 1;
    }
  }

  console.log(data);

  //make chart
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
        "position": "left",
    }, {
        "id":"vpress",
        "axisColor": "#FCD202",
        "axisThickness": 2,
        "axisAlpha": 1,
        "position": "right",
    }, {
        "id":"vimg",
        "labelsEnabled": false,
        "maximum": 1,
        "minimum": 0,
        "axisAlpha": 0,
        "gridAlpha": 0,
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
        "type": "smoothedLine",
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
        "valueAxis": "vimg",
        "bullet": "custom",
        "lineAlpha": 0,
        "showBalloon": false,
        "bulletSize": 80,
        "bulletOffset": 110,
        "customBulletField": "file",
        "bulletBorderThickness": 1,
        "hideBulletsCount": 300,
        "valueField": "fileValue",
        "fillAlphas": 0,
        "visibleInLegend": false,
        "stackable": false,
    }],
    "chartScrollbar": {
        "scrollbarHeight":10,
        "backgroundAlpha":0.1,
        "backgroundColor":"#888888",
        "selectedBackgroundColor":"#67b7dc",
        "selectedBackgroundAlpha":0.7,
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
    "listeners": [{
        "event": "clickGraphItem",
        "method": function(event) {
          const dc = event.item.dataContext;
          const df = new Date(dc.file.substr(-23).replace('.jpg','.000Z'));
          UIkit.lightboxPanel({ "items": [{ "source": dc.file, "caption": moment(df).format("LLL") }] }).show();
        }
    }, {
        "event": "rendered",
        "method": function(e) {
          e.chart.zoomToIndexes(data.sensors.length - 10, data.sensors.length);
        }
    }]
  });
}