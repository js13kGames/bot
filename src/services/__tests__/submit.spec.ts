import { submit } from "../submit";

describe("submit 13k form", () => {
  it("should submit", async () => {
    const bundleUrl =
      "http://js13kgames-entry-preview.s3-website-eu-west-1.amazonaws.com/cec73ecd46375ab7c64a85c8a4d2c172/bundle.zip";
    const imagesUrls = {
      image_large:
        "https://res.cloudinary.com/dy3iszldp/image/upload/c_fit,h_200,w_300/81d8ad1eef5dbf6feda2665a0df3bf19.jpg",
      image_thumbnail:
        "https://res.cloudinary.com/dy3iszldp/image/upload/c_fit,h_100,w_100/61191dccc4c29b4d785cae9b2f2eae2d.jpg"
    };
    const user = {
      name: "platane"
    };
    const game = {
      name: "[test] this is a test",
      description: "this is a test",
      repositoryUrl: `https://github.com/js13kGames/entry`
    };

    await submit({ user, game, imagesUrls, bundleUrl });
  });
});
