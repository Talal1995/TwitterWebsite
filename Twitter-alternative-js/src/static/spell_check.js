/*
This script will perform a POST request in JSON format with a string 
to Google Translate's API in order to get it spelled checked. Translation
is not used. 

@author August Arnoldsson-Sukanya, Haris Obradovac, Talal Attar
@date 2019-12-18


*/

$(document).ready(function(){

    let final_url = new URL("https://translation.googleapis.com/language/translate/v2");

    let time_to_wait_timeout = null;
    let time_to_wait_interval = null;
    const CONST_WAIT_MILLISECONDS = 2000.0;
    let wait_milliseconds = CONST_WAIT_MILLISECONDS;
    let response = null;

    setInterval(function(){
        /*

        If the tweet TextArea element (#tweet_box) does not contain 
        any characters, then a POST request to the Google Translate API 
        should not be made. The counter for time to wait is reset to DEFAULT value (CONST_WAIT_MILLISECONDS)
        and the graphical counter on the website is hidden.  

        Function checks for empty input every 100ms
    
        */
        if($("#tweet_box").val() == ""){
            wait_milliseconds = CONST_WAIT_MILLISECONDS;
            clearInterval(time_to_wait_interval);
            clearTimeout(time_to_wait_timeout);
            $("#counter").text("");
        }
    }, 100);


    $("#tweet_box").on("input",function(){

        /*

        Delete the timer for time to wait before POST:ing 
        request to google translate API.

        */
        clearTimeout(time_to_wait_timeout);

        /*

        Delete the interval (for loop) that calculates the 
        remaining time displayed to the user in the browser.

        */
        clearInterval(time_to_wait_interval);

        // Reset to wait 2 more seconds for user input
        wait_milliseconds = CONST_WAIT_MILLISECONDS;



        time_to_wait_interval = setInterval(function(){
            /*

            Print the timer to an HTML element on the webpage.
            The purpose of this function is to display to the user
            how many seconds that remain before their input is
            POST:ed to the google translate API. 
            
            The timer in the browser is updated once ever 100ms.

            */
            $("#counter").text(wait_milliseconds / 1000);
            if(wait_milliseconds == 0){
                clearInterval(time_to_wait_interval);
            }
            wait_milliseconds = wait_milliseconds - 100;
        },100);


        if($("#tweet_box").val() != ""){
            time_to_wait_timeout = setTimeout(function(){
                /*
                If the input TextArea is not empty and the 
                user is not typing anything, then the script
                will wait for the specified amount of milliseconds
                before creating a JSON POST request. 
                */
                let query = $("#tweet_box").val();
                final_url.searchParams.set("q", query);
                final_url.searchParams.set("source", "sv");
                final_url.searchParams.set("target", "de");
                final_url.searchParams.set("format", "text");
                final_url.searchParams.set("key", "AIzaSyBTDzIj_t-MnbSckUjuX4oMpSwyLc5LLYM");

                let xhttp = new XMLHttpRequest();
                xhttp.open('POST', final_url, true);
                xhttp.setRequestHeader('Content-Type','application/json; charset=utf-8');
                xhttp.send();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        let response = JSON.parse(this.response);
                        for(var entry in response.data.translations){
                            var translated_text = (response.data.translations[entry].translatedText);
                        }
                        $("#translation_results").text(translated_text);
                    }
                };
            }, wait_milliseconds);
        }
    });
    /*function login() {
        if ($("#log_in").onclick ) {
            $("#twitter_status").text("Twitertp has been logged in to twitter")
        }
            }*/
        /*var twitert_status = document.getElementById('twitter_status');
        var content = document.getElementById('twitter_status');
        twitert_status.onclick = function() {
            content.innerHTML = ('Twitertp has been logged in to twitter');
        };*/
});