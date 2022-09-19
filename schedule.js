const cron = require("node-cron");
const tiketATM = require("./tiket_atm.js");
const tiketCRM = require("./tiket_crm.js");
const tiketEDC = require("./tiket_edc.js");
const tidEDC = require("./tid_edc");

// function job() {
//   cron.schedule("0 20 * * *", function () {
//     console.log('dijalankan setiap jam 20.00');
//     tiketATM();
//     tiketCRM();
//     tiketEDC();
//   });
//   cron.schedule("* * * * 1", function () {
//     console.log('dijalankan setiap hari senin');
//     tidEDC();
//   });
// }

function job() {
  // tiketATM();
  // tiketCRM();
  tiketEDC();
}

job();
