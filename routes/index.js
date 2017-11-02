var express = require('express');
var router = express.Router();
var Scraper = require('image-scraper');
var scraper = new Scraper('http://apod.nasa.gov/apod/astropix.html');
var urlExists = require('url-exists');
const axios = require("axios");


Scraper.prototype.scrapeAsync = function(ms) {
    var ref = this; // same coding style as in existing methods.
    var images = [];
    return new Promise(function(resolve, reject) {
        ref.on('image', (image) => {
            if (image != null)
                images.push(image)
        })
        ref.on('end', () => { resolve(images) })
        //ref.on('error', reject); // unfortunately image-scraper doesn't emit an 'error' event.
        if(ms !== undefined) {
            setTimeout(function(){ reject("timeout"); }, 3000);
        }
        ref.scrape();
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/images/*', function(req, res, next) {

  var url = req.params[0];

    urlExists(url, function(err, exists) {
        console.log("urlExists: " + exists); // true

        if (exists == true)
        {
            axios
                .get(url)
                .then(response => {
                    console.log(response.request.res.responseUrl);

                        scraper.address = response.request.res.responseUrl;

                        scraper.scrapeAsync(30000).then((images) => {
                            // process the `images` array here.
                            if (images != null)
                                res.send(JSON.stringify(images));
                            else
                                res.send({});
                        }).catch(function(err){
                            console.log(err);
                            res.send({});
                        });

                })
                .catch(error => {
                    console.log(error);
                    res.send({});
                });
        }
        else
        {
            res.send({});
        }
    });

});

module.exports = router;
