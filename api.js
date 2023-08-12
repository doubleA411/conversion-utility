var channelid = "UCBJycsmduvYEL83R_U4JriQ"; // REPLACE WITH YOUR CHANNEL ID

function onlive() {
 console.log("is live.....")
}

/* REST OF THE CODE */

fetch("https://www.youtube.com/channel/" + channelid)
  .then(function (response) {
    return response.text();
  })
  .then(function (html) {
    if (html.includes("hqdefault_live.jpg")) {
      onlive();
    } else {
        console.log("is not live...")
    }
  })
  .catch(function (err) {
    console.warn("Something went wrong", err);
  });
