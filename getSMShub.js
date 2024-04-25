import axios from "axios";
import { setTimeout } from "node:timers/promises";
import { loggerFailed, loggerSuccess, loggerInfo } from "./logger.js";
import crypto from "node:crypto";
import fs from "node:fs";
import { HttpsProxyAgent } from "https-proxy-agent";
import readline from "readline-sync";

const apikey = "107288Udcf9f93cde487ca995226a3e966e543f";

const delay = async (number) => {
  loggerInfo("Waiting delay " + number + " ms");
  await setTimeout(number);
};

const getSmsHubBalance = () => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://smshub.org/stubs/handler_api.php?api_key=${apikey}&action=getBalance`
    )
      .then((res) => res.text())
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
};

const createOrderSmsHub = () => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://smshub.org/stubs/handler_api.php?api_key=${apikey}&action=getNumber&service=ang&operator=any&country=6&maxPrice=2.00`
    )
      .then((res) => res.text())
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
};

const getSmsHub = (orderid) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://smshub.org/stubs/handler_api.php?api_key=${apikey}&action=getStatus&id=${orderid}`
    )
      .then((res) => res.text())
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
};

const updateOrderStatus = (orderid, status) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://smshub.org/stubs/handler_api.php?api_key=${apikey}&action=setStatus&status=${status}&id=${orderid}`
    )
      .then((res) => res.text())
      .then((res) => resolve(res))
      .catch((error) => reject(error));
  });
};

(async () => {
  const BannerLogo = `
        
  ┏━━━━┳━━━┳━━━┓
  ┗━━┓━┃┏━┓┃┏━┓┃
  ╋╋┏┛┏┫┃╋┃┃┗━┛┃
  ╋┏┛┏┛┃┗━┛┃┏━━┛
  ┏┛━┗━┫┏━┓┃┃
  ┗━━━━┻┛╋┗┻┛   

Using : Get OTP
Version : 1.0\n`;
  console.clear();
  console.log(BannerLogo);

  try {
    console.clear();
    const ressmshub = await getSmsHubBalance();
    if (ressmshub.includes("ACCESS_BALANCE")) {
      loggerSuccess("SmsHub Balance : " + ressmshub.split(":")[1]);
    } else {
      loggerFailed("Failed to get SmsHub Balance");
    }
    let inputNomer = "";
    loggerInfo("Membuat order smshub");
    const resordersms = await createOrderSmsHub();

    if (!resordersms?.includes("ACCESS_NUMBER")) {
      console.log(resordersms);
      loggerFailed(`Gagal membuat order smshub\n`);
      await delay(3000);
    } else {
      inputNomer = resordersms.split(":")[2].substring(2);
      loggerSuccess("Berhasil membuat order smshub");
      loggerSuccess(`Order ID       : ${resordersms.split(":")[1]}`);
      loggerSuccess(`Nomor SMSHUB   : ${inputNomer}`);
    }

    let inputOtp = "";
    loggerInfo("Mendapatkan OTP");
    // await delay(20000);
    let loop = true;
    do {
      const resgetsms = await getSmsHub(resordersms.split(":")[1]);

      if (resgetsms?.includes("STATUS_OK")) {
        const isisms = resgetsms.split(":")[1];
        inputOtp = isisms.match(/\d/g)?.join("") || "";
        loggerSuccess(`Berhasil mendapatkan OTP: ${inputOtp}`);
        await updateOrderStatus(resordersms.split(":")[1], 6);
        loop = false;
        break;
      }
      // else {
      //   loggerInfo("Mendapatkan OTP");
      // }
      // coba++;
      // await delay(10000);
    } while (loop === true);
    // let coba = 0;
    // while (coba < 1) {
    //   const resgetsms = await getSmsHub(resordersms.split(":")[1]);

    //   if (resgetsms?.includes("STATUS_OK")) {
    //     const isisms = resgetsms.split(":")[1];
    //     inputOtp = isisms.match(/\d/g)?.join("") || "";
    //     loggerSuccess(`Berhasil mendapatkan OTP: ${inputOtp}`);
    //     await updateOrderStatus(resordersms.split(":")[1], 6);
    //     break;
    //   } else {
    //     loggerInfo("Mendapatkan OTP");
    //   }
    //   coba++;
    //   // await delay(10000);
    // }
    // if (coba >= 1) {
    //   loggerFailed("Gagal mendapatkan OTP");
    //   await updateOrderStatus(resordersms.split(":")[1], 8);
    //   // await delay(3000);
    //   console.log("");
    // }
  } catch (error) {
    console.log(error);
  }
})();
