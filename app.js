const express = require("express");
const bodyParser = require("body-parser");
const voucher_codes = require("voucher-code-generator");
const nodemailer = require("nodemailer");
const fs = require("fs");
// const csv = require("csvtojson");
let converter = require("json-2-csv");

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Define valid API keys (in a real-world scenario, store these securely)
const validApiKeys = ["hfnjdvskNVBj45r45t4", "123j4hjksdnfbkadshf"];

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "18e399756e2d33",
    pass: "3f123b0841a6f6",
  },
});

// Middleware function to check the API key
function checkApiKey(req, res, next) {
  const apiKey = req.headers["api-key"];
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    res.status(403).json({ error: "Invalid API key" });
  } else {
    next();
  }
}

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.post("/webhook", bodyParser.text(), async function (req, res) {
  var code = validateEmail(req.body);
  const info = await transport.sendMail({
    from: '"utility 👻" <foo@example.com>',
    to: req.body.toString(),
    subject: "API Key",
    text: code.toString(),
  });

  // var result = sendKey(req.body.toString(), code);
  res.send(info);
});

//  JSON to CSV

app.post(
  "/json2csv",
  bodyParser.json(),
  checkApiKey,
  async function (req, res, next) {
    if (typeof req.body == "undefined" || req.body == null) {
      res.json(["error", "No data found"]);
    } else {
      let csv = await converter.json2csv(req.body);
      res.json(["csv", csv]);
    }
  }
);

// CSV to JSON

app.post(
  "/csvtojson",
  bodyParser.text(),
  checkApiKey,
  async function (req, res, next) {
    if (typeof req.body == "undefined" || req.body == null) {
      res.json(["error", "No data found"]);
    } else {
      const json = csvToJson(req.body);
      res.json(["json", json]);
    }
  }
);

// CSV to XML

app.post(
  "/csvtoxml",
  bodyParser.text(),
  checkApiKey,
  function (req, res, next) {
    if (typeof req.body == "undefined" || req.body == null) {
      res.json(["error", "No data found"]);
    } else {
      const xml = csvToXml(req.body);
      res.send(xml);
    }
  }
);

app.listen(3000, function () {
  console.log("Server running on http://localhost:3000");
});

// async function convertCSV(path) {
//   // let rawdata = fs.readFileSync(path);
//   // let data = JSON.parse(rawdata);
//   let data = req.body;
//   console.log(data);
//   let csv = await converter.json2csv(data);
//   console.log(csv);
//   fs.writeFileSync("students.csv", csv);
// }

// async function convertJSON(path) {
//   fs.readFile(path, "utf8", async function (e, data) {
//     var dataArray = data.split(/\r?\n/);
//     console.log(dataArray);
//     const json = await csv().fromString(path);
//     console.log(json);
//   });
// }

function validateEmail(email) {
  var validRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var email = email.toString();
  if (email.match(validRegex)) {
    const code = voucher_codes.generate({
      pattern: "#####-#####-#####-#####-#####-#####",
    });
    return code;
  } else {
    return email + "is not valid";
  }
}

function csvToJson(csv) {
  // \n or \r\n depending on the EOL sequence
  const lines = csv.split("\n");
  const delimeter = ",";

  const result = [];

  const headers = lines[0].split(delimeter);

  for (const line of lines) {
    const obj = {};
    const row = line.split(delimeter);

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      obj[header] = row[i];
    }

    result.push(obj);
  }

  // Prettify output
  return result;
}

function csvToXml(csv) {
  const lines = csv.split("\n");
  const delimiter = ",";
  const headers = lines[0].split(delimiter);

  let xml = "<data>";

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter);
    xml += "<row>";
    for (let j = 0; j < headers.length; j++) {
      xml += `<${headers[j]}>${values[j]}</${headers[j]}>`;
    }
    xml += "</row>";
  }

  xml += "</data>";
  return xml;
}

async function sendKey(receiver, msg) {
  const info = await transport.sendMail({
    from: '"utility 👻" <foo@example.com>', // sender address
    to: receiver, // list of receivers
    subject: "API Key", // Subject line
    text: msg, // plain text body
  });

  return info.messageId;
}
