const lboxes = {};

const drawChart = (devid, data) => {
  for (sens of data.sensors) {
    const sensdate = new Date(sens.date);
    let filedate;
    let nearFileDate = null;
    for (file of data.files) {
      filedate = new Date(file.replace('.jpg', '.000Z'));
      if ((Math.abs(sensdate - filedate) < Math.abs(sensdate - nearFileDate)) && (Math.abs(sensdate - filedate) < 60000)) {
        nearFileDate = filedate;
      }
    }
    if (nearFileDate) {
      sens.file = `/static/photos/${devid}/` + nearFileDate.toJSON().replace('.000Z', '.jpg');
      sens.fileValue = 1;
    }
  }

  console.log(data);

  //make chart
  AmCharts.makeChart($(`#device-${devid}-block`).find(".chartdiv")[0], {
    "type": "serial",
    "theme": "light",
    "language": "ru",
    "legend": {
      "useGraphSettings": true,
      "labelWidth": 120,
      "align": "center",
      "listeners": [ {
          "event": "hideItem",
          "method": bulletToTop
       }, {
          "event": "showItem",
          "method": bulletToTop
       } ]
    },
    "dataProvider": data.sensors,
    "synchronizeGrid": true,
    "fontFamily": "Roboto",
    "valueAxes": [{
        "id":"vtemp",
        "axisColor": "#1e87f0",
        "axisThickness": 2,
        "axisAlpha": 1,
        "position": "left",
    }, {
        "id":"vpress",
        "axisColor": "#f1d913",
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
        "lineColor": "#1e87f0",
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
        "lineColor": "#f1d913",
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
        "bulletOffset": 0,
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
          const showIndex = lboxes[devid].items.findIndex((lbitem) => {
            return lbitem.source === dc.file
          });
          lboxes[devid].show(showIndex);
        }
    }, {
        "event": "rendered",
        "method": function(e) {
          e.chart.zoomToIndexes(data.sensors.length - 8, data.sensors.length);
          $("tspan:contains('Показать все')").parent().parent().parent().remove();
        }
    }, {
        "event": "zoomed",
        "method": bulletToTop
    }]
  });

  const photoItems = [];
  for (file of data.files) {
    photoItems.push({ source: `/static/photos/${devid}/${file}`, caption: moment.utc(file.replace('.jpg','')).local().format("LLL") })
  }
  lboxes[devid] = UIkit.lightboxPanel({ items: photoItems });

}
const bulletToTop = () => {
  $("g image[height='80']").attr("transform","translate(-40,-190)");
}
