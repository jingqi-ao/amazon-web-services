// AWS Polly Server

var fs = require('fs-extra');
var async = require('async');

var https = require('https');

var express = require('express');
var app = express();

var AWS = require('aws-sdk');


var port = null;
if(process.env.SERVER_PORT) {
    port = process.env.SERVER_PORT;
    console.log("process.env.SERVER_PORT is: " + process.env.SERVER_PORT);
} else {
    port = 8443;
    console.log("process.env.SERVER_PORT is NOT set. Use default port " + port);
}

if(!process.env.AWS_ACCESS_KEY_ID) {
    console.log("Error: process.env.AWS_ACCESS_KEY_ID is NOT set.");
    process.exit(1);
}

if(!process.env.AWS_SECRET_ACCESS_KEY) {
    console.log("Error: process.env.AWS_SECRET_ACCESS_KEY is NOT set.");
    process.exit(1);
}

// AWS related settings
var polly = new AWS.Polly({
    region: 'us-east-1',
    apiVersion: '2016-06-10',
    correctClockSkew: true
});

// Setup HTTPS server
var options = {
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.crt')
};

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json

https.createServer(options, app).listen(port, function () {

    console.log('aws polly server is running at: ' + port);

});


function getLanguageCode(language) {
    var languageCodeMap = {
        "English US": "en-US",
        "Japanese": "ja-JP"
    }

    var languageCode = languageCodeMap[language];

    // Return null if the language is NOT supported
    if(!languageCode) {
        language = null;
    }

    return languageCode;
}

app.post('/api/v1/polly', function(req, res) {

    console.log("/api/v1/polly: body");
    console.log(req.body);

    if(!req.body.inputString) {
        res.status(400).send("req.body.inputString is NOT provided.");
        return;
    }
    var inputString = req.body.inputString;

    if(!req.body.language) {
        res.status(400).send("req.body.language is NOT provided.");
        return;
    }
    var language = req.body.language;    

    var languageCode = getLanguageCode(language);

    if(languageCode == null) {
        res.status(403).send("Language=" + language + " is NOT supported.");
        return;
    }

    async.waterfall([

        function(callback) {
            // Find all voices
            var params = {
                LanguageCode: languageCode
            };

            console.log("test");
            console.log(polly);

            polly.describeVoices(params, function(err, data) {

                if(err) {
                    console.log(err);
                    callback(err);
                    return;
                }

                console.log(data);
                callback(null, data);

            });


        },
        function(data, callback) {
            // Pick a AWS polly voice
            // - Pick a female voice, if there are multiple ones, pick the first one
            // - If no female voice, picke the first voice

            var voices = data.Voices;

            var i = 0;

            // the default voice is the first voice
            var finalVoice = voices[0];

            for(i = 0; i < voices.length; i++) {
                voice = voices[i];
                if(voice.Gender === "Female") {
                    // Pick the first female voice
                    finalVoice = voice;
                    break;
                }
            }

            callback(null, finalVoice);

        },
        function(data, callback) {

            var voiceId = data.Id;

            // Synthesize the sound
            var params = {
              OutputFormat: 'mp3', 
              Text: inputString,
              VoiceId: voiceId,
              LexiconNames: [],
              SampleRate: '16000',
              TextType: 'text'
            };

            polly.synthesizeSpeech(params, function(err, data) {

                if(err) {
                    console.log(err);
                    callback(err);
                    return;
                }

                console.log(data);

                /* data sample structure:
                { ContentType: 'audio/mpeg',
                  RequestCharacters: '15',
                  AudioStream: <Buffer 49 44 33 04  00 00 00 00 00 ff f3 58 c4 00 ... > }
                */

                callback(null, data);

            });
        }

    ], function (err, result) {

        if(err) {

            console.log(err);

            res.status(500).send(JSON.stringify(err));
            return;
        }

        // TEST ONLY
        //fs.writeFileSync('/tmp/polly-service/synthesized.wav', result.AudioStream, 'binary');
        // TEST ONLY (END)

        res.status(200).send(result.AudioStream);

    });

});
