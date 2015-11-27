/**
 * Created by donghyun on 11/14/15.
 */
/**
 * to round to n decimal places
 */
var ceil = function (num) {
    var places;

    if (num < 100) {
        places = 1;
    } else {
        places = 2;
    }

    var multiplier = Math.pow(10, places);
    return Math.ceil(num / multiplier) * multiplier;
}

/**
 * Get Results by using ajax
 */
var getAjaxResult = function (url, data, fun) {
    $.ajax({
        url: url,
        type: "get",
        data: data,
        dataType: "JSON",
        success: function (source) {
            fun(source);
        },
        error: function (request, status, error) {
            alert(status);
        }
    });
}

/**
 * Get Results by using async ajax
 */
var getAsyncAjaxResult = function (url, data) {
    var response = $.ajax({
        url: url,
        type: "get",
        async: false,
        data: data,
        dataType: "JSON",
    }).responseText;

    return response.includes("DoesNotExist")?undefined:JSON.parse(response);
}

/**
 * Get url from id
 */
var getIdFromUrl = function (url) {
    var split_url = url.split('/');
    return split_url[split_url.length - 2];
}

/**
 * Post and comment Display
 */
var pcDisplac = function (rows, row) {
    var user_url = '/archive/user/' + getIdFromUrl(row["user"].url) + '/';
    var fb_url = "https://www.facebook.com/";
    var btn = '&nbsp; &nbsp;<a class="btn btn-block btn-social-icon btn-facebook mini" href="' + fb_url + row["id"] + '" target="_blank"><span class="fa fa-facebook"></span></a>';
    var message = row["message"] ? String(row["message"]).replace(/</gi, "&lt;") : "(photo)";
    rows.push({
        "picture": '<img src="' + row["user"].picture + '" style="border-radius: 10px;">',
        "from": '<div class="more-link"><a href="' + user_url + '"><div class="h5">' + row["user"].name + '</div></a><div class="h5"><small><i class="icon-realtime"></i> ' + timeSince(row["created_time"]) + '</small></div></div>',
        "message": message.length < 100 ? message + btn : message.substring(0, 100) + "..." + btn,
        "like_count": row["like_count"],
        "comment_count": row["comment_count"],
    });
}

/**
 * Post and comment Display for management
 */
var pcDisplacM = function (rows, row, name) {
    var user_url = '/archive/user/' + getIdFromUrl(row["user"].url) + '/';
    var fb_url = "https://www.facebook.com/";
    var btn = '&nbsp; &nbsp;<a class="btn btn-block btn-social-icon btn-facebook mini" href="' + fb_url + row["id"] + '" target="_blank"><span class="fa fa-facebook"></span></a>';
    var message = row["message"] ? String(row["message"]).replace(/</gi, "&lt;") : "(photo)";
    rows.push({
        "checkbox": '<input type="checkbox" name="del_' + name + '" value="' + row["id"] + '">',
        "picture": '<img src="' + row["user"].picture + '" style="border-radius: 10px;">',
        "from": '<div class="more-link"><a href="' + user_url + '"><div class="h5">' + row["user"].name + '</div></a><div class="h5"><small><i class="icon-realtime"></i> ' + timeSince(row["created_time"]) + '</small></div></div>',
        "message": message.length < 100 ? message + btn : message.substring(0, 100) + "..." + btn,
        "like_count": row["like_count"],
        "comment_count": row["comment_count"],
    });
}

/**
 * Get issue by using ajax
 */
var getIssue = function (url, table, limit, from, to, page, paging) {
    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            pcDisplac(rows, results[i]);
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        from: from,
        to: to,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get archive by using ajax
 */
var getArchive = function (url, table, limit, from, page, paging) {
    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            pcDisplac(rows, results[i]);
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        from: from,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Generate Statistics
 */
var getStatistics = function (url, display, method, from, to) {
    var statistics;
    var post_max_cnt;
    var comment_max_cnt;

    var fun = function (source) {
        var chart = jui.include("chart.builder");

        statistics = source['statistics'];
        post_max_cnt = ceil(source['post_max_cnt']);
        comment_max_cnt = ceil(source["comment_max_cnt"]);

        $(display).empty();
        chart(display, {
            padding: {
                left: 60
            },
            height: 400,
            axis: [{
                data: statistics,
                x: {
                    type: "block",
                    domain: "date"
                },
                y: {
                    type: "range",
                    domain: [0, post_max_cnt],
                    step: 4,
                    line: true
                },
                area: {
                    width: "100%",
                    height: "100%"
                }
            }, {
                x: {
                    hide: true
                },
                y: {
                    domain: [0, comment_max_cnt],
                    orient: "right"
                },
                area: {
                    width: "100%",
                    height: "100%"
                },
                extend: 0
            }],
            brush: [{
                type: "column",
                target: "posts",
                axis: 0,
                colors: [0],
                animate: true
            }, {
                type: "line",
                target: "comments",
                axis: 1,
                colors: [2],
                animate: true
            }, {
                type: "scatter",
                target: "comments",
                size: 10,
                axis: 1,
                colors: [2]
            }],
            widget: [{
                type: "title",
                text: "Group Overview",
                align: "start"
            }, {
                type: "title",
                text: "Counts",
                align: "start",
                orient: "center",
                dx: -55,
                dy: -90
            }, {
                type: "tooltip",
                format: function (k, v) {
                    return v;
                },
                brush: [0, 2, 3, 4]
            }],
            style: {
                scatterBorderWidth: 1.5,
                titleFontSize: "11px",
                titleFontWeight: "bold"
            },
            format: function (v) {
                if (typeof(v) == "number") {
                    return ((v > 1000) ? Math.floor(v / 1000) + "k" : v);
                }
                return v;
            }
        });
    }

    method = typeof method !== 'undefined' ? method : "month";

    data = {
        method: method,
        from: from,
        to: to
    }

    getAjaxResult(url, data, fun);
}

/**
 * Generate Hour Total Statistics
 */
var getHourTotalStatistics = function (url, display, from, to) {
    var hour_statistics;

    var fun = function (source) {
        var chart = jui.include("chart.builder");

        hour_statistics = source['statistics'];
        for (var i in hour_statistics) {
            delete hour_statistics[i].date;
        }

        $(display).empty();
        chart(display, {
            height: 350,
            axis: {
                x: {
                    type: "fullblock",
                    domain: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
                    line: true
                },
                y: {
                    type: "range",
                    domain: function (d) {
                        return Math.max(d.posts, d.comments);
                    },
                    step: 10
                },
                data: hour_statistics
            },
            brush: {
                type: "line",
                display: "max",
                active: "posts",
                activeEvent: "click"
            },
            widget: [
                {type: "title", text: "Time Overview"},
                {type: "legend"}
            ]
        });
    }

    data = {
        method: "hour_total",
        from: from,
        to: to
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get active by using ajax
 */
var getActivity = function (url, limit, method, model, table) {

    var fun = function (source) {
        console.dir(source);
        var results = source;
        var rows = []
        for (var i in results) {
            var row = results[i];
            var user_url = '/archive/user/' + row["user"]["id"] + '/';
            rows.push({
                "picture": '<img src="' + row["user"]["picture"] + '" style="border-radius: 10px;">',
                "from": '<div class=" more-link"><a href="' + user_url + '"><div class="h5">' + row["user"]["name"] + '</div></a></div>',
                "count": row["count"],
            });
        }
        ;

        table.reset()
        table.append(rows);
    }

    data = {
        limit: limit,
        method: method,
        model: model
    }

    getAjaxResult(url, data, fun);
}

/**
 * Generate Proportion
 */
var getProportion = function (url, post_display, comment_display) {
    function displayProportion(display, data) {
        var chart = jui.include("chart.builder");
        $(display).empty();
        chart(display, {
            padding: 150,
            height: 600,
            axis: {
                data: [data]
            },
            brush: {
                type: "pie",
                showText: true,
                active: "ie",
                activeEvent: "click",
            },
            widget: [{
                type: "title",
                text: "Proprotion"
            }, {
                type: "tooltip",
                orient: "left",
            }, {
                type: "legend",
            }]
        });
    }

    var fun = function (source) {
        post_proportion = source['posts'];
        comment_proportion = source['comments']

        displayProportion(post_display, post_proportion);
        displayProportion(comment_display, comment_proportion);
    };

    data = {}

    getAjaxResult(url, data, fun);
}

/**
 * Get user archive by using ajax
 */
var getUserArchive = function (url, group_id, table, limit, page, search, paging) {
    var activity_url = "/api/groups/" + group_id + "/user_activity/";

    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            var row = results[i];
            var user_url = '/archive/user/' + row["id"] + '/';

            var async_data = {
                user_id: row["id"]
            }
            var activity = getAsyncAjaxResult(activity_url, async_data);

            rows.push({
                "picture": '<img src="' + row["picture"] + '" style="border-radius: 10px;">',
                "from": '<div class=" more-link"><a href="' + user_url + '"><div class="h5">' + row["name"] + '</div></a></div>',
                "post_count": activity["post_count"],
                "comment_count": activity["comment_count"],
            });
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
    }

    if (search) {
        data['q'] = search;
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get search post and comment by using ajax
 */
var getSearchPC = function (url, table, limit, search, page, paging) {
    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            pcDisplac(rows, results[i]);
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        q: search,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get search user by using ajax
 */
var getSearchU = function (url, group_id, table, limit, search, page, paging) {
    var activity_url = "/api/groups/" + group_id + "/user_activity/";

    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            var row = results[i];
            var user_url = '/archive/user/' + row["id"] + '/';

            var async_data = {
                user_id: row["id"]
            }
            var activity = getAsyncAjaxResult(activity_url, async_data);

            rows.push({
                "picture": '<img src="' + row["picture"] + '" style="border-radius: 10px;">',
                "from": '<div class=" more-link"><a href="' + user_url + '"><div class="h5">' + row["name"] + '</div></a></div>',
                "post_count": activity["post_count"],
                "comment_count": activity["comment_count"],
            });
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        q: search,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get archive for user by using ajax
 */
var getArchiveByUser = function (url, user_id, table, limit, from, page, paging) {
    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            pcDisplac(rows, results[i]);
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    if (!user_id) {
        return;
    }

    data = {
        user_id: user_id,
        limit: limit,
        offset: (page - 1) * limit,
        from: from,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get groups by using ajax
 */
var getGroups = function (url, table, limit, page, search, paging) {
    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            var row = results[i];
            var group_url = '/archive/group/' + row["id"] + '/';
            var privacy_btn = row["privacy"] == "CLOSED" ? 'disable' : '';
            rows.push({
                "id": '<div class=" more-link"><a href="' + group_url + '"><div class="h5">' + row["id"] + '</div></a></div>',
                "name": '<div class=" more-link"><a href="' + group_url + '"><div class="h5">' + row["name"] + '</div></a></div>',
                "updated_time": '<div class="h5"><i class="icon-realtime"></i> ' + timeSince(row["updated_time"]) + '</div>',
                "post_count": '<div class="h5">' + row["post_count"] + '</div>',
                "comment_count": '<div class="h5">' + row["comment_count"] + '</div>',
                "privacy": '<div class="h5">' + row["privacy"] + '</div>',
                "is_stored": row["is_stored"] ? '<i class="icon-check"></i>' : '<i class="icon-close"></i>',
                "update": '<a class="btn ' + privacy_btn + '" href="/archive/group/' + row["id"] + '/update/">Update</a>',
            });
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        q: search,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Generate Notify
 */
jui.ready(["ui.notify"], function (notify) {
    var handler = {
        show: function (data) {
            console.log("show : " + JSON.stringify(data));
        },
        hide: function (data) {
            console.log("hide : " + JSON.stringify(data));
        },
        click: function (data) {
            console.log("click : " + JSON.stringify(data));
        }
    };

    notify_1 = notify("body", {
        position: "top-right",
        event: handler,
        timeout: 2000,
        tpl: {
            item: $("#tpl_alarm").html()
        }
    });

    notify_2 = notify("body", {
        position: "top-left",
        event: handler,
        timeout: 2000,
        tpl: {
            item: $("#tpl_alarm").html()
        }
    });

    notify_3 = notify("body", {
        position: "top",
        event: handler,
        timeout: 2000,
        padding: {
            top: 100
        },
        tpl: {
            item: $("#tpl_alarm").html()
        }
    });

    notify_4 = notify("body", {
        position: "bottom",
        event: handler,
        timeout: 2000,
        distance: 30,
        tpl: {
            item: $("#tpl_alarm").html()
        }
    });

    notify_5 = notify("body", {
        position: "bottom-left",
        event: handler,
        timeout: 2000,
        showDuration: 1000,
        hideDuration: 1000,
        tpl: {
            item: $("#tpl_alarm").html()
        }
    });

    notify_6 = notify("body", {
        position: "bottom-right",
        event: handler,
        timeout: 2000,
        showEasing: "linear",
        tpl: {
            item: $("#tpl_alarm").html()
        }
    });

    notify_top_submit = function (type, data) {
        if (type == 1) notify_1.add(data);
        if (type == 2) notify_2.add(data);
        if (type == 3) notify_3.add(data);
        if (type == 4) notify_4.add(data);
        if (type == 5) notify_5.add(data);
        if (type == 6) notify_6.add(data);
    }
});

jui.ready(["ui.combo"], function (combo) {
    groups_combo = combo("#groups_combo", {
        index: 0,
        width: 200,
        keydown: true,
        event: {
            change: function (data) {
                location.href = data.value;
            }
        }
    });
});

/**
 * Get search post and comment for management by using ajax
 */
var getSearchPCM = function (url, table, limit, model, search, search_check, page, paging) {
    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            pcDisplacM(rows, results[i], model);
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        q: search,
        c: search_check,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get search user for management by using ajax
 */
var getSearchUM = function (url, group_id, table, limit, search, page, paging) {
    var activity_url = "/api/groups/" + group_id + "/user_activity/";

    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            var row = results[i];
            var user_url = '/archive/user/' + row["id"] + '/';

            var async_data = {
                user_id: row["id"]
            }
            var activity = getAsyncAjaxResult(activity_url, async_data);

            rows.push({
                "picture": '<img src="' + row["picture"] + '" style="border-radius: 10px;">',
                "from": '<div class=" more-link"><a href="' + user_url + '"><div class="h5">' + row["name"] + '</div></a></div>',
                "id": '<div class=" more-link"><a href="' + user_url + '"><div class="h5">' + row["id"] + '</div></a></div>',
                "post_count": activity["post_count"],
                "comment_count": activity["comment_count"],
            });
        }
        ;

        table.reset();
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        q: search,
    }

    getAjaxResult(url, data, fun);
}

/**
 * Get search blacklist for management by using ajax
 */
var getSearchBM = function (url, group_id, table, limit, search, page, paging) {
    var blacklist_url = "/api/groups/" + group_id + "/blacklist_user/";
    var activity_url = "/api/groups/" + group_id + "/user_activity/";

    var fun = function (source) {
        var results = source["results"];
        var rows = []
        for (var i in results) {
            var row = results[i];
            var user_url = '/archive/user/' + row["id"] + '/';

            var async_data = {
                user_id: row["id"]
            }
            var blacklist = getAsyncAjaxResult(blacklist_url, async_data);
            var activity = getAsyncAjaxResult(activity_url, async_data);

            rows.push({
                "picture": '<img src="' + row["picture"] + '" style="border-radius: 10px;">',
                "from": '<div class=" more-link"><a href="' + user_url + '"><div class="h5">' + row["name"] + '</div></a></div>',
                "id": '<div class=" more-link"><a href="' + user_url + '"><div class="h5">' + row["id"] + '</div></a></div>',
                "count": blacklist["count"],
                "post_count": activity["post_count"],
                "comment_count": activity["comment_count"],
                "updated_time": timeSince(blacklist["updated_time"]),
            });
        }
        ;

        table.reset()
        table.append(rows);
        if (paging) {
            paging.setOption("pageCount", limit);
            paging.reload(source["count"]);
        }
    }

    if (!page) {
        page = 1;
    }

    data = {
        limit: limit,
        offset: (page - 1) * limit,
        q: search,
    }

    getAjaxResult(url, data, fun);
}

