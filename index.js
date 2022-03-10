const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
const axios = require("axios");
const res = require("express/lib/response");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/hello", cors(), () => {
  res.send("Hello World !");
});

app.post("/get-images", cors(), async (req, res) => {
  const data = [];
  try {
    if (!req.body.urls)
      return res.status(400).send({
        message: "URLs are required",
      });
    const fetchImages = await Promise.all(
      req.body.urls.map((url, id) => {
        return new Promise(async (resolve, reject) => {
          await axios
            .get(url, {
              responseType: "arraybuffer",
              headers: {
                referer: req.body.origin || "",
                origin: req.body.origin || "",
              },
            })
            .then(async (response) => {
              const file = await Buffer.from(response.data, "binary").toString("base64");
              await data.push({
                id,
                url: `data:image/png;base64,${file}`,
              });
              resolve(data);
            })
            .catch((error) => reject(error));
        });
      })
    );
    while (data.length !== req.body.urls.length) fetchImages();
  } catch (error) {
    console.log(error);
  }
  if (data.length > 0) {
    // sort all img with id
    data.sort(function (a, b) {
      let idA = a.id;
      var idB = b.id;
      if (idA < idB) {
        return -1;
      }
      if (idA > idB) {
        return 1;
      }
      return 0;
    });
    return res.send({ data });
  }
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
