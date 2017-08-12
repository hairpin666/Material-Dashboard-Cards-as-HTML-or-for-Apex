var materialCards = (function () {
    "use strict";
    var scriptVersion = "1.0";
    return {
        /* Initialize function for cards */
        initialize: function (
            parentID, ajaxID, noDataFoundMessage, udConfigJSON, items2Submit) {
            var stdConfigJSON = {
                "cardWidth": 4,
                "refresh": 0
            };
            var configJSON = {};

            /* get parent and make min height to show loader */
            var parent = $("#" + parentID);
            parent.css("min-height", "170px");

            /* try to parse config json when string or just set */
            if (typeof udConfigJSON == 'string') {
                try {
                    configJSON = JSON.parse(udConfigJSON);
                } catch (e) {
                    console.log("Error while try to parse udConfigJSON. Please check your Config JSON. Standard Config will be used.");
                    console.log(e);
                    console.log(udConfigJSON);
                    configJSON = {};
                }
            } else {
                configJSON = udConfigJSON;
            }

            /* try to merge with standard if any attribute is missing */
            try {
                configJSON = $.extend(true, stdConfigJSON, configJSON);
            } catch (e) {
                console.log('Error while try to merge udConfigJSON into Standard JSON if any attribute is missing. Please check your Config JSON. Standard Config will be used.');
                console.log(e);
                configJSON = stdConfigJSON;
                console.log(configJSON);
            }

            /* get data and draw */
            getData();

            /***********************************************************************
             **
             ** Used to add a loading icon to the tiles
             **
             ***********************************************************************/
            function addLoader() {
                try {
                    apex.util.showSpinner(parent);
                } catch (e) {
                    /* define loader */
                    var faLoader = $("<span></span>");
                    faLoader.attr("id", "loader" + parentID);
                    faLoader.addClass("ct-loader fa-stack fa-3x");

                    /* define circle for loader */
                    var faCircle = $("<i></i>");
                    faCircle.addClass("fa fa-circle fa-stack-2x");
                    faCircle.css("color", "rgba(121,121,121,0.6)");

                    /* define refresh icon with animation */
                    var faRefresh = $("<i></i>");
                    faRefresh.addClass("fa fa-refresh fa-spin fa-inverse fa-stack-1x");
                    faRefresh.css("animation-duration", "1.8s");

                    /* append loader */
                    faLoader.append(faCircle);
                    faLoader.append(faRefresh);
                    parent.append(faLoader);
                }
            }

            /* don't need because parent is cleared when drawed after data has been loaded*/
            function removeLoader() {
                /* TODO */
            }

            /************************************************************************
             **
             ** Used to draw the whole region
             **
             ***********************************************************************/
            function drawCardsRegion(cardDataJSON) {
                /* empty parent for new stuff */
                parent.empty();

                /* define container and add it to parent */
                var container = drawContainer(parent);

                /* define row and add it to the container */
                var row = drawRow(container);

                /* draw cards and add it to the rows */
                if (cardDataJSON.row && cardDataJSON.row.length > 0) {
                    drawCards(row, cardDataJSON.row, configJSON);
                } else {
                    parent.css("min-height", "");
                    row.append('<div class="s-g-col-12">' + noDataFoundMessage + '</div>');
                }
            }

            /* try to bind apex refreh event if "apex" exists */
            try {
                apex.jQuery(parent).bind("apexrefresh", function () {
                    if (parent.children('span').length == 0) {
                        getData();
                    }
                });
            } catch (e) {
                console.log('Apex is missing');
                console.log(e);
            }

            /* Used to set a refresh via json configuration */
            if (configJSON.refresh > 0) {
                setInterval(function () {
                    if (parent.children('span').length == 0) {
                        getData();
                    }
                }, configJSON.refresh * 1000);
            }

            /***********************************************************************
             **
             ** Used to draw a container
             **
             ***********************************************************************/
            function drawContainer(parent) {
                var div = $("<div></div>");
                div.addClass("s-g-container");
                parent.append(div);
                return (div);
            }

            /***********************************************************************
             **
             ** Used to draw a row
             **
             ***********************************************************************/
            function drawRow(parent) {
                var div = $("<div></div>");
                div.addClass("s-g-row");
                parent.append(div);
                return (div);
            }

            /***********************************************************************
             **
             ** function to get data from Apex
             **
             ***********************************************************************/
            function getData() {
                if (ajaxID) {
                    addLoader();
                    apex.server.plugin(
                        ajaxID, {
                            pageItems: items2Submit
                        }, {
                            success: drawCardsRegion,
                            error: function (d) {
                                parent.empty();
                                console.log(d.responseText);
                                parent.append("<span>Error occured please check console for more information</span>");
                            },
                            dataType: "json"
                        });
                } else {
                    try {
                        addLoader();
                        /* just wait 5 seconds to see loader */
                        setTimeout(function () {
                            drawCardsRegion(dataJSON);
                        }, 500);

                    } catch (e) {
                        console.log('need data json');
                        console.log(e);
                    }
                }
            }

            /***********************************************************************
             **
             ** Used to draw cards
             **
             ***********************************************************************/
            function drawCards(parent, cardData, cardConfig) {
                /* check data and draw cards */
                if (cardData && cardData.length > 0) {
                    $.each(cardData, function (index, objData) {
                        if (objData.CARD_TYPE) {
                            if (objData.CARD_TYPE.toLowerCase() === "icon") {

                                drawSmallCard(index, parent, objData, cardConfig);
                            } else {
                                drawLargeCard(index, parent, objData, cardConfig, objData.CARD_CHART_CONFIG);
                            }
                        } else {
                            console.log("Please select the a valid CARD_TYPE");
                        }
                    });
                    removeLoader();
                }
            }

            /***********************************************************************
             **
             ** Used to draw the small cards
             **
             ***********************************************************************/
            function drawSmallCard(index, parent, cardData, cardConfig) {
                /* define card style when nothing is set */
                var cardStdStyle = 'background: linear-gradient(60deg, hsl(' + (index * 23) % 350 + ', 55%, 60%), hsl(' + (index * 23) % 350 + ', 50%, 60%));box-shadow: 0 12px 20px -10px rgba(230, 230, 230, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(230, 230, 230, 0.2);';

                /* this html should be added to page */
                /*
                <div class="s-g-col-4">
                        <div class="at-card at-card-stats">
                            <div class="card-header" data-background-color="orange">
                                <i class="fa fa-gear"></i>
                            </div>
                            <div class="card-content">
                                <p class="category">My Title</p>
                                <h3 class="title">19%</h3>
                            </div>
                            <div class="card-footer">
                                <div class="stats">
                                    <i class="fa fa-gear"></i>This is a Material Card
                                </div>
                            </div>
                        </div>
                    </div>
                */

                /* define new column for rows */
                var col = $("<div></div>");
                col.addClass("s-g-col-" + cardConfig.cardWidth);

                /* define card */
                var card = $("<div></div>");
                card.addClass("at-card at-card-stats");

                /* define header for card */
                var cardHeader = $("<div></div>");
                cardHeader.addClass("card-header");

                /* add icon to card header */
                if (cardData.CARD_ICON) {
                    var icon = $("<i></i>");
                    icon.addClass("fa " + cardData.CARD_ICON);

                    var iconColor = (cardData.CARD_ICON_COLOR != undefined && cardData.CARD_ICON_COLOR.length > 0) ? cardData.CARD_ICON_COLOR : 'white';
                    icon.attr("style", "color:" + iconColor);

                    cardHeader.append(icon);
                }

                /* add header styles */
                cardHeader.attr("style", cardData.CARD_HEADER_STYLE || cardStdStyle);

                /* append header to cards */
                card.append(cardHeader);

                /* define card body */
                var cardBody = $("<div></div>");
                cardBody.addClass("card-content");

                /* add title to body */
                var title = (cardData.CARD_TITLE != undefined) ? cardData.CARD_TITLE : '';
                cardBody.append('<p class="category">' + title + '</p>');

                /* add value to body */
                var value = (cardData.CARD_VALUE != undefined) ? cardData.CARD_VALUE : '';
                cardBody.append('<h2 class="title">' + value + '</h2>');

                /* append body to card */
                card.append(cardBody);

                /* define footer */
                var cardFooter = $("<div></div>");
                cardFooter.addClass("card-footer");

                /* define footer text */
                var cardFooterStats = $("<div></div>");

                if (cardData.CARD_FOOTER) {
                    cardFooterStats = $("<div></div>");
                    cardFooterStats.addClass("stats");
                    cardFooterStats.append(cardData.CARD_FOOTER);
                }

                /* add footer text to footer */
                cardFooter.append(cardFooterStats);

                /* add footer to card */
                card.append(cardFooter);

                /* add card to column */
                col.append(card);

                /* if link is set make the card clickable and add column to parent (rows) */
                if (cardData.CARD_LINK) {
                    var link = $("<a></a>");
                    link.attr("href", cardData.CARD_LINK);
                    link.append(col);
                    parent.append(link);
                } else {
                    parent.append(col);
                }
            }

            /***********************************************************************
             **
             ** Used to draw the large cards with chartist.js charts
             **
             ***********************************************************************/
            function drawLargeCard(index, parent, cardData, cardConfig, chartConfig) {
                /* define card style when nothing is set */
                var cardStdStyle = 'background: linear-gradient(60deg, hsl(' + (index * 23) % 350 + ', 55%, 60%), hsl(' + (index * 23) % 350 + ', 50%, 60%));box-shadow: 0 12px 20px -10px rgba(230, 230, 230, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(230, 230, 230, 0.2);';

                /* this html should be added to page */
                /*  <div class="s-g-col-4">
                        <div class="at-card">
                            <div class="card-header card-chart" data-background-color="orange">
                                <div class="ct-chart" id="dailySalesChart"></div>
                            </div>
                            <div class="card-content">
                                <h4 class="title">My Title</h4>
                                <p class="category">This is my Material Card</p>
                            </div>
                            <div class="card-footer">
                                <div class="stats">
                                    Hello World!
                                </div>
                            </div>
                        </div>
                    </div>
                */

                var standardChartConfig = {
                    fullWidth: true,
                    chartPadding: {
                        bottom: -10,
                        top: 20,
                        right: 30,
                        left: -5
                    }
                };

                /* get chartConfig Json and parse it if needed */
                var chartConfigJSON = {}
                if (chartConfig && typeof chartConfig == 'string') {
                    try {
                        chartConfigJSON = JSON.parse(chartConfig);

                    } catch (e) {
                        console.log("Error while try to parse CARD_CHART_CONFIG: " + e + chartConfig);
                    }
                } else {
                    chartConfigJSON = chartConfig;
                }

                /* merge config to standard config if something is missing that'S needed */
                $.extend(true, standardChartConfig, chartConfigJSON);


                /* define chart unique id */
                var chartID = "ct-chart-" + parentID + index;

                /* define column */
                var col = $("<div></div>");
                col.addClass("s-g-col-" + cardConfig.cardWidth);

                /* define card */
                var card = $("<div></div>");
                card.addClass("at-card");

                /* define header */
                var cardHeader = $("<div></div>");
                cardHeader.addClass("card-header card-chart");

                /* set header style */
                cardHeader.attr("style", cardData.CARD_HEADER_STYLE || cardStdStyle);

                /* define chart */
                var chart = $("<div></div>");
                chart.addClass("ct-chart");
                chart.attr("id", chartID);

                /* append chart to card header */
                cardHeader.append(chart);

                /* append header to card */
                card.append(cardHeader);

                /* define card body */
                var cardBody = $("<div></div>");
                cardBody.addClass("card-content");

                /* add title to card body */
                var title = (cardData.CARD_TITLE != undefined && cardData.CARD_TITLE.length > 0) ? cardData.CARD_TITLE : '';
                cardBody.append('<p class="category">' + title + '</p>');

                /* add card value to body */
                var value = (cardData.CARD_VALUE != undefined && cardData.CARD_VALUE.length > 0) ? cardData.CARD_VALUE : '-';
                cardBody.append('<h2 class="title">' + value + '</h2>');

                /* append body to card */
                card.append(cardBody);

                /* define card footer */
                var cardFooter = $("<div></div>");
                cardFooter.addClass("card-footer");

                /* define footert text */
                var cardFooterStats = $("<div></div>");
                if (cardData.CARD_FOOTER) {
                    cardFooterStats = $("<div></div>");
                    cardFooterStats.addClass("stats");
                    cardFooterStats.append(cardData.CARD_FOOTER);
                }

                /* append footer text to footer */
                cardFooter.append(cardFooterStats);

                /* append footer to card */
                card.append(cardFooter);

                /* add card to column */
                col.append(card);

                /* if link is set make card clickable and add it to parent (rows) */
                if (cardData.CARD_LINK) {
                    var link = $("<a></a>");
                    link.attr("href", cardData.CARD_LINK);
                    link.append(col);
                    parent.append(link);
                } else {
                    parent.append(col);
                }

                /* draw chart */
                var chartIst;
                if (cardData.CARD_CHART_DATA) {

                    var chartData = {}

                    /* try to get chart data as json */
                    if (typeof cardData.CARD_CHART_DATA == 'string') {
                        try {
                            chartData = JSON.parse(cardData.CARD_CHART_DATA);

                        } catch (e) {
                            console.log("Error while try to parse CARD_CHART_DATA");
                            console.log(e);
                            console.log(cardData.CARD_CHART_DATA);
                        }
                    } else {
                        chartData = cardData.CARD_CHART_DATA;
                    }

                    /* draw chart with type that is set */
                    switch (cardData.CARD_TYPE.toLowerCase()) {
                    case "chart-line":
                        chartIst = new Chartist.Line("#" + chartID, chartData, standardChartConfig);
                        break;
                    case "chart-bar":
                        chartIst = new Chartist.Bar("#" + chartID, chartData, standardChartConfig);
                        break;
                    case "chart-pie":
                        standardChartConfig.chartPadding = {};
                        chartIst = new Chartist.Pie("#" + chartID, chartData, standardChartConfig);
                        break;
                    default:
                        console.log("No valid Chart type");
                    }

                    /* style chart */
                    var iconColor = (cardData.CARD_ICON_COLOR != undefined && cardData.CARD_ICON_COLOR.length > 0) ? cardData.CARD_ICON_COLOR : 'white';

                    chartIst.on('draw', function (context) {

                        if (context.type === 'bar' || context.type === 'line' || context.type === 'point') {
                            context.element.attr({
                                style: 'stroke:  ' + iconColor
                            });
                        }

                        if (context.type === 'slice' || context.type === 'area') {
                            context.element.attr({
                                //style: 'fill: hsl(' + context.index * 20 % 350 + ', 50%, 60%)'
                                style: 'fill: ' + iconColor + '; fill-opacity: ' + (((context.index) % 10) + 2) / 10
                            });
                        }
                        $(chart).find(".ct-slice-pie").attr("stroke", iconColor);
                        $(chart).find(".ct-label").css("color", iconColor);
                        $(chart).find(".ct-grid").css("stroke", iconColor);
                        $(chart).find(".ct-grid").css("opacity", ".4");
                    });
                }
            }
        }
    }
})();