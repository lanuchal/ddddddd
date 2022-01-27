const express = require("express");
const app = express();
const mysql = require("mysql");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { promisify } = require("util");
const fs = require("fs");
const convert = require("heic-convert");
const sharp = require("sharp");
const PROT = 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "203.159.93.176",
  user: "gurucaic_vegshop",
  password: "vz3h5A%1",
  database: "gurucaic_vegshop",
});
db.connect(function (err) {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to the MySQL server.");
});

app.get("/", (req, res) => {
  const ref_code = Date.now();
  var d = new Date(ref_code);
  var date_now =
    ("00" + d.getDate()).slice(-2) +
    "/" +
    ("00" + (d.getMonth() + 1)).slice(-2) +
    "/" +
    d.getFullYear();
  var time_now =
    ("00" + d.getHours()).slice(-2) +
    ":" +
    ("00" + d.getMinutes()).slice(-2) +
    ":" +
    ("00" + d.getSeconds()).slice(-2);
  res.send({
    title: "Welcom to wep api",
    wep_api: "https://vgtb.devcm.info",
    store: "ผักสดเชียงใหม่",
    day_now: date_now,
    time_now: time_now,
  });
});

// ----------------------------  Product
app.get("/product", (req, res) => {
  db.query("SELECT * FROM `product`", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});
app.get("/producttype", (req, res) => {
  db.query("SELECT * FROM `product_category`", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});
app.get("/productcate/:id", (req, res) => {
  let id = req.params.id;
  db.query(
    "SELECT a.* ,product_category.cate_id,product_category.cate_name, product.product_name,product.product_amount,product_unit.unit_name FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id LEFT JOIN `product_category` ON product.product_cate = product_category.cate_id WHERE product_category.cate_id = ?  GROUP BY a.price_date",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

app.get("/producthome", (req, res) => {
  db.query(
    // "SELECT a.* , product.product_name , product.product_amount , product_unit.unit_name FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id WHERE product.product_id IS NOT NULL GROUP BY a.price_date",
    "SELECT a.* ,product_category.cate_id,product_category.cate_name, product.product_name,product.product_amount,product_unit.unit_name FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id LEFT JOIN `product_category` ON product.product_cate = product_category.cate_id WHERE product.product_id IS NOT NULL GROUP BY a.price_date",
    (err, result) => {
      if (err) {
        console.log(err);
        res.send([{ result: "nok", data: result }]);
      } else {
        res.send([{ result: "ok", data: result }]);
      }
    }
  );
});

// ---------------------------- USER
// login
app.post("/login", (req, res) => {
  const user_username = req.body.user_username;
  const user_password = req.body.user_password;
  db.query(
    "SELECT * FROM user WHERE user_username = ?",
    user_username,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const ln = result.length;
        if (ln == 1 && result[0].user_password == user_password) {
          res.send([{ login: "ok", data: result }]);
        } else {
          res.send([{ login: "nok", data: result }]);
        }
      }
    }
  );
});

app.post("/register", (req, res) => {
  const name = req.body.name;
  const user_username = req.body.user_username;
  const user_password = req.body.user_password;
  const addr = req.body.addr;

  const ref_code = Date.now();
  var d = new Date(ref_code);
  var result_time_a =
    d.getFullYear() +
    "-" +
    ("00" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("00" + d.getDate()).slice(-2) +
    " " +
    ("00" + d.getHours()).slice(-2) +
    ":" +
    ("00" + d.getMinutes()).slice(-2) +
    ":" +
    ("00" + d.getSeconds()).slice(-2);

  db.query(
    "SELECT * FROM user WHERE user_username = ?",
    user_username,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const ln = result.length;
        if (ln == 1) {
          res.send([{ result: "nok", data: result }]);
        } else {
          db.query(
            "INSERT INTO user (branch,name, user_username, user_password,user_type,addr,user_grade,user_status,date_register) VALUES (?,?,?,?,?,?,?,?,?)",
            [
              0,
              name,
              user_username,
              user_password,
              2,
              addr,
              "D",
              9,
              result_time_a,
            ],
            (err, result) => {
              if (err) {
                // console.log(err);
              } else {
                res.send([{ result: "ok", data: result }]);
              }
            }
          );
        }
      }
    }
  );
});
app.get("/user/:id", (req, res) => {
  let id = req.params.id;
  db.query("SELECT * FROM user WHERE user_id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send([{ data: result }]);
    }
  });
});
// ubdate pass_user
app.put("/updatepass", (req, res) => {
  const id = req.body.id;
  const old_password = req.body.old_password;
  const new_password = req.body.new_password;
  db.query("SELECT * FROM user WHERE user_id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const ln = result.length;
      if (ln == 1 && old_password == result[0].user_password) {
        db.query(
          "UPDATE user SET user_password = ? WHERE user_id =?",
          [new_password, id],
          (error, results, fields) => {
            if (error) throw error;
            let message = "";
            if (results.changedRows === 0) {
              message = "data not found or data are same";
            } else {
              message = "data sucsessfully update";
            }
            return res.send({ result: "ok", data: results, message: message });
          }
        );
      } else {
        res.send([{ result: "nok" }]);
      }
    }
  });
});
// ubdate photo1
const convertImg1 = async (partImg, data) => {
  const inputBuffer = await promisify(fs.readFile)(
    "./upload/images/" + partImg + "/" + data
  );
  const images = await convert.all({
    buffer: inputBuffer, // the HEIC file buffer
    format: "JPEG", // output format
  });

  const heicUp = data.substring(0, data.length - 10);
  for (let idx in images) {
    const image = images[idx];
    const outputBuffer = await image.convert();
    await promisify(fs.writeFile)(
      `./upload/images/${partImg}/${heicUp}_s.jpg`,
      outputBuffer
    );
  }
  const part = `./upload/images/${partImg}/${heicUp}_s.jpg`;
  const rm = part.substring(0, part.length - 2);
  setTimeout(() => {
    console.log("1555 = " + part);
    sharp(part)
      .resize({ height: 600, width: 600 })
      .toFile("./upload/images/" + partImg + "/" + heicUp + ".png")
      .then(function (newFileInfo) {
        console.log("Image Resized");
        try {
          fs.unlinkSync(part);
          console.error("delete success!!");
        } catch (err) {
          console.error("delete flase!!");
        }
      })
      .catch(function (err) {
        console.log("Got Error");
      });
  }, 1500);

  const paths = "./upload/images/" + partImg + "/" + data;
  try {
    fs.unlinkSync(paths);
    console.error("delete success!! + " + paths);
  } catch (err) {
    console.error("delete flase!!");
  }
};
const storage = multer.diskStorage({
  destination: "./upload/images/img1",
  filename: (req, file, cb) => {
    const id = req.body.id;
    const ref_code = Date.now();
    // console.log("id : " + id);
    var d = new Date(ref_code);
    var result_time =
      d.getFullYear() +
      ("00" + (d.getMonth() + 1)).slice(-2) +
      ("00" + d.getDate()).slice(-2) +
      ("00" + d.getHours()).slice(-2) +
      ("00" + d.getMinutes()).slice(-2) +
      ("00" + d.getSeconds()).slice(-2) +
      ("00" + d.getUTCMilliseconds()).slice(-2);
    if (path.extname(file.originalname) == ".HEIC") {
      return cb(
        null,
        `${id}_1_${result_time}_heic${path.extname(file.originalname)}`
      );
    } else {
      return cb(
        null,
        `${id}_1_${result_time}_s${path.extname(file.originalname)}`
      );
    }
  },
});

const upload = multer({
  storage: storage,
});

app.use("/profile1", express.static("upload/images/img1"));
app.post("/upload1", upload.single("profile1"), async (req, res) => {
  const id = req.body.id;

  db.query("SELECT * FROM user WHERE user_id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const imgName = result[0].user_img1;
      if (imgName != null) {
        let resultName = imgName.substring(imgName.length - 27, imgName.length);
        const rmImg2 = resultName.split(".")[0] + ".png";
        const paths2 = "./upload/images/img1/" + rmImg2;
        try {
          fs.unlinkSync(paths2);
          console.error("delete success!!");
        } catch (err) {
          console.error("delete flase!!");
        }
      }

      const ln = result.length;
      var urlname = req.file.filename;

      var lastIm = urlname.split(".")[1];

      var fristIm = urlname.split(".")[0];

      var heicUp = fristIm.substring(0, fristIm.length - 2);

      if (lastIm == "HEIC") {
        heicUp = fristIm.substring(0, fristIm.length - 5);
        lastIm = "jpg";

        convertImg1("img1", urlname);
        //
      }
      console.log("heicUp = " + heicUp);
      if (lastIm != "HEIC") {
        sharp(req.file.path)
          .resize({ height: 600, width: 600 })
          .toFile("./upload/images/img1/" + heicUp + ".png")
          .then(function (newFileInfo) {
            console.log("Image Resized");
            try {
              fs.unlinkSync(req.file.path);
              console.error("delete success!!");
            } catch (err) {
              console.error("delete flase!!");
            }
          })
          .catch(function (err) {
            console.log("Got Error");
          });
      }
      // console.log("lastIm = " + heicUp);
      if (ln == 1) {
        db.query(
          "UPDATE user SET  user_img1 = ? WHERE user_id =?",
          [`https://vgtb.devcm.info/profile1/${heicUp}.png`, id],
          (error, results, fields) => {
            if (error) throw error;
            let message = "";
            if (results.changedRows === 0) {
              res.send({
                result: "false",
                data: results,
                message: "data not found or data are same",
              });
            } else {
              res.send({
                result: "ok",
                data: results,
                message: "data  sucsessfully update",
              });
            }
          }
        );
      }
    }
  });
});
// end upload photo1

// ubdate photo2W
const storage2 = multer.diskStorage({
  destination: "./upload/images/img2",
  filename: (req, file, cb) => {
    const id = req.body.id;
    const ref_code = Date.now();
    // console.log("id : " + id);
    var d = new Date(ref_code);

    var result_time =
      d.getFullYear() +
      ("00" + (d.getMonth() + 1)).slice(-2) +
      ("00" + d.getDate()).slice(-2) +
      ("00" + d.getHours()).slice(-2) +
      ("00" + d.getMinutes()).slice(-2) +
      ("00" + d.getSeconds()).slice(-2) +
      ("00" + d.getUTCMilliseconds()).slice(-2);
    if (path.extname(file.originalname) == ".HEIC") {
      return cb(
        null,
        `${id}_2_${result_time}_heic${path.extname(file.originalname)}`
      );
    } else {
      return cb(
        null,
        `${id}_2_${result_time}_s${path.extname(file.originalname)}`
      );
    }
  },
});

const upload2 = multer({
  storage: storage2,
});

app.use("/profile2", express.static("upload/images/img2"));
app.post("/upload2", upload2.single("profile2"), (req, res) => {
  const id = req.body.id;
  db.query("SELECT * FROM user WHERE user_id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      const imgName = result[0].user_img2;
      if (imgName != null) {
        let resultName = imgName.substring(imgName.length - 27, imgName.length);
        const paths = "./upload/images/img2/" + resultName;
        const rmImg2 = resultName.split(".")[0] + ".png";
        const paths2 = "./upload/images/img2/" + rmImg2;
        try {
          fs.unlinkSync(paths2);
          console.error("delete success!!");
        } catch (err) {
          console.error("delete flase!!");
        }
      }

      const ln = result.length;
      var urlname = req.file.filename;

      var lastIm = urlname.split(".")[1];
      var fristIm = urlname.split(".")[0];
      var heicUp = fristIm.substring(0, fristIm.length - 2);
      if (lastIm == "HEIC") {
        heicUp = fristIm.substring(0, fristIm.length - 5);
        lastIm = "jpg";
        // console.log("HEIC : " + heicUp);
        convertImg1("img2", urlname);
        //
      }
      if (lastIm != "HEIC") {
        sharp(req.file.path)
          .resize({ height: 600, width: 600 })
          .toFile("./upload/images/img2/" + heicUp + ".png")
          .then(function (newFileInfo) {
            console.log("Image Resized");
            try {
              fs.unlinkSync(req.file.path);
              console.error("delete success!!");
            } catch (err) {
              console.error("delete flase!!");
            }
          })
          .catch(function (err) {
            console.log("Got Error");
          });
      }
      console.log("lastIm = " + heicUp);
      if (ln == 1) {
        db.query(
          "UPDATE user SET  user_img2 = ? WHERE user_id =?",
          [`https://vgtb.devcm.info/profile2/${heicUp}.png`, id],
          (error, results, fields) => {
            if (error) throw error;
            let message = "";
            if (results.changedRows === 0) {
              res.send({
                result: "false",
                data: results,
                message: "data not found or data are same",
              });
            } else {
              res.send({
                result: "ok",
                data: results,
                message: "data  sucsessfully update",
              });
            }
          }
        );
      }
    }
  });
});

// end upload photo1

app.put("/updateuser", (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const addr = req.body.addr;
  const user_tel = req.body.user_tel;
  const addr_lat = req.body.addr_lat;
  const addr_long = req.body.addr_long;
  db.query(
    "UPDATE user SET  name = ? , addr = ?, user_tel = ?,addr_lat = ?,addr_long = ? WHERE user_id =?",
    [name, addr, user_tel, addr_lat, addr_long, id],
    (error, results, fields) => {
      if (error) throw error;
      // let message = "";
      if (results.changedRows === 0) {
        res.send({
          result: "false",
          data: results,
          message: "data not found or data are same",
        });
      } else {
        res.send({
          result: "ok",
          data: results,
          message: "data  sucsessfully update",
        });
      }
    }
  );
});
app.post("/select-product", (req, res) => {
  const ref_code = Date.now();
  var d = new Date(ref_code);
  var result_time =
    d.getFullYear() +
    ("00" + (d.getMonth() + 1)).slice(-2) +
    ("00" + d.getDate()).slice(-2) +
    ("00" + d.getHours()).slice(-2) +
    ("00" + d.getMinutes()).slice(-2) +
    ("00" + d.getSeconds()).slice(-2);
  // ("00" + d.getUTCMilliseconds()).slice(-2);
  // d.getUTCMilliseconds();
  var result_time_a =
    d.getFullYear() +
    "-" +
    ("00" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("00" + d.getDate()).slice(-2) +
    " " +
    ("00" + d.getHours()).slice(-2) +
    ":" +
    ("00" + d.getMinutes()).slice(-2) +
    ":" +
    ("00" + d.getSeconds()).slice(-2);
  // console.log(result_time);

  const id = req.body.id;
  const product_id = req.body.product_id;
  const price_id = req.body.price_id;
  const pro_req_amount = req.body.pro_req_amount;
  db.query(
    "SELECT * FROM bill WHERE user_id = ? ORDER BY bill_ref_code DESC",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (!result[0] || result[0].bill_status != 1) {
          // res.send({ ff: result });
          db.query(
            "INSERT INTO bill ( user_id,  bill_ref_code,bill_include_price,bill_deliv_price , bill_date , bill_status) VALUES (?,?,?,?,?,?)",
            [id, result_time, 0, 0, result_time_a, 1],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                // res.send({
                //   result: "ok",
                //   data: result,
                //   message: "insert bill success!!",
                // });
                // console.log(result.insertId);
                db.query(
                  "INSERT INTO product_request (bill_id, product_id, price_id,user_grade, pro_req_by, pro_req_amount, pro_req_date, pro_req_status) " +
                    " VALUES (?,?,?,?,?,?,?,?)",
                  [
                    result.insertId,
                    product_id,
                    price_id,
                    "A",
                    id,
                    pro_req_amount,
                    result_time_a,
                    1,
                  ],
                  (err, result) => {
                    if (err) {
                      res.send({
                        result: "fail",
                        data: result,
                        message: "insert bill fail!!",
                      });
                    } else {
                      // console.log("2");
                      db.query(
                        "SELECT * FROM product WHERE product_id = ?",
                        product_id,
                        (err, result) => {
                          if (err) {
                            console.log(err);
                          } else {
                            console.log(result);
                            res.send({
                              result: "ok",
                              data: result,
                              message: "insert bill success!!",
                            });
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        } else {
          db.query(
            "SELECT * FROM product_request WHERE pro_req_by = ? ORDER BY bill_id DESC",
            id,
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                // console.log(product_id);
                const billId = result[0].bill_id;
                db.query(
                  "SELECT * FROM product_request WHERE product_id = ? AND bill_id = ? ORDER BY product_id DESC LIMIT 0,1",
                  [product_id, result[0].bill_id],
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    } else {
                      if (result.length == 1) {
                        res.send({
                          result: "nok",
                        });
                      } else {
                        db.query(
                          "INSERT INTO product_request (bill_id, product_id, price_id,user_grade, pro_req_by, pro_req_amount, pro_req_date, pro_req_status) " +
                            " VALUES (?,?,?,?,?,?,?,?)",
                          [
                            billId,
                            product_id,
                            price_id,
                            "A",
                            id,
                            pro_req_amount,
                            result_time_a,
                            1,
                          ],
                          (err, result) => {
                            if (err) {
                            } else {
                              db.query(
                                "SELECT * FROM product WHERE product_id = ?",
                                product_id,
                                (err, result) => {
                                  if (err) {
                                    console.log(err);
                                  } else {
                                    console.log(result[0].product_amount);
                                    res.send({
                                      result: "ok",
                                      data: result,
                                      message: "insert bill success!!",
                                    });
                                  }
                                }
                              );
                              
                            }
                          }
                        );
                      }
                    }
                  }
                );
              }
            }
          );

          // res.send({ tt: result });
        }
        // console.log(result);
      }
    }
  );
});
app.get("/order/:id", (req, res) => {
  let id = req.params.id;

  db.query(
    "SELECT a.* ,product_category.cate_id,product_category.cate_name, product.product_name,product.product_amount,product_unit.unit_name,product_request.pro_req_id,product_request.pro_req_amount FROM product_price a INNER JOIN (SELECT product_id, MAX(price_date) AS price_date FROM `product_price` GROUP BY product_id) b ON a.product_id = b.product_id AND a.price_date = b.price_date LEFT JOIN `product` ON product.product_id = a.product_id LEFT JOIN `product_unit` ON product.unit_id = product_unit.unit_id LEFT JOIN `product_category` ON product.product_cate = product_category.cate_id LEFT JOIN `product_request` ON product_request.product_id = product.product_id WHERE product_request.pro_req_by = ? AND product_request.pro_req_status = 1 GROUP BY a.price_date",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({
          result: "ok",
          data: result,
          message: "get data success!!!",
        });
      }
    }
  );
});

app.get("/price/:id", (req, res) => {
  let id = req.params.id;

  db.query(
    "SELECT * FROM `product_price` WHERE product_id = ? ORDER BY price_id DESC LIMIT 0,1 ",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});
app.put("/submitorder", (req, res) => {
  const bill_id = req.body.bill_id;
  db.query(
    " UPDATE product_request SET  pro_req_status = 2  WHERE bill_id = ? ",
    [bill_id],
    (error, results, fields) => {
      if (error) throw error;
      // let message = "";
      if (results.changedRows === 0) {
        res.send({
          result: "false",
          data: results,
          message: "data not found or data are same",
        });
      } else {
        db.query(
          " UPDATE bill SET  bill_status = 2  WHERE bill_id = ?",
          [bill_id],
          (error, results, fields) => {
            if (error) throw error;
            // let message = "";
            if (results.changedRows === 0) {
              res.send({
                result: "false",
                data: results,
                message: "data not found or data are same",
              });
            } else {
              res.send({
                result: "ok",
                data: results,
                message: "data  sucsessfully update",
              });
            }
          }
        );
      }
    }
  );
});

app.put("/upamountproduct", (req, res) => {
  const product_id = req.body.product_id;
  const product_amount = req.body.product_amount;
  db.query(
    " UPDATE product SET  product_amount = ?  WHERE product_id = ? ",
    [product_amount, product_id],
    (error, results, fields) => {
      if (error) throw error;
      // let message = "";
      if (results.changedRows === 0) {
        res.send({
          result: "false",
          data: results,
          message: "data not found or data are same",
        });
      } else {
        res.send({
          result: "ok",
          data: results,
          message: "data  sucsessfully update",
        });
      }
    }
  );
});

app.delete("/deleteoder/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM product_request WHERE `pro_req_id` = ? ",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send({
          result: "ok",
          data: result,
          message: "delete  sucsessfully",
        });
      }
    }
  );
});
app.delete("/deletebill/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM bill WHERE `bill_id` = ? ", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      db.query(
        "DELETE FROM product_request WHERE `bill_id` = ? ",
        id,
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.send({
              result: "ok",
              data: result,
              message: "delete  sucsessfully",
            });
          }
        }
      );
    }
  });
});
app.listen(PROT, () => {
  console.log("Yey, your server is running on port " + PROT);
});
