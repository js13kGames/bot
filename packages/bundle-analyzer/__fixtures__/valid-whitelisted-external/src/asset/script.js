console.log("this script is very loaded");

fetch("./asset/text.txt")
  .then((res) => res.text())
  .then((text) => {
    document.getElementById("text").innerHTML = text;
  });

console.log("three is loaded and the version is", THREE.REVISION);
