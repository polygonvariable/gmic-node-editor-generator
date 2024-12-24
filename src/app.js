import constructB3DFilter from "./construct.js";
import generateCode from "./generate.js";

async function main() {
    try {

        await constructB3DFilter("343", "out" , [
            "fx_kaleidoscope",
            "gui_rep_polkal",
            "fx_symmetrizoscope",
            "rep_logpindis_gui",
            "moon2panorama",
            "fx_warp_perspective",
            "fx_rep_pxpush",
            "gui_rep_pw",
            "fx_transform_polar",
            "fx_quadrangle",
        ]);
        await generateCode("FDeform", "./json/out.gen.json", "out.gen.py");

    }
    catch (error) {
        console.log(error);
    }
}

main();