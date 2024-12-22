import constructB3DFilter from "./construct.js";
import generateCode from "./generate.js";

async function main() {
    try {

        await constructB3DFilter("343", "fartistic" , [ "fx_boost_chroma", "cartoon", "samj_chalkitup" ]);
        await generateCode("FArt", "./json/fartistic.gen.json", "fartistic.gen.py");

    }
    catch (error) {
        console.log(error);
    }
}

main();