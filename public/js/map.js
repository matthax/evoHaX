$(document).ready(function () {
    var septa = window.septa = window.septa || {};
    
    septa.transitView = function (route) {
        $.ajax({
            url: 'http://www3.septa.org/beta/TransitView/' + encodeURIComponent(route),
            success: function (data, xhr) {
                septa.transitView.last = { data: data, xhr: xhr };
                console.log(data, xhr);
            }
        });
    };
});