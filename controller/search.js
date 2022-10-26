/** @format */

const { validationResult } = require("express-validator");
const { Product } = require("amazonproductscraper");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const searchProduct = require("../models/searchProduct");
const { next } = require("../middileware/error-handler");
const { text } = require("body-parser");

exports.getProductFromAliexpress = async (req, res, next) => {

  try {
    url = req.body.link;
    console.log("Aliexpress", url);
    const scrape = require("aliexpress-product-scraper");
    const product = scrape(url);

    // declaring object
    let data = [];
    await product.then((res) => {
      data = res;
    });
    // refactoring according to product model
    data.name = data.title;
    data.sellingPrice = Math.round(data.salePrice.max);

    // response
    res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.success = false;
      err.statusCode = 500;
      err.message = err;
    }
    next(err);
  }
};

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while (checkCounts++ <= maxChecks) {
    let html = await page.content();
    let currentHTMLSize = html.length;

    let bodyHTMLSize = await page.evaluate(() => document.body.innerHTML.length);

    if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
      countStableSizeIterations++;
    else
      countStableSizeIterations = 0; //reset the counter

    if (countStableSizeIterations >= minStableSizeIterations) {
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitFor(checkDurationMsecs);
  }
};

exports.getProductFromAmazon = async (req, res, next) => {
  try {
    let url = req.body.link;

    // declaring puppeter
    let browser;
    if (process.env.PRODUCTION_BUILD === 'true') {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: "/usr/bin/chromium-browser",
        args: ["--no-sandbox"],
      });
    } else {
      browser = await puppeteer.launch({ headless: true });
    }
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url, { 'timeout': 10000, 'waitUntil': 'load' });
    // await waitTillHTMLRendered(page)
    // const doc = await page.content()


    // Title
    const title = await page.evaluate(() => {
      const element = document.querySelector("span#productTitle");
      if (element) {
        return element.textContent;
      }
      return null;
    });

    // DISCOUNTED PRICE
    const discountedPrice = await page.evaluate(() => {
      const element = document.querySelector("span#price_inside_buybox");
      if (element) {
        let salePrice = element.textContent;
        salePrice = salePrice.replace("$", "");
        salePrice = salePrice.replace(",", "");
        return parseFloat(salePrice);
      }

      return null;
    });

    // declaring object
    let data = {};

    // refactoring according to product model
    data.name = title;
    data.price = discountedPrice;

    // response
    res.status(200).json({
      success: true,
      data: data,
      message: "product from amazon fetched successfully",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.success = false;
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};
// Amazon Menual Scraping
exports.getProuductFromAmazonManual = async (req, res, next) => {

  const url = req.body.link;

  try {
    (async () => {

      // declaring puppeter
      let browser;
      if (process.env.PRODUCTION_BUILD === 'true') {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: "/usr/bin/chromium-browser",
          args: ["--no-sandbox"],
        });
      } else {
        browser = await puppeteer.launch({ headless: true });
      }

      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(0);
      await page.goto(url, { 'timeout': 10000000, 'waitUntil': 'load' });
      await waitTillHTMLRendered(page)
      const doc = await page.content()

      /**
       * Product Info Scraping
       */

      //BRAND
      const brand = await page.evaluate(() => {
        const element = document.querySelector(
          "#acBadge_feature_div > div > span.ac-for-text > span"
        );
        if (element) {
          return element.textContent;
        }

        return null;
      });
      //NAME
      const title = await page.evaluate(() => {
        const element = document.querySelector("span#productTitle");
        if (element) {
          return element.textContent;
        }

        return null;
      });

      //DISCOUNTED PRICE
      const discountedPrice = await page.evaluate(() => {
        const element = document.querySelector(
          "span.a-price.a-text-price.a-size-medium.apexPriceToPay > span:nth-child(2)"
        );
        if (element) {
          let salePrice = element.textContent;
          salePrice = salePrice.replace("$", "");
          salePrice = salePrice.replace(",", "");
          return parseFloat(salePrice);
        }

        return null;
      });

      //MAIN PRICE
      const mainPrice = await page.evaluate(() => {
        const element = document.querySelector(
          "span.a-price.a-text-price > span.a-offscreen"
        );
        if (element) {
          let price = element.textContent;
          price = price.replace("$", "");
          price = price.replace(",", "");
          return parseFloat(price);
        }

        return null;
      });

      //DISCOUNT
      const discount = await page.evaluate(() => {
        let element = document.querySelector(
          "td.a-span12.a-color-price.a-size-base > span.a-color-price"
        );
        if (element) {
          element = element.textContent;
          let result = element.substring(
            element.indexOf("(") + 1,
            element.indexOf(")")
          );

          return result;
        }

        return null;
      });

      // STAR RATING
      const ratings = await page.evaluate(() => {
        let element = document.querySelector("span#acrPopover");
        if (element) {
          element = element.getAttribute("title");
          return element.replace("out of 5 stars", "");
        }

        return null;
      });

      //TOTAL START COUNT
      const totalStartCount = await page.evaluate(() => {
        let element = document.querySelector("span#acrCustomerReviewText");
        if (element) {
          element = element.textContent;
          return element.replace("ratings", "");
        }

        return null;
      });

      //TOTAL REVIEWS COUNT
      const totalReviewsCount = await page.evaluate(() => {
        let element = document.querySelector("a#askATFLink > span.a-size-base");
        if (element) {
          element = element.textContent;
          return element.replace("answered questions", "");
        }

        return null;
      });

      //ABOUT THIS
      const aboutThisHandles = await page.$$("#feature-bullets > ul > li");

      let aboutThis = [];

      for (const aboutThisHandle of aboutThisHandles) {
        let content = null;

        try {
          content = await page.evaluate(
            (el) => el.querySelector("span.a-list-item").textContent,
            aboutThisHandle
          );
        } catch (error) { }

        if (content !== null) {
          aboutThis.push({ content });
        }
      }

      // Web Reviews
      /**
       * 
       const reviews = await page.evaluate(() => {
         const element = document.querySelector(
           "div#cm-cr-dp-review-list > div.a-section.review.aok-relative"
        );
        if (element) {
          return true;
        }
        
        return false;
      });
      
      if (reviews) {
        const reviewHandles = await page.$$(
          "div#cm-cr-dp-review-list > div.a-section.review.aok-relative"
          );
          var reviewData = [];
          for (const reviewHandle of reviewHandles) {
            let displayName = null;
            let content = null;
            
            try {
              displayName = await page.evaluate(
                (el) =>
                el.querySelector("div.a-profile-content > span.a-profile-name")
                .textContent,
              reviewHandle
              );
            } catch (error) {}
            
            try {
              content = await page.evaluate(
                (el) =>
                el.querySelector(
                  "div.a-expander-content.reviewText.review-text-content.a-expander-partial-collapse-content > span"
                  ).textContent,
                  reviewHandle
                  );
                } catch (error) {}
                
          if (displayName !== null) {
            reviewData.push({ displayName, content });
          }
        }
      }
      */

      // SLIDER DATA

      const slides = await page.evaluate(() => {
        const element = document.querySelector(
          "div#altImages > ul > li.a-spacing-small"
        );
        if (element) {
          return true;
        }

        return false;
      });

      if (slides) {
        const sliderHandles = await page.$$(
          "#altImages > ul > li.imageThumbnail"
          // "li.a-spacing-small.item.imageThumbnail.a-declarative > span.a-list-item > span.a-button.a-button-thumbnail.a-button-toggle > span.a-button-inner > span.a-button-text > img"
        );

        var sliderData = [];

        for (const sliderHandle of sliderHandles) {

          let slideImage = null;

          try {
            slideImage = await page.evaluate(
              (el) =>
                el
                  .querySelector(
                    "span.a-button-inner > span.a-button-text > img"
                  )
                  .getAttribute("src"),
              sliderHandle
            );
          } catch (error) { }

          if (slideImage) {
            sliderData.push(slideImage);
          }
        }
      }
      var variantDemo = [];
      for (const parent of await page.$$(
        "div#twister-plus-inline-twister > div.a-section.a-spacing-none.inline-twister-row"
      )) {
        let button = await parent.$("span.a-size-base");
        let button_text = await page.evaluate((el) => el.innerText, button);
        let colorsData = [];

        for (const child of await parent.$$(
          "div > div.a-section > div#tp-inline-twister-dim-values-container > ul > li.a-declarative"
        )) {
          let displayName = null;
          let price = null;
          let urlID = null;

          try {
            urlID = await page.evaluate(
              (el) => el.getAttribute("data-asin"),
              child
            );
          } catch (error) {
            console.log(error);
          }
          var i = url.indexOf("https://www.amazon.com/");
          var j = url.indexOf("dp");
          link = url.substring(j, i) + "dp/" + urlID;

          try {
            displayName = await page.evaluate(
              (el) =>
                el.querySelector(
                  "span.a-list-item > span.a-button.a-button-toggle > span.a-button-inner > span.a-button-text > div.a-section.a-spacing-none.swatch-title-text-container > span"
                ).textContent,
              child
            );
          } catch (error) {
            console.log("No display name")
          }

          try {
            price = await page.evaluate(
              (el) =>
                el.querySelector(
                  "div.a-section.dimension-slot-info.show-image-slots > span#_price > span.twisterSwatchPrice.a-size-base.a-color-base"
                ).textContent,
              child
            );
          } catch (error) {
            console.log("No price name");
          }
          if (price !== null) {
            price = price.replace("$", "");
            price = price.replace(",", "");
            price = parseFloat(price);
          }

          if (displayName !== null) {
            colorsData.push({
              displayName: displayName,
              status: 1,
              price: price,
              url: link,
            });
          }

        }
        let varObj = {
          name: button_text,
          values: colorsData,
        };
        variantDemo = [...variantDemo, varObj];
      }

      //SPECIFICATIONS
      var specificationData = [];
      for (const parent of await page.$$(
        "div.a-expander-content.a-expander-extend-content > div.a-row a-expander-container.a-expander-inline-container"
      )) {
        let header = await parent.$(
          "div.a-row > span.a-declarative > a > span.a-expander-prompt"
        );
        let header_text = await page.evaluate((el) => el.innerText, header);

        let specData = [];
        for (const child of await parent.$$("table._14cfVK > tbody > tr")) {
          let topic = null;
          let content = null;

          try {
            topic = await page.evaluate(
              (el) => el.querySelector("td._1hKmbr").textContent,
              child
            );
          } catch (error) {
            console.log(error);
          }
          let contentData = [];
          for (const grandChild of await child.$$("td.URwL2w > ul")) {
            try {
              content = await page.evaluate(
                (el) => el.querySelector("li").textContent,
                grandChild
              );
            } catch (error) { }
            contentData.push({ content: content });
          }
          if (contentData !== null) {
            specData.push({ topic: topic, content: contentData });
          }
        }
        let varObj = {
          header: header_text,
          details: specData,
        };
        specificationData = [...specificationData, varObj];
      }
      await browser.close();

      // data refactoring according to model
      var productInfo = {
        brand: brand,
        name: title,
        images: sliderData,
        discountedPrice: discountedPrice,
        sellingPrice: mainPrice,
        discount: discount,
        description: aboutThis,
        ratings: {
          averageStar: ratings,
          totalStar: "5",
          totalStartCount: totalStartCount,
        },
        // feedback: reviewData,
        ratingReviewsCount: totalReviewsCount,
        variants: {
          options: variantDemo,
        },
        specifications: specificationData,
      };

      // response
      res.status(200).json({
        data: productInfo,
        // data: req.body,
        message: "All data fetch Successfully!",
      });
    })();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Something went wrong on database operation!";
    }
  }
};
//FlipKart Menual Scraping
exports.getProductFromFlipkart = async (req, res, next) => {
  const url = req.body.link;
  try {
    (async () => {
      let browser;
      if (process.env.PRODUCTION_BUILD === 'true') {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: "/usr/bin/chromium-browser",
          args: ["--no-sandbox"],
        });
      } else {
        browser = await puppeteer.launch({ headless: false });
      }
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "networkidle0",
      });

      await page.setDefaultNavigationTimeout(0);
      //Product Info Scraping      

      //BRAND
      const brand = await page.evaluate(() => {
        const element = document.querySelector("h1.yhB1nd > span.G6XhRU");
        if (element) {
          return element.textContent;
        }

        return null;
      });
      //NAME
      const title = await page.evaluate(() => {
        const element = document.querySelector("h1.yhB1nd > span.B_NuCI");
        if (element) {
          return element.textContent;
        }

        return null;
      });

      //DISCOUNTED PRICE
      const discountedPrice = await page.evaluate(() => {
        const element = document.querySelector(
          "div.CEmiEU > div > div._30jeq3._16Jk6d"
        );
        if (element) {
          let salePrice = element.textContent;
          salePrice = salePrice.replace("₹", "");
          salePrice = salePrice.replace(",", "");
          return parseFloat(salePrice);
        }

        return null;
      });

      //MAIN PRICE
      const mainPrice = await page.evaluate(() => {
        const element = document.querySelector(
          "div.CEmiEU > div > div._3I9_wc._2p6lqe"
        );
        if (element) {
          let price = element.textContent;
          price = price.replace("₹", "");
          price = price.replace(",", "");
          return parseFloat(price);
        }

        return null;
      });

      //DISCOUNT
      const discount = await page.evaluate(() => {
        const element = document.querySelector(
          "div.CEmiEU > div > div._3Ay6Sb._31Dcoz > span"
        );
        if (element) {
          return element.textContent;
        }

        return null;
      });

      // STAR RATING
      const ratings = await page.evaluate(() => {
        const element = document.querySelector("span._1lRcqv > div._3LWZlK");
        if (element) {
          return true;
        }

        return false;
      });
      if (ratings) {
        var starRating = await page.evaluate(() => {
          let element = document.querySelector("span._1lRcqv > div._3LWZlK");
          if (element) {
            element = element.textContent;
            return element.slice(0, 3);
          }

          return null;
        });
      }

      // RATING REVIEW COUNT
      const totalStartCount = await page.evaluate(() => {
        const element = document.querySelector(
          "div._3Zuayz > div > div > span._2_R_DZ > span"
        );
        if (element) {
          let countR = element.textContent;
          countR.slice(0, 4);
          return countR;
        }

        return null;
      });

      //   let totalStartCount = ratingReviewsCount.slice(0, 4);

      //Slider Images
      const sliderHandles = await page.$$("div._2mLllQ > ul > li > div");
      let sliderData = [];



      const photos = await page.$$eval("li._20Gt85 > div._1AuMiq > div._2E1FGS > img.q6DClP", (imgs) => {
        return imgs.map(
          x => x.click()
        );
      })

      for (let i = 1; i <= photos.length; i++) {
        // getImage(3);
        await page.hover("ul._3GnUWp > li:nth-child(" + i + ") > div._1AuMiq > div._2E1FGS > img.q6DClP")
        await page.waitFor(100);
        await page.setDefaultNavigationTimeout(0);
        const image = await page.evaluate(() => {
          return document.querySelector("img._2r_T1I").getAttribute('src');
        })
        sliderData.push(image);
      }

      async function getImage(i) {
        await page.hover("ul._3GnUWp > li:nth-child(" + i + ") > div._1AuMiq > div._2E1FGS > img.q6DClP", {
          waitUntil: "networkidle0",
        });
        const image = await page.evaluate(() => {
          return document.querySelector("img._2r_T1I").getAttribute('src');
        })
        sliderData.push(image);
      }

      //Specification
      const aboutThis = await page.evaluate(() => {
        const element = document.querySelector("div > div > div._1AN87F");
        if (element) {
          return element.textContent;
        }
        return "";
      });

      //Web Reviews
      const reviews = await page.evaluate(() => {
        const element = document.querySelector(
          "div._16PBlm._2RzJ9n > div.col > div.col._2wzgFH._1QgsS5"
        );
        if (element) {
          return true;
        }
        return false;
      });

      if (reviews) {
        const reviewHandles = await page.$$(
          "div._16PBlm._2RzJ9n > div.col > div.col._2wzgFH._1QgsS5"
        );
        var reviewData = [];
        for (const reviewHandle of reviewHandles) {
          let displayName = null;
          let content = null;
          try {
            displayName = await page.evaluate(
              (el) =>
                el.querySelector(
                  "div.row._3n8db9 > div > p._2sc7ZR._2V5EHH._1QgsS5"
                ).textContent,
              reviewHandle
            );
          } catch (error) { }
          try {
            content = await page.evaluate(
              (el) => el.querySelector("div > div > div._6K-7Co").textContent,
              reviewHandle
            );
          } catch (error) { }

          if (displayName !== null) {
            reviewData.push({ displayName, content });
          }
        }
      }

      // VARIANTS
      let variantDemo = [];
      for (const parent of await page.$$("div._3wmLAA > div.ffYZ17")) {
        let button = await parent.$("div._22QfJJ > span");
        let button_text = await page.evaluate((el) => el.innerText, button);
        let colorsData = [];

        for (const child of await parent.$$(
          "._22QfJJ > ul._1q8vHb > li._3V2wfe"
        )) {
          let displayName = null;
          let url = null;

          let status = null;

          try {
            status = await page.evaluate(
              (el) => el.querySelector("a").getAttribute("class"),
              child
            );
          } catch (error) { }
          const statusValue = status.search("_1ynmf9");
          if (statusValue > 0) {
            status = 0;
          } else {
            status = 1;
          }
          try {
            displayName = await page.evaluate(
              (el) =>
                el.querySelector(
                  "div._2OTVHf._3NVE7n._1mQK5h._2J-DXM > div._3Oikkn._3_ezix._2KarXJ"
                ).textContent,
              child
            );
          } catch (error) { }

          try {
            url = await page.evaluate(
              (el) => el.querySelector("a").getAttribute("href"),
              child
            );
          } catch (error) { }
          if (displayName !== null) {
            colorsData.push({
              displayName: displayName,
              status: status,
              url: url,
            });
          }
        }
        let varObj = {
          name: button_text,
          values: colorsData,
        };
        variantDemo = [...variantDemo, varObj];
      }

      //SPECIFICATIONS
      var specificationData = [];
      for (const parent of await page.$$("div > div._1UhVsV > div._3k-BhJ")) {
        let header = await parent.$("div.flxcaE");
        let header_text = await page.evaluate((el) => el.innerText, header);

        let specData = [];
        for (const child of await parent.$$("table._14cfVK > tbody > tr")) {
          let topic = null;
          let content = null;

          try {
            topic = await page.evaluate(
              (el) => el.querySelector("td._1hKmbr").textContent,
              child
            );
          } catch (error) { }
          let contentData = [];
          for (const grandChild of await child.$$("td.URwL2w > ul")) {
            try {
              content = await page.evaluate(
                (el) => el.querySelector("li").textContent,
                grandChild
              );
            } catch (error) { }
            contentData.push({ content: content });
          }
          if (contentData !== null) {
            specData.push({ topic: topic, content: contentData });
          }
        }
        let varObj = {
          header: header_text,
          details: specData,
        };
        specificationData = [...specificationData, varObj];
      }
      await browser.close();

      // DATA REFACTORING ACCORDING TO MODEL
      if (title !== null) {
        var productInfo = {
          brand: brand,
          name: title,
          images: sliderData,
          discountedPrice: discountedPrice,
          sellingPrice: mainPrice,
          discount: discount,
          description: aboutThis,
          ratings: {
            averageStar: starRating,
            totalStar: "5",
            totalStartCount: totalStartCount,
          },
          feedback: reviewData,
          ratingReviewsCount: totalStartCount,
          variants: {
            options: variantDemo,
          },
          specifications: specificationData,
        };
      }
      // const data = await TripInfo.find();
      res.status(200).json({
        data: productInfo,
        message: "All data fetch Successfully!",
      });
    })();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Something went wrong on database operation!";
    }
    next(error);
  }
};

//Myntra Menual Scraping
exports.getProductFromMyntra = async (req, res, next) => {
  let url = req.body.link;
  try {
    (async () => {
      let browser;
      if (process.env.PRODUCTION_BUILD === 'true') {
        browser = await puppeteer.launch({
          headless: false,
          executablePath: "/usr/bin/chromium-browser",
          args: ["--no-sandbox", "--disabled-setupid-sandbox"],
        });
      } else {
        browser = await puppeteer.launch({ headless: true });
      }
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
      // await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');
      await page.setViewport({ width: 960, height: 768 });

      // await page.goto('https://google.com/', {timeout: 40000, waitUntil: 'domcontentloaded'});
      await page.goto(url, {
        waitUntil: "networkidle0",
      });
      await page.screenshot({ path: "myntra.png" })

      await page.setDefaultNavigationTimeout(0);

      //Product Info Scraping
      //BRAND
      const brand = await page.evaluate(() => {
        const element = document.querySelector("div.pdp-description-container > div.pdp-price-info > h1.pdp-title");
        if (element) {
          return element.textContent;
        }

        return null;
      });
      // let brand = await page.$eval(
      //   "div.pdp-description-container > div.pdp-price-info > h1.pdp-title",
      //   (el) => el.textContent
      // );
      // brand = brand.replace("&nbsp;", "  ");

      const title = await page.evaluate(() => {
        const element = document.querySelector("div.pdp-description-container > div.pdp-price-info > h1.pdp-name");
        if (element) {
          return element.textContent;
        }

        return null;
      });

      // let title = await page.$eval(
      //   "div.pdp-description-container > div.pdp-price-info > h1.pdp-name",
      //   (el) => el.innerHTML
      // );
      // title = title.replace("&amp;", "  ");

      const discountedPrice = await page.evaluate(() => {
        const element = document.querySelector("div.pdp-price-info > p.pdp-discount-container > span.pdp-price > strong");
        if (element) {
          return element.innerHTML;
        }

        return null;
      });


      // const discountedPrice = await page.$eval(
      //   "div.pdp-price-info > p.pdp-discount-container > span.pdp-price > strong",
      //   (el) => el.innerHTML
      // );
      let salePrice = discountedPrice.replace("Rs. ", "");
      salePrice = salePrice.replace(",", "");
      salePrice = parseInt(salePrice) * 1.14;
      salePrice = salePrice.toFixed(3);

      const mainPrice = await page.evaluate(() => {
        const element = document.querySelector("div.pdp-price-info > p.pdp-discount-container > span.pdp-mrp > s");
        if (element) {
          return element.textContent;
        }

        return null;
      });

      // const mainPrice = await page.$eval(
      //   "div.pdp-price-info > p.pdp-discount-container > span.pdp-mrp > s",
      //   (el) => el.textContent
      // );




      let price = mainPrice.replace("Rs.", "");
      price = price.replace(",", "");
      price = parseInt(price) * 1.14;
      price = price.toFixed(3);

      const discountPercent = await page.evaluate(() => {
        const element = document.querySelector("div.pdp-price-info > p.pdp-discount-container > span.pdp-discount");
        if (element) {
          return element.textContent;
        }

        return null;
      });

      // const discountPercent = await page.$eval(
      //   "div.pdp-price-info > p.pdp-discount-container > span.pdp-discount",
      //   (el) => el.textContent
      // );
      let discount = discountPercent.replace(" OFF)", "");
      discount = discount.replace("(", "");
      //Description

      const aboutThis = await page.evaluate(() => {
        const element = document.querySelector("p.pdp-product-description-content");
        if (element) {
          return element.textContent;
        }

        return null;
      });

      // let aboutThis = await page.$eval(
      //   "p.pdp-product-description-content",
      //   (el) => el.textContent
      // );

      // var ratings = await page.$eval("div.index-overallRatingContainer > div.index-overallRating > div",el => el.textContent) ? ratings : null;

      const ratings = await page.evaluate(() => {
        const element = document.querySelector(
          "div.index-overallRatingContainer > div.index-overallRating > div"
        );
        if (element) {
          return element.textContent;
        }

        return null;
      });

      // let totalStartCount = await page.$eval("div.pdp-price-info > div > div > div.index-ratingsCount",el => el.textContent);

      const totalStartCount = await page.evaluate(() => {
        const element = document.querySelector(
          "div.pdp-price-info > div > div > div.index-ratingsCount"
        );
        if (element) {
          return element.textContent;
        }

        return null;
      });
      //Slider Images
      const sliderHandles = await page.$$(
        "div.image-grid-col50 > div.image-grid-imageContainer"
      );

      let sliderData = [];

      for (const sliderHandle of sliderHandles) {
        let slideImage = null;

        try {
          slideImage = await page.evaluate(
            (el) =>
              el.querySelector("div.image-grid-image").getAttribute("style"),
            sliderHandle
          );
        } catch (error) { }
        let images = slideImage.substr(23, slideImage.length);
        images = images.replace('");', "");
        sliderData.push(images);
      }

      //Web Reviews
      const reviewHandles = await page.$$(
        "div.detailed-reviews-userReviewsContainer > div.user-review-userReviewWrapper"
      );
      let reviewData = [];

      for (const reviewHandle of reviewHandles) {
        let displayName = null;
        let content = null;

        try {
          displayName = await page.evaluate(
            (el) =>
              el.querySelector(
                "div.user-review-footer.user-review-showRating > div.user-review-left > span"
              ).textContent,
            reviewHandle
          );
        } catch (error) { }

        try {
          content = await page.evaluate(
            (el) =>
              el.querySelector(
                "div.user-review-main.user-review-showRating > div.user-review-reviewTextWrapper"
              ).textContent,
            reviewHandle
          );
        } catch (error) { }
        if (displayName !== null) {
          reviewData.push({ displayName, content });
        }
      }

      // Variation Sizes

      if (
        page.$$("#sizeButtonsContainer > div.size-buttons-size-buttons > div")
      ) {
        const variantSizeHandles = await page.$$(
          "#sizeButtonsContainer > div.size-buttons-size-buttons > div"
        );
        var variantSizeData = [];

        for (const variantSizeHandle of variantSizeHandles) {
          let displayName = null;
          let price = null;

          try {
            displayName = await page.evaluate(
              (el) =>
                el.querySelector(
                  "div.size-buttons-buttonContainer > button.size-buttons-size-button.size-buttons-size-button-default > p"
                ).textContent,
              variantSizeHandle
            );
          } catch (error) { }
          try {
            price = await page.evaluate(
              (el) =>
                el.querySelector(
                  "button.size-buttons-size-button.size-buttons-size-button-default > p.size-buttons-unified-size > div.size-buttons-sku-price"
                ).textContent,
              variantSizeHandle
            );
            price = price.replace("Rs. ", "");
            price = price.replace(",", "");
            price = parseInt(price) * 1.14;
            price = price.toFixed(3);
          } catch (error) { }

          if (displayName !== null) {
            variantSizeData.push({ displayName, price });
          }
          variantSizeData.forEach((item, i) => {
            item.id = i + 1;
          });
        }
      }

      // Color Sizes
      var variantColorData = await page.evaluate(() => {
        const tds = Array.from(
          document.querySelectorAll(
            "div.pdp-description-container > div.colors-container > div > a"
          )
        );
        return tds.map((td) => {
          var txt = td.getAttribute("title");
          var url = td.getAttribute("href");
          txt = txt.replace(/<a [^>]+>[^<]*<\/a>/g, "").trim();
          url = url.replace(/<a [^>]+>[^<]*<\/a>/g, "").trim();
          url = "https://www.myntra.com" + url;
          return { displayName: txt, url: url };
        });
      });

      variantColorData.forEach((item, i) => {
        item.id = i + 1;
      });

      // Variation Shades

      var variantShadesData = await page.evaluate(() => {
        const tds = Array.from(
          document.querySelectorAll(
            "div.pdp-description-container > div.colors-container > div > ul > li > a.colors-shade > span.colors-shadeName"
          )
        );
        return tds.map((td) => {
          var txt = td.textContent;
          txt = txt.replace(/<a [^>]+>[^<]*<\/a>/g, "").trim();
          return { displayName: txt };
        });
      });

      variantShadesData.forEach((item, i) => {
        item.id = i + 1;
      });

      await browser.close();

      var productInfo = {
        brand: brand,
        name: title,
        images: sliderData,
        discountedPrice: Math.round(salePrice * 1.14),
        discount: discount,
        sellingPrice: Math.round(price * 1.14),
        description: aboutThis,
        ratings: {
          averageStar: ratings,
          totalStar: "5",
          totalStartCount: totalStartCount,
        },
        feedback: reviewData,
        variants: {
          options: [
            {
              name: "Sizes",
              values: variantSizeData,
            },
            {
              name: 'More Colors',
              values: variantColorData
            },
            // {
            //     name: 'Shades',
            //     values: variantShadesData
            // }
          ],
        },
      };

      res.status(200).json({
        success: true,
        data: productInfo,
        message: "product from amazon fetched successfully",
      });
    })();
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.success = false;
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};

exports.getProductFromEbay = async (req, res, next) => {
  const url = req.body.link;
  try {
    (async () => {
      let browser;
      if (process.env.PRODUCTION_BUILD === 'true') {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: "/usr/bin/chromium-browser",
          args: ["--no-sandbox"],
        });
      } else {
        browser = await puppeteer.launch({ headless: false });
      }
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "networkidle0",
      });

      await page.setDefaultNavigationTimeout(0);
      //Product Info Scraping      

      //Title
      const title = await page.evaluate(() => {
        const element = document.querySelector("div.x-item-title > h1.x-item-title__mainTitle > span.ux-textspans");
        if (element) {
          return element.textContent;
        }
      })

      //DISCOUNTED PRICE
      const disPrice = await page.evaluate(() => {
        const element = document.getElementById("prcIsum");
        if (element) {
          return salePrice = element.textContent;
        }

        return null;
      });

      const disArray = disPrice.split(" ");
      let discountedPrice = disArray[1];
      discountedPrice = discountedPrice.replace("$", "");
      discountedPrice = discountedPrice.replace(",", "");

      //DISCOUNT
      const discount = await page.evaluate(() => {
        const element = document.querySelector(
          "div.CEmiEU > div > div._3Ay6Sb._31Dcoz > span"
        );
        if (element) {
          return element.textContent;
        }

        return null;
      });

      // STAR RATING
      const ratings = await page.evaluate(() => {
        const element = document.querySelector("span._1lRcqv > div._3LWZlK");
        if (element) {
          return true;
        }

        return false;
      });
      if (ratings) {
        var starRating = await page.evaluate(() => {
          let element = document.querySelector("span._1lRcqv > div._3LWZlK");
          if (element) {
            element = element.textContent;
            return element.slice(0, 3);
          }

          return null;
        });
      }

      // RATING REVIEW COUNT
      const totalStartCount = await page.evaluate(() => {
        const element = document.querySelector(
          "div._3Zuayz > div > div > span._2_R_DZ > span"
        );
        if (element) {
          let countR = element.textContent;
          countR.slice(0, 4);
          return countR;
        }

        return null;
      });


      //Slider Images
      let sliderData = [];

      const photos = await page.$$eval("div.v-pnl-item > img", (imgs) => {
        return imgs.map(
          x => x.click()
        );
      })

      for (let i = 1; i <= photos.length; i++) {
        // getImage(3);
        await page.hover("ul#vertical-align-items-viewport > li:nth-child(" + i + ")  a > div.v-pnl-item > img")
        await page.waitFor(100);
        await page.setDefaultNavigationTimeout(0);
        const image = await page.evaluate(() => {
          return document.getElementById("icImg").getAttribute('src');
        })
        sliderData.push(image);
      }


      //Specification
      const aboutThis = await page.evaluate(() => {
        const element = document.querySelector("div > div > div._1AN87F");
        if (element) {
          return element.textContent;
        }
        return "";
      });

      //Web Reviews
      const reviews = await page.evaluate(() => {
        const element = document.querySelector(
          "div._16PBlm._2RzJ9n > div.col > div.col._2wzgFH._1QgsS5"
        );
        if (element) {
          return true;
        }
        return false;
      });

      if (reviews) {
        const reviewHandles = await page.$$(
          "div._16PBlm._2RzJ9n > div.col > div.col._2wzgFH._1QgsS5"
        );
        var reviewData = [];
        for (const reviewHandle of reviewHandles) {
          let displayName = null;
          let content = null;
          try {
            displayName = await page.evaluate(
              (el) =>
                el.querySelector(
                  "div.row._3n8db9 > div > p._2sc7ZR._2V5EHH._1QgsS5"
                ).textContent,
              reviewHandle
            );
          } catch (error) { }
          try {
            content = await page.evaluate(
              (el) => el.querySelector("div > div > div._6K-7Co").textContent,
              reviewHandle
            );
          } catch (error) { }

          if (displayName !== null) {
            reviewData.push({ displayName, content });
          }
        }
      }

      // VARIANTS

      variants = await page.$$eval("select#msku-sel-1 > option", (imgs) => {
        return imgs.map(
          x => x.textContent
        );
      })

      let values = []
      for (let i = 1; i < variants.length; i++) {
        // await page.click("select#msku-sel-1")
        // await page.click("select#msku-sel-1 > option:nth-child("+i+")")
        var value = i - 1;
        value = value.toString();
        await page.select('#msku-sel-1', value)
        await page.waitFor(100);
        await page.setDefaultNavigationTimeout(0);
        const price = await page.evaluate(() => {
          return document.getElementById("prcIsum").textContent;
        })
        const varPriceArray = price.split(" ");
        let variantPrice = varPriceArray[1];
        variantPrice = variantPrice.replace("$", "");
        variantPrice = variantPrice.replace(",", "");
        // console.log("variant price :",variantPrice)
        if (variants[i].search("out of stock") < 0) {
          variant = {
            displayName: variants[i],
            price: variantPrice
          }
          values.push(variant);
        }
        // getImage(3);



      }
      variantDemo = [];
      let varObj = {
        name: "Size",
        values: values
      };
      variantDemo.push(varObj);


      //SPECIFICATIONS
      var specificationData = [];
      for (const parent of await page.$$("div > div._1UhVsV > div._3k-BhJ")) {
        let header = await parent.$("div.flxcaE");
        let header_text = await page.evaluate((el) => el.innerText, header);

        let specData = [];
        for (const child of await parent.$$("table._14cfVK > tbody > tr")) {
          let topic = null;
          let content = null;

          try {
            topic = await page.evaluate(
              (el) => el.querySelector("td._1hKmbr").textContent,
              child
            );
          } catch (error) { }
          let contentData = [];
          for (const grandChild of await child.$$("td.URwL2w > ul")) {
            try {
              content = await page.evaluate(
                (el) => el.querySelector("li").textContent,
                grandChild
              );
            } catch (error) { }
            contentData.push({ content: content });
          }
          if (contentData !== null) {
            specData.push({ topic: topic, content: contentData });
          }
        }
        let varObj = {
          header: header_text,
          details: specData,
        };
        specificationData = [...specificationData, varObj];
      }
      await browser.close();

      // DATA REFACTORING ACCORDING TO MODEL
      if (title !== null) {
        var productInfo = {
          name: title,
          images: sliderData,
          discountedPrice: discountedPrice,
          sellingPrice: discountedPrice,
          discount: discount,
          description: aboutThis,
          ratings: {
            averageStar: starRating,
            totalStar: "5",
            totalStartCount: totalStartCount,
          },
          feedback: reviewData,
          ratingReviewsCount: totalStartCount,
          variants: {
            options: variantDemo,
          },
          specifications: specificationData,
        };
      }
      res.status(200).json({
        data: productInfo,
        message: "All data fetch Successfully!",
      });
    })();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Something went wrong on database operation!";
    }
    next(error);
  }
};

exports.getProductFromWalmart = async (req, res, next) => {
  const url = req.body.link;
  console.log(url);
  // url = "https://www.walmart.com/ip/PORTLAND-by-Portland-Boot-Company-Men-s-EVA-Athletic-Slide-Sandal/144737815?athbdg=L1300";
  try {
    (async () => {
      let browser;
      if (process.env.PRODUCTION_BUILD === 'true') {
        browser = await puppeteer.launch({
          headless: true,
          executablePath: "/usr/bin/chromium-browser",
          args: ["--no-sandbox"],
        });
      } else {
        browser = await puppeteer.launch({ headless: false });
      }
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "networkidle0",
      });

      await page.setDefaultNavigationTimeout(0);
      //Product Info Scraping      

      //Title

      const title = await page.evaluate(() => {
        const element = document.querySelector("h1.dark-gray");
        if (element) {
          return element.textContent;
        }
      })

      const brand = await page.evaluate(() => {
        const element = document.querySelector("a.mid-gray");
        if (element) {
          return element.textContent;
        }
      })

      //DISCOUNTED PRICE
      const disPrice = await page.evaluate(() => {
        const element = document.querySelector("div.f6.gray.lh-title.mb3.dn.db-m > span > span:nth-child(2)");
        if (element) {
          return salePrice = element.textContent;
        }

        return null;
      });
      discountedPrice = disPrice.replace("$", "");

      // // VARIANTS
      for (let i = 2; i <= 3; i++) {
        let values = [];
        const variants = await page.$$eval("#__next > div:nth-child(1) > div > div > div.flex-auto.relative.z-1 > div > section > main > div > div:nth-child(2) > div > div.w_CM.w_DL.w_CQ > div > div > div:nth-child(1) > div > div > div.relative > div:nth-child(" + i + ") > div.w-100.f6.mt2 > div.flex.flex-wrap.nl2 > button ", (vars) => {
          return vars.map(
            x => x.click()
          );
        })

        for (let x = 1; x < variants.length; x++) {
          await page.hover("#__next > div:nth-child(1) > div > div > div.flex-auto.relative.z-1 > div > section > main > div > div:nth-child(2) > div > div.w_CM.w_DL.w_CQ > div > div > div:nth-child(1) > div > div > div.relative > div:nth-child(" + i + ") > div.w-100.f6.mt2 > div.flex.flex-wrap.nl2 > button")
          await page.waitFor(100);
          const variantName = await page.evaluate(() => {
            const element = document.querySelector("#__next > div:nth-child(1) > div > div > div.flex-auto.relative.z-1 > div > section > main > div > div:nth-child(2) > div > div.w_CM.w_DL.w_CQ > div > div > div:nth-child(1) > div > div > div.relative > div:nth-child(2) > div > div.mb2.mid-gray > span.ml1");
            if (element) {
              return element.textContent;
            }
            return null;
          });

          variant = {
            displayName: variantName
          }
          values.push(variant)

        }

        variantDemo = [];
        let varObj = {
          name: "Color",
          values: values
        };
        variantDemo.push(varObj);
      }




      // #shoe_size-2






      //Slider Images
      let sliderData = [];
      const photos = await page.$$eval("button.pa0.ma0.bn.bg-white.b--white.br0.pb3.pointer > div.relative > img", (imgs) => {
        return imgs.map(
          x => x.click()
        );
      })

      for (let i = 1; i <= photos.length; i++) {
        // getImage(3);
        await page.hover("div.ma2 > div.container.overflow-y-hidden.mv3 > div:nth-child(" + i + ") > button.pa0.ma0.bn.bg-white.b--white.br0.pb3.pointer > div.relative > img")
        await page.waitFor(100);
        // await page.setDefaultNavigationTimeout(0);
        const image = await page.evaluate(() => {
          // section.flex.items-center > div.mr3.ml7.self-center.relative > div.relative > img
          return document.querySelector("div.mr3.ml7.self-center.relative > div.relative > img").getAttribute('src');
        })
        sliderData.push(image);
      }



      //SPECIFICATIONS
      var specificationData = [];
      for (const parent of await page.$$("div > div._1UhVsV > div._3k-BhJ")) {
        let header = await parent.$("div.flxcaE");
        let header_text = await page.evaluate((el) => el.innerText, header);

        let specData = [];
        for (const child of await parent.$$("table._14cfVK > tbody > tr")) {
          let topic = null;
          let content = null;

          try {
            topic = await page.evaluate(
              (el) => el.querySelector("td._1hKmbr").textContent,
              child
            );
          } catch (error) { }
          let contentData = [];
          for (const grandChild of await child.$$("td.URwL2w > ul")) {
            try {
              content = await page.evaluate(
                (el) => el.querySelector("li").textContent,
                grandChild
              );
            } catch (error) { }
            contentData.push({ content: content });
          }
          if (contentData !== null) {
            specData.push({ topic: topic, content: contentData });
          }
        }
        let varObj = {
          header: header_text,
          details: specData,
        };
        specificationData = [...specificationData, varObj];
      }
      await browser.close();

      // DATA REFACTORING ACCORDING TO MODEL
      if (title !== null) {
        var productInfo = {
          name: title,
          brand: brand,
          images: sliderData,
          discountedPrice: discountedPrice,
          variants: {
            options: variantDemo,
          }
        };
      }
      // console.log("Product Info",productInfo)
      res.status(200).json({
        data: productInfo,
        message: "All data fetch Successfully!",
      });
    })();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      error.message = "Something went wrong on database operation!";
    }
    next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    // paste any url here
    let data = req.body;
    const product = new searchProduct(data);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Order placed Successfully!",
    });
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Something went wrong on database operation!";
    }
    next(err);
  }
};
exports.getAllOrders = async (req, res, next) => {
  try {
    const products = await searchProduct.find();
    const docCount = await searchProduct.countDocuments();
    res.status(200).json({
      data: products,
      count: docCount,
    });
  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
      err.message = "Something went wrong on database operation";
    }
    next(err);
  }
};
exports.getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await searchProduct.find({ _id: id });
    res.status(200).json({
      data: product,
    });
  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
      err.message = "Something went wrong on database operation";
    }
    next(err);
  }
};



exports.getAliexpressProductData = async (req, res, next) => {

  try {
    const productCode = req.params.id;
    let url = 'https://ali-express1.p.rapidapi.com/product/'+productCode;
    const axios = require("axios");
    
    const options = {
      method: 'GET',
      url: url,
      params: { language: 'en' },
      headers: {
        'X-RapidAPI-Key': '6733c44216mshc1cddfbbea29761p148b11jsn4e554d96952f',
        'X-RapidAPI-Host': 'ali-express1.p.rapidapi.com'
      }
    };
    
    axios.request(options).then(function (response) {
      let variants = []
      for(let i=0; i < response.data.skuModule.productSKUPropertyList.length; i++){
        variants[i] = response.data.skuModule.productSKUPropertyList[i].skuPropertyName;
      }
      let options = [];
      for (let i = 0; i < response.data.skuModule.productSKUPropertyList.length; i++) {
        for (let j = 0; j < response.data.skuModule.productSKUPropertyList[i].skuPropertyValues.length;j++){
          let newOption = response.data.skuModule.productSKUPropertyList[i].skuPropertyValues[j].propertyValueDisplayName;
          if(j == 0){
            options[i] = newOption;
          }else{
            temp= options[i]+","+newOption;
            options[i] = temp;
          }
        }
      }
      let data = {
        name: response.data.titleModule.subject,
        descriptionUrl: response.data.descriptionModule.descriptionUrl,
        images: response.data.imageModule.imagePathList,
        variants: variants,
        options: options
      }
      res.status(200).json({
        data: data,
        message: "Product Fetched Successfully"
      });
    }).catch(function (error) {
      console.error(error);
      err.statusCode = 500;
      err.message = error;
    });

    

  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
      err.message = "Something went wrong on database operation";
    }
    next(err);
  }
};



exports.getAmazonProductData = async (req, res, next) => {

  try {
    let productCode = req.params.id;
    const params = {
      api_key: "E4991D6BCF4E4B0CBCD8E225C122A0CB",
        amazon_domain: "amazon.com",
        asin: productCode,
        type: "product"
      }
      
      // make the http GET request to Rainforest API
      axios.get('https://api.rainforestapi.com/request', { params })
      .then(response => {
        // print the JSON response from Rainforest API
        // console.log(JSON.stringify(response.data, 0, 2));
        variants = response.data.product.variants[0].dimensions.map(item => item.name);
        let options = [];
        let tempArray = [];
        for (let i = 0; i < response.data.product.variants.length; i++) {
          for (let j = 0; j < variants.length;j++){
            let newOption = response.data.product.variants[i].dimensions[j].value;
            if(i == 0){
              options[j] = newOption;
              tempArray.push(newOption);
            }else{
              const found = tempArray.includes(newOption);
              if(found !== true){
                tempArray.push(newOption);
                temp= options[j]+","+newOption;
                options[j] = temp;
              }
            }
          }
        }
        data = {
          name: response.data.product.title,
          brand: response.data.product.brand,
          images: response.data.product.images.map(item => item.link),
          variants: variants,
          options: options
        }
        res.status(200).json({
          data: data,
          message: "Product Fetched Successfully"
        });
      
      }).catch(error => {
      // catch and print the error
        console.log(JSON.stringify(error));
        console.log("Not recieved");
      })

  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
      err.message = "Something went wrong on database operation";
    }
    next(err);
  }
};
exports.getAmazonIndiaProductData = async (req, res, next) => {

  try {
    let productCode = req.params.id;
    const params = {
      api_key: "E4991D6BCF4E4B0CBCD8E225C122A0CB",
        amazon_domain: "amazon.in",
        asin: productCode,
        type: "product"
      }
      
      // make the http GET request to Rainforest API
      axios.get('https://api.rainforestapi.com/request', { params })
      .then(response => {
        // print the JSON response from Rainforest API
        // console.log(JSON.stringify(response.data, 0, 2));
        variants = response.data.product.variants[0].dimensions.map(item => item.name);
        let options = [];
        let tempArray = [];
        for (let i = 0; i < response.data.product.variants.length; i++) {
          for (let j = 0; j < variants.length;j++){
            let newOption = response.data.product.variants[i].dimensions[j].value;
            if(i == 0){
              options[j] = newOption;
              tempArray.push(newOption);
            }else{
              const found = tempArray.includes(newOption);
              if(found !== true){
                tempArray.push(newOption);
                temp= options[j]+","+newOption;
                options[j] = temp;
              }
            }
          }
        }
        data = {
          name: response.data.product.title,
          brand: response.data.product.brand,
          images: response.data.product.images.map(item => item.link),
          variants: variants,
          options: options
        }
        res.status(200).json({
          data: data,
          message: "Product Fetched Successfully"
        });
      
      }).catch(error => {
      // catch and print the error
        console.log(JSON.stringify(error));
        console.log("Not recieved");
      })

  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
      err.message = "Something went wrong on database operation";
    }
    next(err);
  }
};
exports.getWalmartProductData = async (req, res, next) => {

  try {
    const productCode = req.params.id;
    const axios = require("axios");
    
    const options = {
      method: 'GET',
      url: 'https://walmart.p.rapidapi.com/products/v3/get-details',
      params: {usItemId: productCode},
      headers: {
        'X-RapidAPI-Key': '6733c44216mshc1cddfbbea29761p148b11jsn4e554d96952f',
        'X-RapidAPI-Host': 'walmart.p.rapidapi.com'
      }
    };
    
    axios.request(options).then(function (response) {
      // console.log(response.data);
      let options = [];
      for (let i = 0; i < response.data.data.product.variantCriteria.length; i++) {
        // console.log(response.data.data.product.variantCriteria[i].variantList[0]);
        for (let j = 0; j < response.data.data.product.variantCriteria[i].variantList.length;j++){
          let newOption = response.data.data.product.variantCriteria[i].variantList[j].name;
          if(j == 0){
            options[i] = newOption;
          }else{
            temp= options[i]+","+newOption;
            options[i] = temp;
          }
        }
      }
      let data = {
        name: response.data.data.product.name,
        description: response.data.data.product.detailedDescription,
        images: response.data.data.product.imageInfo.allImages.map(item => item.url),
        brand: response.data.data.product.brand,
        variants: response.data.data.product.variantCriteria.map(item => item.name),
        options: options
      }
      res.status(200).json({
        data: data,
        message: "Product Fetched Successfully"
      });
    }).catch(function (error) {
      console.error(error);
      err.statusCode = 500;
      err.message = "Something went wrong";
    });

    

  } catch (err) {
    if (!err.statusCode) {
      console.log(err);
      err.statusCode = 500;
      err.message = "Something went wrong on database operation";
    }
    next(err);
  }
};
