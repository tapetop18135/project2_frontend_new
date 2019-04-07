import * as $ from 'jquery';

$(document).ready(function(){
    toggleclass()
});

function toggleclass(){
    
    $(".navC li a").on("click", function (e) {
        e.preventDefault()
        $(".navC li a").each(function (index) {
            $(this).removeClass("active")
        })
        $(this).addClass("active")
    })

};