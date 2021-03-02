module.exports = function (msg, args) {
    const flip = Math.random()
    msg.channel.send("Flipping coin...");
    if (flip > 0.5) {
        setTimeout(() => {
            console.log("flipping coin, heads");
            msg.channel.send("It's HEADS!");
          }, 1000);
    } else {
        setTimeout(() => {
            console.log("flipping coin, tail");
            msg.channel.send("It's TAILS!");
          }, 1000);
    }
}