# Bonds Checker
## Description
A simple REST API that allows users to upload a base64 encoded PDF of their Premium Bonds breakdown. This will return whether they are on the 'Big Winners' list that NS&I publish on the 1st of each month. You are not notified of the win until usually the 2nd, so this is for those of us who are as impatient as I am.

The PDF is not uploaded anywhere, and only the table that contains the bond numbers are even parsed. The rest of the PDF is ignored. You can redact all personal information from the PDF, as long as the Bond Number table remains untouched and also the file isn't cropped. 

## Usage
### Uploading a PDF
To upload a PDF, you must send a POST request to the `/check` endpoint. The request must contain a JSON body with the following structure:
```json
{
    "bondRecord": "base64 encoded PDF"
}
```

The response will be an array of all winning bond numbers. The array will be empty if no winning bonds are found. They will be in the following format:
```json
[
  {
    "prizeValue": "1000000",
    "bondNumber": "522MP682337"
  }
]
```

### Running the API
To run the API, you must have NodeJS installed and also have AWS credentials setup locally (https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html). 

To run the API locally or deploy yourself you will need to run 

```bash
npm install
npm run deploy
```

This will create a CloudFormation stack that will create all the required resources. This will also enable you to run the API locally using the `serverless-offline` plugin.

To start the API locally you can run 
```bash
npm run start
```

The API will then be accessible on `http://localhost:3000/dev`
