# CloudSearch exporter

A simple AWS CloudSearch exporter from an index query to a file.

## How-to

Using the AWS credentials in your machine (use aws configure to set it) the script search into a CloudSearch index for a provided query and then save all the results to a specified file.

## Install

After downloading the repo, just run:

```
npm install
```

## Use

After downloading all the dependencies, just use:

```
node index.js --query="<your_query>" --file=<your_file> --endpoint=<your_cloudsearch_endpoint> --region=<your_cloudsearch_region>
```

You can provide 4 input parameters:

* query: the search query (*required*)
* file: the output filename (*required*)
* endpoint: the CloudSearch index endpoint (*required*)
* region: the AWS region of the CloudSearch index (otherwise 'eu-west-1' will be used)
