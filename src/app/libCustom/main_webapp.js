/////////////////////////////////////////////////////
////////////////// VISUALIZE ///////////////////////
//////////////////////////////////////////////////////


$(document).ready(function () {
    alert("ss")
    // debugger
    $(".customize .step2 .next").hide()

    setDisplay(tempSend["typeMap"], tempSend["year1"], tempSend["year2"])


    $(".ShowDM").on("click", function () {
        console.log(GeoJsonList)
        // debugger
        update_getGee(undefined, undefined, "pca", map, "sst")

    })

    $(".S1").on("change", function () {
        tempSend["modeUSE"] = $(this).val()
        console.log(tempSend)
    })

    $(".customize .next").on("click", function (e) {

        e.preventDefault()
        console.log(tempSend)
        console.log("SSSSSSSSSSSSSSS")
        var temp = $(this).parent().parent()
        if (temp.next().attr("class") !== undefined) {
            if (temp.next().attr("class") == "step3") {

                if (map === undefined) { map = genMap("mapV") }

                var year1Start = `${tempSend["year1"]}-${getMonth(tempSend["month1"])}-01`
                var year2Start = `${tempSend["year2"]}-${getMonth(tempSend["month2"])}-01`

                var temp_index = tempSend["type_index"]
                update_getGee(year1Start, year2Start, tempSend["dataset"], map, temp_index)
                
                console.log(tempSend)
            }
            temp.hide()
            temp.next().fadeIn(500)
        }
    })

    $(".customize .pre").on("click", function (e) {
        e.preventDefault()
        var temp = $(this).parent().parent()

        if (temp.prev().attr("class") !== undefined) {
            temp.hide()
            temp.prev().fadeIn(500)
        }
    })

    $(".yearS").on("change", function () {
        $(".yearS option:selected").each(function (index) {
            console.log(this)
            tempSend["year1"] = this.value
            checkStep2()
        })
    })

    $(".monthS").on("change", function () {
        $(".monthS option:selected").each(function (index) {
            console.log(this)
            tempSend["month1"] = this.value
            checkStep2()
        })
    })

    $(".yearS2").on("change", function () {
        $(".yearS2 option:selected").each(function (index) {
            console.log(this)
            tempSend["year2"] = this.value
            console.log(tempSend["year2"])
            checkStep2()
            debugger
        })
    })

    $(".monthS2").on("change", function () {
        $(".monthS2 option:selected").each(function (index) {
            console.log(this)
            tempSend["month2"] = this.value
            checkStep2()
        })
    })

    $(".typeMap").on("change", function () {
        $(".typeMap option:selected").each(function (index) {
            console.log(this)
            tempSend["dataset"] = this.value
            checkStep2()
        })
    })

    $(".type_index").on("change", function () {
        $(".type_index option:selected").each(function (index) {
            console.log(this)
            tempSend["type_index"] = this.value
            debugger
            checkStep2()
        })
    })

});

function setDisplay(dataset, date_range1, date_range2) {
    $(".typeMapShow").html(dataset)
    $(".dateRange1").html(date_range1)
    $(".dateRange2").html(date_range2)
}

function getMonth(monthName) {
    var monthArr = ["- Non select -", "January", "February", "March", "April", "May", "June", "July", "August	", "September", "October", "November", "December"]
    // console.log(monthArr.indexOf(monthName))
    var result = ""
    if(monthArr.indexOf(monthName) <= 9){
        result = `0${monthArr.indexOf(monthName)}`
    }else{
        result = `${monthArr.indexOf(monthName)}`
    }
    return result
}

function checkStep2() {
    if (tempSend["year1"] === "- Non select -" || tempSend["month1"] === "- Non select -" || tempSend["year2"] === "- Non select -" || tempSend["month2"] === "- Non select -" || tempSend["dataset"] === "- Non select -" || tempSend["type_index"] === "- Non select -") {
        console.log("cant next")
        $(".customize .step2 .next").hide()
        return
    }

    $(".customize .step2 .next").fadeIn(500)
    $(".step2 p.statusCant").html("Can next")
}
