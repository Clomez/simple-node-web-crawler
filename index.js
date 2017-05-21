var request = require('request');
var cheerio = require("cheerio");
var URL = require("url-parse");

var startPage = "https://www.moontv.fi/";
var wordSearch = "nigger";
var maxPages = 1000;

var PagesVisited = {};
var NumPagesVisited = 0;
var PagesToVisit = [];
var url = new URL(startPage);
var baseUrl = url.protocol + "//" + url.hostname;
var results = [];
var strangeResults =[];
var errorsearch = true;



PagesToVisit.push(startPage);
crawl();

function crawl(){

    try{
        if(NumPagesVisited > maxPages){
            console.log("Max page amount visited");
            if (errorsearch === false){
                console.log("Results: ");
                for (var i=0; i<results.length;i++){
                    console.log(results[i]);

                }
            }else{
                console.log("Stranges Results: ");
                for (var x=0; i<strangeResults.length;x++){
                    console.log(strangeResults[x]);
                }
            }
        return
        }
        var nextPage = PagesToVisit.pop();
        if(nextPage in PagesVisited){
            crawl();
            return
        }else if(nextPage == undefined){
            console.log("-------------------------------");
            console.log("[-] SCAN FINISHED NO MORE LINKS");
            console.log("[-} Pages visited: " + NumPagesVisited);
            console.log("-------------------------------");
            return
        }
        else {

            if((NumPagesVisited % 10) === 0){
                visitPage(nextPage, crawl);
                console.log("[-} Pages visited: " + NumPagesVisited + ", Links to check: " + PagesToVisit.length);
                return
            }else {
                visitPage(nextPage, crawl);
                return
            }
        }
    }catch (err) {
        console.log(err);
        crawl();
    }
}

function visitPage(url, callback) {
    // Add page to our set
    PagesVisited[url] = true;
    NumPagesVisited++;

    // Make the request
    //console.log("now visiting page " + url);
    request(url, function(error, response, body) {
        if(response.statusCode !== 200) {
            strangeResults.push(response.statusCode);
            console.log(response.statusCode + " @ page: " + url);
            callback();
            return;
        }
        else if(response.statusCode == undefined){
            console.log("[-] Response was undefined")
            callback();
        }
        // Parse the document body
        var $ = cheerio.load(body);
        var isWordFound = searchWord($, wordSearch);
        if(isWordFound) {
            console.log('[+] Word ' + wordSearch + ' found at page ' + url);
            results.push(url);
            collectLinks($);
            callback();
        } else {
            collectLinks($);
            callback();
        }
    });
}


function searchWord($, word){
    var bodyText = $("html > body").text().toLowerCase();
    return(bodyText.indexOf(word.toLowerCase()) !== -1);

}

function collectLinks($){
    var allAbsolute = [];
    var allRelative = [];

    var relativeLinks =$("a[href^='/']");

    //COLLECT RELATIVE
    relativeLinks.each(function (){
        allRelative.push($(this).attr('href'));
        PagesToVisit.push(baseUrl + $(this).attr('href'));
    });
    //COLLECT ABSOLUTE
    var absoluteLinks = $("a[href^='http']");
    absoluteLinks.each(function() {
        allAbsolute.push($(this).attr('href'));
    });
    if(NumPagesVisited === 1){
        console.log("[+] Found " + allRelative.length + " relative links to start with" + " and " + allAbsolute.length + " absolute links" + "\r");
    }



}