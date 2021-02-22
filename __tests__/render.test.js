const render = require('../src/render');

describe("get PR Comment", function () {

    describe("no files", function () {

        const files = [];
        it("coverage greater than min coverage", function () {
            const comment = render.getPRComment(49.23, files, 30);
            expect(comment).toEqual(
                `> There is no coverage information present for the Files changed

|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|`
            );
        });

        it("coverage lesser than min coverage", function () {
            const comment = render.getPRComment(49.23, files, 70);
            expect(comment).toEqual(
                `> There is no coverage information present for the Files changed

|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|`
            );
        });
    });

    describe("multiple files", function () {

        const files = [
            {
                "coverage": 46.67,
                "filePath": "src/main/kotlin/com/madrapps/jacoco/Math.kt",
                "name": "Math.kt",
                "url": "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt",
            },
            {
                "filePath": "src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                "url": "https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java",
                "name": "StringOp.java",
                "coverage": 100,
            },
        ];

        it("coverage greater than min coverage", function () {
            const comment = render.getPRComment(49.23, files, 30);
            expect(comment).toEqual(
                `|File|Coverage||
|:-|:-:|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:green_apple:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|

|Total Project Coverage|49.23%|:green_apple:|
|:-|:-:|:-:|`
            );
        });

        it("coverage lesser than min coverage", function () {
            const comment = render.getPRComment(49.23, files, 70);
            expect(comment).toEqual(
                `|File|Coverage||
|:-|:-:|:-:|
|[Math.kt](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/kotlin/com/madrapps/jacoco/Math.kt)|46.67%|:x:|
|[StringOp.java](https://github.com/thsaravana/jacoco-playground/blob/77b14eb61efcd211ee93a7d8bac80cf292d207cc/src/main/java/com/madrapps/jacoco/operation/StringOp.java)|100%|:green_apple:|

|Total Project Coverage|49.23%|:x:|
|:-|:-:|:-:|`
            );
        });
    });
})