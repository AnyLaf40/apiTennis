exports.getDate = function(){
    var completeDate = new Date()

    var d = completeDate.getDate();
    if (d < 10) {
        d = "0" + d
    }
    var mo=completeDate.getMonth();
    if (mo < 10) {
        mo = "0" + (mo+1)
    }
    var y = completeDate.getFullYear();
    if (y < 10) {
        y = "0" + y
    }
    var date = d + "/" + mo + "/" + y;

    return date;
}