require("dotenv").config();

const fs = require("fs");

const { URL, USERNAME, PASSWORD } = process.env;

const { chromium } = require("playwright"); // Or 'firefox' or 'webkit'.

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto("http://10.220.4.5/");
  await page.click(
    "body > fieldset > form > p:nth-child(3) > input[type=submit]"
  );
  await page.click("#m > span > input[type=submit]:nth-child(3)");
  let rows = [];
  let lastRow = null;
  let loop = true;
  while (loop) {
    const data = await page.evaluate(() => {
      function tableToJson(table) {
        var data = [];
        for (var i = 1; i < table.rows.length; i++) {
          var tableRow = table.rows[i];
          var rowData = [];
          for (var j = 0; j < tableRow.cells.length; j++) {
            rowData.push(tableRow.cells[j].innerHTML);
          }
          data.push(rowData);
        }
        return data;
      }

      return tableToJson(document.getElementsByTagName("table")[1]).map(
        (item) => {
          return { user_id: item[0], card_no: item[1], name: item[2] };
        }
      );
    });
    if (JSON.stringify(data) == JSON.stringify(lastRow)) {
      console.log("They are the same");
      loop = false;
    }
    lastRow = data;
    rows = rows.concat(data);
    await page.click("body > form:nth-child(6) > p > input[type=submit]:nth-child(3)");
  }
  console.log("Done");
  //console.log(rows);
  fs.writeFile("data.json", JSON.stringify(rows, null, 2), (err) => {
    if(err){
      console.log(err);
    }
  });
  await browser.close();
})();
