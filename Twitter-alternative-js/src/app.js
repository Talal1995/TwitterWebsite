/*
    @description Projektgrupp 10's backend for Twitert 
    @author August Arnoldsson-Sukanya, Haris Obradovac, Talal Attar
    @date 2019-12-22
*/


/*
    Node.js requirements
*/
const express = require('express');
const path = require('path');
const request = require('request');
const crypto = require('crypto');
const bodyParser = require('body-parser');

/*
    Node.js application instances
*/
const app = express();
const router = express.Router();


/*
    Node.js application attributes
*/
const port = 5000;

var oauth_access_token    = "";
var oauth_secret_token    = "";
var oauth_secret_received = "";
var oauth_token_received  = "";
var tweet = "";
app.use(express.static(path.join(__dirname+'/static'), {index:false}));
app.use('/', router);
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

/*
    Application utility functions
*/
var create_nonce = function(nonce_length) {
    /*
        This function will create a nonce (arbitrary number than can be used only once)
        of paramater length for OAuth communication. 

        @param nonce_length the length of the nonce 
        @return the constructed nonce
    */

    var charset = "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789";
    var text    = "";
    for (var iteration = 0; iteration < nonce_length; iteration++){
        text += charset.charAt(Math.round(Math.random() * charset.length));
    }
    return text;
}


/*
    Node.js backend routing options
*/
router.get('/', function(req, res){
    /*
        This will route the user to our homepage and render its html file
    */

    res.sendFile(path.join(__dirname,'static/nyhemsida.html'))
});

/*
    Routes back to tweeting page
 */
router.get('/tweet', function (req, res) {
    res.sendFile(path.join(__dirname, 'static/index.html'))

});


router.get('/oauth/request_token', function(req, res){
    /*
        Step 1: POST oauth/request_token
        This is the first step in the three-legged OAuth process of obtaining 
        user access tokens. When the user GET:s this URL a POST request is 
        made with relevant parameters (see next paragraph).  
    */


    /*
        Percent-encoded request token parameters.
        'oauth_signature' is initialized to empty string and generated 
        below.
    */
    var oauth_consumer_key     = encodeURIComponent("u7ceyMH4T6OLGpWhdHF5KmLw3");
    var oauth_signature_method = encodeURIComponent("HMAC-SHA1");
    var oauth_signature        = encodeURIComponent("");
    var oauth_timestamp        = encodeURIComponent(Math.round((new Date).getTime() / 1000)); //divide to convert ms => s
    var oauth_nonce            = encodeURIComponent(create_nonce(32));
    var oauth_version          = encodeURIComponent("1.0");
    var oauth_callback         = encodeURIComponent("http://127.0.0.1:5000/test");

    // POST request endpoint url
    var api_url                = "https://api.twitter.com/oauth/request_token";
    
    /*
        Consumer API secret key (note: '&' appendage at end. This will be used
        to concatenate the oauth_token_secret in different scenarios that 
        requires OAuth - like authorizing a request).
    */ 
    var secret_key             = encodeURIComponent("5zUSj4WmfzCSXWlQh5a7e7quXMtv6au2pYIVjOOExVWtm7HTMh")+"&";


    /*
        Create the base string used for OAuth signature
        Parameters must be sorted alphabetically. 
        note: oauth paramaters are percent-encoded twice for the base string, but
        it shouldn't matter. 
        The signature_base_string is constructed of 3 items, each concatenated with &:
            - the HTTP method (POST)
            - percent-encoded API endpoint
            - percent-encoded parameters
    */
    var parameters             = encodeURIComponent(`oauth_callback=${oauth_callback}&oauth_consumer_key=${oauth_consumer_key}&oauth_nonce=${oauth_nonce}&oauth_signature_method=${oauth_signature_method}&oauth_timestamp=${oauth_timestamp}&oauth_version=${oauth_version}`);
    var signature_base_string  = 'POST' + '&' + encodeURIComponent(api_url) + '&' + parameters;
  

    /*
        Create OAuth signature by applying the HMAC-SHA1 algorithm to our 
        consumer API secret (secret_key) and base string (signature_base_string).
        The signature is then encoded to Base64, which is in turn percent-encoded. 
    */
    oauth_signature = encodeURIComponent(crypto.createHmac('sha1', secret_key).update(signature_base_string).digest('base64'));

    /*
        Create the POST request by supplying its necessary attributes.
        @key url the API endpoint we wish to POST to.
        @key headers the headers that we wish to send with the POST request.
        @key headers @key Authorization an authorization header of type OAuth that contains the necessary paramaters to complete the request and receive a proper response (note: paramater keys are sorted alphabetically)
        @key headers @key Content-Type specifies that the request is sending text/ASCII content
    */
    var options = {
        url: api_url,
        headers: {
            'Authorization': `OAuth oauth_callback=${oauth_callback}, oauth_consumer_key=${oauth_consumer_key}, oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method=${oauth_signature_method}, oauth_timestamp=${oauth_timestamp}, oauth_version=${oauth_version}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    /*
        Step 1: POST oauth/request_token
    */
    request.post(options, function(error, response, body){
        oauth_token_received = body.substring(body.indexOf('=') + 1, body.indexOf('&'));
        oauth_secret_received = body.substring(body.indexOf('=', body.indexOf('=') + 1) + 1, body.indexOf('&', body.indexOf('&') + 1));
        console.log(oauth_token_received);
        console.log(oauth_secret_received);

        // Step 2: GET oauth/authorize
        res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token_received);
    });
})


// Callback url
router.get('/test', function(req, res){
    req.body;
    var oauth_consumer_key     = encodeURIComponent("u7ceyMH4T6OLGpWhdHF5KmLw3");
    var oauth_signature_method = encodeURIComponent("HMAC-SHA1");
    var oauth_signature        = encodeURIComponent("");
    var oauth_timestamp        = encodeURIComponent(Math.round((new Date).getTime() / 1000)); //divide to convert ms => s
    var oauth_nonce            = encodeURIComponent(create_nonce(32));
    var oauth_version          = encodeURIComponent("1.0");

    // POST request endpoint url
    var api_url                = 'https://api.twitter.com/oauth/access_token';
    
    /*
        Consumer API secret key (note: '&' appendage at end. This will be used
        to concatenate the oauth_token_secret in different scenarios that 
        requires OAuth - like authorizing a request).
    */ 
    var secret_key             = encodeURIComponent("5zUSj4WmfzCSXWlQh5a7e7quXMtv6au2pYIVjOOExVWtm7HTMh")+"&"+encodeURIComponent(oauth_secret_received);


    /*
        Create the base string used for OAuth signature
        Parameters must be sorted alphabetically. 
        note: oauth paramaters are percent-encoded twice for the base string, but
        it shouldn't matter. 
        The signature_base_string is constructed of 3 items, each concatenated with &:
            - the HTTP method (POST)
            - percent-encoded API endpoint
            - percent-encoded parameters
    */
    var parameters             = encodeURIComponent(`oauth_consumer_key=${oauth_consumer_key}&oauth_nonce=${oauth_nonce}&oauth_signature_method=${oauth_signature_method}&oauth_timestamp=${oauth_timestamp}&oauth_token=${req.query["oauth_token"]}&oauth_verifier=${req.query["oauth_verifier"]}&oauth_version=${oauth_version}`);
    var signature_base_string  = 'POST' + '&' + encodeURIComponent(api_url) + '&' + parameters;
  

    /*
        Create OAuth signature by applying the HMAC-SHA1 algorithm to our 
        consumer API secret (secret_key) and base string (signature_base_string).
        The signature is then encoded to Base64, which is in turn percent-encoded. 
    */
    oauth_signature = encodeURIComponent(crypto.createHmac('sha1', secret_key).update(signature_base_string).digest('base64'));

    /*
        Create the POST request by supplying its necessary attributes.
        @key url the API endpoint we wish to POST to.
        @key headers the headers that we wish to send with the POST request.
        @key headers @key Authorization an authorization header of type OAuth that contains the necessary paramaters to complete the request and receive a proper response (note: paramater keys are sorted alphabetically)
        @key headers @key Content-Type specifies that the request is sending text/ASCII content
    */
 

    var options = {
        url: "https://api.twitter.com/oauth/access_token",
        headers: {
            'Authorization' : `OAuth oauth_consumer_key=${oauth_consumer_key}, oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method=${oauth_signature_method}, oauth_timestamp=${oauth_timestamp}, oauth_token=${req.query["oauth_token"]}, oauth_verifier=${req.query["oauth_verifier"]}, oauth_version=${oauth_version}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }

    request.post(options, function(error, response, body){
        oauth_access_token = body.substring(body.indexOf('=') + 1, body.indexOf('&'));
        oauth_secret_token = body.substring(body.indexOf('=', body.indexOf('=') + 1) + 1, body.indexOf('&', body.indexOf('&') + 1));
        console.log("ACCESS TOKEN: \n" + oauth_access_token);
        console.log("SECRET TOKEN: \n" + oauth_secret_token);
        res.redirect('/tweet');
    });
});

router.post('/post', function(req, res){
    tweet = req.body.translation;
    res.redirect('/post')
});

router.get('/post', function(req, res){
    var oauth_consumer_key     = encodeURIComponent("u7ceyMH4T6OLGpWhdHF5KmLw3");
    var oauth_signature_method = encodeURIComponent("HMAC-SHA1");
    var oauth_signature        = encodeURIComponent("");
    var oauth_timestamp        = encodeURIComponent(Math.round((new Date).getTime() / 1000)); //divide to convert ms => s
    var oauth_nonce            = encodeURIComponent(create_nonce(32));
    var oauth_version          = encodeURIComponent("1.0");

    var api_url                = "https://api.twitter.com/1.1/statuses/update.json";

    var secret_key             = encodeURIComponent("5zUSj4WmfzCSXWlQh5a7e7quXMtv6au2pYIVjOOExVWtm7HTMh")+"&"+encodeURIComponent(oauth_secret_token);

    var parameters             = encodeURIComponent(`oauth_consumer_key=${oauth_consumer_key}&oauth_nonce=${oauth_nonce}&oauth_signature_method=${oauth_signature_method}&oauth_timestamp=${oauth_timestamp}&oauth_token=${oauth_access_token}&oauth_version=${oauth_version}&status=${encodeURIComponent(tweet)}`);

    var signature_base_string  = 'POST' + '&' + encodeURIComponent(api_url) + '&' + parameters;

    var oauth_signature        = encodeURIComponent(crypto.createHmac('sha1', secret_key).update(signature_base_string).digest('base64'));
        
    var options = {
        url: api_url+`?status=${encodeURIComponent(tweet)}`,
        headers: {
            'Authorization': `OAuth oauth_consumer_key=${oauth_consumer_key}, oauth_nonce=${oauth_nonce}, oauth_signature=${oauth_signature}, oauth_signature_method=${oauth_signature_method}, oauth_timestamp=${oauth_timestamp}, oauth_token=${oauth_access_token}, oauth_version=${oauth_version}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    request.post(options, function(error, response, body){
        res.redirect('/tweet');
    });
});

app.listen(port, function(){
    console.log(`Server running on 127.0.0.1:${port}`);
});
