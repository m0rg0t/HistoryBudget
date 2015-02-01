(function () {
    "use strict";
    
    var ControlConstructor = WinJS.UI.Pages.define("/pages/hub/section1Page.html", {
        // Эта функция вызывается после загрузки содержимого элементов 
        // управления страницы, активации элементов управления и 
        // для результирующих элементов установлены дочерние отношения с моделью DOM. 
        ready: function (element, options) {
            options = options || {};

            var doughnutData = [
				{
				    value: 300,
				    color: "#F7464A",
				    highlight: "#FF5A5E",
				    label: "Red"
				},
				{
				    value: 50,
				    color: "#46BFBD",
				    highlight: "#5AD3D1",
				    label: "Green"
				},
				{
				    value: 100,
				    color: "#FDB45C",
				    highlight: "#FFC870",
				    label: "Yellow"
				},
				{
				    value: 40,
				    color: "#949FB1",
				    highlight: "#A8B3C5",
				    label: "Grey"
				},
				{
				    value: 120,
				    color: "#4D5360",
				    highlight: "#616774",
				    label: "Dark Grey"
				}
            ];
            //window.onload = function () {
                //var ctx = document.getElementById("globalChart").getContext("2d");
                //window.myDoughnut = new Chart(ctx).Doughnut(doughnutData, { responsive: true });
            //};

            var ctx = document.getElementById("globalChart").getContext("2d");
            Data.loadData(function () {
                var chartOptions = { animateScale: true };
                var chartData = [];
                for (var i = 0; i < Data.jsonData.length; i++) { //Data.jsonData.length
                    if ((Data.jsonData[i].nn != null)) {
                        if (chartData.length < 15) {
                            chartData.push({
                                value: Data.jsonData[i].summ / 1,
                                color: "#F7464A",
                                highlight: "#FF5A5E",
                                label: Data.jsonData[i].name
                            });
                        }
                    }
                }
                //var myDoughnutChart = new Chart(ctx).Doughnut(chartData, chartOptions);
                //console.log(myDoughnutChart);
                var ctx = document.getElementById("globalChart").getContext("2d");
                window.myDoughnut = new Chart(ctx).Doughnut(chartData, { responsive: true, animateScale: true });

                $("#commonStats").append("<p>Hello world!</p>");
            });
        },
    });

    // Следующие строки предоставляют этот конструктор элемента управления как глобальный. 
    // Это позволяет использовать элемент управления как декларативный элемент управления внутри 
    // атрибута data-win-control. 

    WinJS.Namespace.define("HubApps_SectionControls", {
        Section1Control: ControlConstructor
    });
})();