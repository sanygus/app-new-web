let intro = introJs();
let introMaybe = true;
const introInit = () => {
  intro.setOptions({
    nextLabel: 'Далее',
    prevLabel: 'Назад',
    skipLabel: 'Пропустить',
    doneLabel: 'Завершить',
    steps: [
      {
        intro: "Приветствуем!<br>Мы покажем вам основные элементы интерфейса",
      },
      {
        element: document.querySelector(".runHelper"),
        intro: "Вы в любое время можете запустить помощник, кликнув здесь",
      },
      {
        element: document.querySelector(".dev-label"),
        intro: "Местонахождение устройства",
      },
      {
        element: document.querySelector(".dev-status"),
        intro: "Статус и заряд устройства",
      },
      {
        element: document.querySelector(".dev-img"),
        intro: "Последняя фотография или прямая трансляция видео",
      },
      {
        element: document.querySelector(".dev-sens-temp").parentNode,
        intro: "Последнее показание температуры воздуха",
      },
      {
        element: document.querySelector(".dev-sens-press").parentNode,
        intro: "Последнее показание атмосферного давления",
      },
      {
        element: document.querySelector(".dev-sens-date").parentNode,
        intro: "Время снятия последних показаний",
      },
      {
        element: document.querySelector("g image[height='80']").parentNode.parentNode,
        intro: "Последние фотографии (привязаны к графику по времени)",
      },
      {
        element: document.querySelector("g:last-child > image[height='80']"),
        intro: "Чтобы посмотреть фотографии в полном размере, нужно кликнуть на одну из них",
      },
      {
        element: document.querySelector(".amcharts-chart-div"),
        intro: "График изменения показаний значений датчиков",
      },
      {
        element: document.querySelector("g image[height='35']").parentNode.parentNode,
        intro: "Масштаб (временное окно) графика",
      },
      {
        element: document.querySelector("g image[height='35']"),
        intro: "Можно изменить его размер, потащив за ползунки",
      },
      {
        element: document.querySelector("rect[role='menuitem']"),
        intro: "Или переместить его, потащив за пространство между ползунками",
      },
      {
        element: document.querySelector(".amcharts-legend-div"),
        intro: "Легенда к графику. Можно отключить/включить набор отображаемых данных, клинкнув по нему",
      },
    ],
  });
  intro.start();
}
const introCheck = () => {
  if (introMaybe) {
    if (!window.localStorage.getItem('introViewed')) {
      introInit();
      window.localStorage.setItem('introViewed', "1");
    }
    introMaybe = false;
  }
}
