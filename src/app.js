import constructB3DFilter from "./construct.js";
import generateCode from "./generate.js";

async function main(commands = []) {
    try {

        await constructB3DFilter("343", "out" , commands);
        await generateCode("FPattern", "./json/out.gen.json", "out.gen.py");

    }
    catch (error) {
        console.log(error);
    }
}

function formatCommands() {
    const data = `
    rgb2bayer 0,1
    fx_boxfitting 3,0,0.25,2,0
    fx_camouflage 9,12,100,30,46,33,75,90,65,179,189,117,255,246,158
    fx_canvas 70,45,400,1,70,135,400,0,50,50
    texturize_canvas 20,3,0.6
    jeje_clouds 50,0.5
    fx_cracks 30,1,255,255,255,128,0,0,50,50
    fx_crystal 50,0.2,20,0,50,50
    fx_crystal_background 10,25,0,100,1
    Denim_samj 5,2,0,40,40,25,50,0,43,108,126,255
    jeje_fibers 10,50,10,0
    jeje_freqy_pattern 50,33,50,0
    fx_halftone 0,0,0,0,5,8,8,5,0.1,0,50,50
    fx_generic_halftone 0,1,100,10,1,0,4,0,75,1,0,"0,1,100,10,1,0,4,0,75,1,0"
    iain_halftone_shapes 100,0,0,0,0,0,0
    fx_hearts 2,0,0,50,50
    hedcut 0.5,0.5,0.5,0,0.5,0,1,0
    fx_lava 8,5,3,0,0,50,50
    fx_marble 0.5,1,0,0,0.4,0.6,0.6,1.1,0,100
    fx_maze 24,1,0,1,0
    fx_mineral_mosaic 1,2,1,100,0
    fx_mosaic 50,0,0,50,50
    fx_shapes 1,16,10,2,5,90,0,0,1,1,0
    fx_pack_ellipses 3,20,0,30,100,6,1,3,0,0,0,255,0,0
    fx_paper 0,0,50,50
    jeje_periodic_dots 6,4,0,1,0
    fx_pills 0,4,0,4,0,4,0,4,0
    fx_plaid_texture 50,2,0,90,1,300
    fx_polka_dots 80,20,50,50,0,0.5,0.1,1,255,0,0,255
    fx_color_ellipses 400,8,0.1
    jeje_rays 50,50,10,0,0.5,255,0,0,255,255,0,0
    samj_reptile 0,64,25,2,0,40,1
    syntexturize 1024,1024,0,0,50,50
    syntexturize_matchpatch 512,512,0,7,5,1,0,0,50,50
    fx_rorschach 3,1,2
    fx_satin 20,1,0,0,0,0,255,255,255,255,255,0,0,0,-50,0,0
    fx_mad_rorscharchp 3,0,50,1,300,0,0,0,0
    fx_seamless_turbulence 15,20,0,1,3,0
    fx_shockwaves 10,10,20,0,0,50,50
    samj_Soft_Random_Shades 140,120,220,255,0,20,0
    fx_sponge 13,0,0,50,50
    fx_stained_glass 20,0.1,1,1,1,0,0,0,0,50,50
    fx_stars 10,0,32,5,0.38,0,255,255,100,200
    fx_stencil 3,0,8,0,2,0,0,50,50
    jeje_strip 45,50,0,1,0
    fx_tetris 10
    fx_triangular_pattern 43,7,4,4,4,0,0,0,100,0,0,0,160,1
    fx_truchet 32,5,1,1,0
    iain_turbulent_halftone 15,20,0,1,512,0.75,0,0,0
    fx_voronoi 160,1,0.5,50,3,1,0,0,0,100,2,255,255,255,40,1
    weave 6,65,0,0.5,0,0,0,0,0
    fx_whirls 7,2,0.2,1.8,11,0,50,50
    `;

    const commands = [];
    const match = data.matchAll(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)/gm);
    for(const command of match) {
        commands.push(command[0].trim());
    }

    return commands;

}

main(formatCommands());