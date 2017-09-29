/*tmpsensors = tmpsensors.map((sensor) => {
    if (sensor.date) { sensor.date = new Date(sensor.date) }
    if (sensor.gas1) {
        sensor.gas1 = Math.round((sensor.gas1[0] + sensor.gas1[1] + sensor.gas1[2] + sensor.gas1[3]) / 4)
    }
    if (sensor.charge) { sensor.charge = Math.round(sensor.charge.toFixed(2) * 100) }
    sensor.imageValue = 1;
    let imglink = tmpfiles[sensor.dev].filter((f) => {
        return f.indexOf(moment(sensor.date).format('YYYY-MM-DD-HH-mm').substring(0, 15)) == 0 
    })[0];
    if (imglink) {
        sensor.image = '/static/photos/' + sensor.dev + '/' + imglink;
    }
    return sensor;
})

const sensors = {};
let tmpsens = {};
tmpsensors.forEach((sensor) => {
    if (sensor.dev) {
        tmpsens = {};
        Object.assign(tmpsens, sensor);
        delete tmpsens.dev;
        if (sensors[sensor.dev] === undefined) {
            sensors[sensor.dev] = [];
        }
        sensors[sensor.dev].push(tmpsens);
    }
})

const charts = {};*/
//let zoomCharts;
AmCharts.ready(() => {

    for (let dev in sensors) {
        charts[dev] = AmCharts.makeChart(
            "chartdiv-" + dev,
            {
                "type": "serial",
                "theme": "light",
                "language": "ru",
                "legend": {
                    "useGraphSettings": true,
                    "labelWidth": 120,
                    "align": "center"
                },
                "dataProvider": sensors[dev],
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
                }, {
                    "id":"vmic",
                    "axisColor": "#B0DE09",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "right"
                }, {
                    "id":"vgas1",
                    "axisColor": "#828282",
                    "axisThickness": 2,
                    "offset": 50,
                    "axisAlpha": 1,
                    "position": "right"
                }, {
                    "id":"vcharge",
                    "axisColor": "#5339BA",
                    "axisThickness": 2,
                    "offset": 100,
                    "axisAlpha": 1,
                    "position": "right",
                    "minimum": 0,
                    "maximum": 100,
                    "unit": "%",
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
                }, /*{
                    "valueAxis": "vmic",
                    "balloonText": "[[value]] ед.",
                    "legendValueText": "[[value]] ед.",
                    "lineColor": "#B0DE09",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "Шум",
                    "valueField": "mic",
                    "type": "line",
                    "fillAlphas": 0,
                    "hidden": true,
                }, {
                    "valueAxis": "vgas1",
                    "balloonText": "[[value]] ppm",
                    "legendValueText": "[[value]] ppm",
                    "lineColor": "#828282",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "Газы 1",
                    "valueField": "gas1",
                    "type": "line",
                    "fillAlphas": 0,
                    "hidden": true,
                }, {
                    "valueAxis": "vcharge",
                    "balloonText": "[[value]] %",
                    "legendValueText": "[[value]] %",
                    "lineColor": "#5339BA",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "Заряд",
                    "valueField": "charge",
                    "type": "line",
                    "fillAlphas": 0,
                    "hidden": true,
                },*/{
                    //"valueAxis": "v4",
                    "bullet": "custom",
                    "lineAlpha": 0,
                    "showBalloon": false,
                    "bulletSize": 80,
                    "bulletOffset": 365,
                    "customBulletField": "image",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "valueField": "imageValue",
                    "fillAlphas": 0,
                    "visibleInLegend": false,
                    "stackable": false,
                }],
                //"chartScrollbar": {},
                "chartCursor": {
                    "cursorPosition": "mouse",
                    "selectWithoutZooming": true,
                    "categoryBalloonDateFormat": "MMM DD JJ:NN",
                    "cursorColor": "#444444"
                },
                "startDuration": 0.5,
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "minPeriod": "ss",
                },
                "listeners": [{
                    "event": "clickGraphItem",
                    "method": function(event) {
                      openLB(event.item.dataContext);
                    }
                }]
            }
        );
    }

    /*const endday = new Date();
    endday.setHours(23, 59, 59);
    for (let ch in charts) {
        charts[ch].dataProvider.push({"date": endday});
        charts[ch].validateData();
    }
    zoomCharts = (days) => {
        let startday = new Date();
        startday.setHours(0, 0, 0);
        if (days && days > 0) {
            startday = new Date(startday - 1000 * 60 * 60 * 24 * days)
        }
        for (let ch in charts) {
            charts[ch].zoomToDates(startday, endday);
        }
        $('#periodSelector .uk-button-primary').addClass('uk-button-default');
        $('#periodSelector .uk-button-primary').removeClass('uk-button-primary');
        $('#zb'+days).removeClass('uk-button-default');
        $('#zb'+days).addClass('uk-button-primary');
    }
    zoomCharts(0);*/

    
});