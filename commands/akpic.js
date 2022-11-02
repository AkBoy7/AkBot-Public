const pictures = ['./AkamPics/ALV.png', './AkamPics/dance.png', './AkamPics/intro.png',
'./AkamPics/liloof.png', './AkamPics/medrink.jpg', './AkamPics/sleep.png', './AkamPics/closed_eyes.jpg'];
const messagePic = ["hammer", "we just dancing", "I teach", "liloof", "thirsty", "go sleep", "GMM boring"];

//TODO: Fix image uploading
module.exports = function (msg, args) {
    console.log("Akpic requested by " + msg.author.username);    
    const index = Math.floor(Math.random() * pictures.length);
    const attachment = new MessageAttachment(pictures[index])
    msg.channel.send({ content: messagePic[index], files: [attachment] });
};
