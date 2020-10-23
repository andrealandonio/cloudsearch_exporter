// Libraries
const AWS = require('aws-sdk');
const fs = require('fs');
const minimist = require('minimist');

// Define globals
const batchSize = 1000; // Number of item on every search... max: 10000
let counter = 0;
let result = [];

// Read args
const args = minimist(process.argv.slice(2));

// Read 'query' parameter
query = args['query'];
if (query == '' || query == undefined) {
	console.log('Error: Missing query');
	process.exit(1);
}

// Read 'file' parameter
file = args['file'];
if (file == '' || file == undefined) {
	console.log('Error: Missing output file');
	process.exit(1);
}

// Read 'endpoint' parameter
endpoint = args['endpoint'];
if (endpoint == '' || endpoint == undefined) {
	console.log('Error: Missing CloudSearch endpoint');
	process.exit(1);
}

// Read 'region' parameter
region = args['region'];
if (region == '' || region == undefined) {
	region = 'eu-west-1';
}

// Define AWS configuration
AWS.config.update({
    region: region,
    endpoint: endpoint
});

// Launch search
launchSearch();

// Search data
function launchSearch(context = null) {
    process.stdout.write('Launch AWS.CloudSearch ');

    if (context === null) {
        process.stdout.write('initial request ... ');
    }
    else {
        let current = (context.start / batchSize) + 2 ;
        let totalRun = (Math.ceil(context.found / batchSize  * 10) / 10) + 1;
        process.stdout.write('( ' + current + ' / ' + totalRun + ' ) ... ');
    }

    // Prepare search query and filters
    params = {
        query: query,
        cursor: (context === null) ? "initial" : context.cursor,
        size: batchSize
    };

    let searchCursor = new AWS.CloudSearchDomain(params);
    let resultMessage;

    // Search data opening cursor
    searchCursor.search(params, function(err, data) {
        if (err) {
            // Errors during search
            console.log("Failed with params:" + err);
        }
        else {
            resultMessage = data;
            counter = counter + data.hits.hit.length;
            // Loop over data
            for (let i = 0; i < data.hits.hit.length; i++) {
                // Add data to result array
                result.push(data.hits.hit[i]);
            }
        }

        process.stdout.write(resultMessage.hits.hit.length + ' hits found.');

        if (resultMessage.hits.hit.length === 0) {
            // No other data, write results to file
            process.stdout.write('\nDone.\nLet\'s create the file...\n');
            writeToFile(result);
        }
        else {
            // Other data, search again (recursive loop)
            let currentContext = {};
            process.stdout.write('\n');
            currentContext.cursor = resultMessage.hits.cursor;
            currentContext.start = resultMessage.hits.start;
            currentContext.found = resultMessage.hits.found;
            currentContext.retrived = resultMessage.hits.hit.length;

            launchSearch(currentContext);
        }
    });
}

// Write data
function writeToFile(result) {
    fs.writeFile(file, JSON.stringify(result), function(err) {
        if (err) {
            // Error during save
            return console.log(err);
        }
    });
    process.stdout.write("Done.\nFile '"+ file + "' generated  ( " + counter + " elements ).\n");
}
