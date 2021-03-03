const pictures = ['./AkamPics/ALV.png', './AkamPics/dance.png', './AkamPics/intro.png',
'./AkamPics/liloof.png', './AkamPics/medrink.jpg', './AkamPics/sleep.png', './AkamPics/closed_eyes.jpg'];
const messagePic = ["hammer", "we just dancing", "I teach", "liloof", "thirsty", "go sleep", "GMM boring"];

module.exports = function (msg, args) {
    console.log("Akpic requested by " + msg.author.username);    
    const index = Math.floor(Math.random() * pictures.length);
    msg.channel.send(messagePic[index], { files: [pictures[index]] });
};
