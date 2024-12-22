import fsp from "fs/promises"
import Handlebars from "handlebars";
import path from "path";
import { argv, argv0 } from "process";

Handlebars.registerHelper("eq", (arg1, arg2) => arg1 === arg2);
Handlebars.registerHelper("or", (arg1, arg2) => arg1 || arg2);
Handlebars.registerHelper("and", (arg1, arg2) => arg1 && arg2);
Handlebars.registerHelper("has", (arg1, arg2) => () => arg1.toString().indexOf(arg2) >= 0);

async function readCode(filePath) {
    try {
        const file = await fsp.readFile(filePath, "utf-8");
        return JSON.parse(file);
    }
    catch (error) {
        console.log(error)
    }
}

async function readTemplate(templatePath) {
    try {
        return await fsp.readFile(templatePath, "utf-8");
    }
    catch(error) {
        console.error("Error reading template file:", error);
        throw error;
    }
}

async function generateCode(cid, inPath, outPath) {
    try {

        if(!inPath || !outPath) {
            throw new Error("No file path provided");
        }

        console.log("Generating code...");

        const data = await readCode(inPath);

        const funcSource = await readTemplate("template/function.hbs");
        const classSource = await readTemplate("template/classes.hbs");
        let code = await fsp.readFile("template/generated.py", "utf-8");

        const funcTemplate = Handlebars.compile(funcSource);

        let funcCode = "";
        for(const [id, node] of Object.entries(data)) {
            funcCode += "#".repeat(80) + "\n\n";
            funcCode += funcTemplate({ cid, id, ...node });
            funcCode += "\n\n" + "#".repeat(80);
        }

        const classTemplate = Handlebars.compile(classSource);
        const nodes = Object.keys(data);

        let classCode = "";
        classCode += "\n" + "#".repeat(80) + "\n\n";
        classCode += classTemplate({ cid, nodes });
        classCode += "\n\n" + "#".repeat(80) + "\n";

        code = code.replace("# @Code", funcCode);
        code = code.replace("# @ClassList", classCode);

        await fsp.writeFile(path.join("generated/", outPath), code);

        console.log("Code generated successfully");

    }
    catch (error) {
        console.log(error)
    }
}

// generateCode(argv[2]);

export default generateCode;