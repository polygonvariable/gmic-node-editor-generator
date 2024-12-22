import fsp from "fs/promises"
import path from "path";

async function readFilter(version) {
    try {
        const file = await fsp.readFile(path.join(`./download/${version}.json`), "utf-8");
        return JSON.parse(file);
    }
    catch (error) {
        console.log(error);
    }
}

function findFilterData(filters, commad) {
    try {
        
        let data;
        for(const category of filters.categories) {

            for(let i = 0, len = category.filters.length; i < len; i++) {
                if(category.filters[i].command == commad) {
                    data = category.filters[i];
                    break;
                }
            }
            
        }

        if(!data) {
            throw new Error("No filter found");
        }

        return data;

    }
    catch(error) {
        console.log(error);
    }
}

function addZero(value) {
    return (value.indexOf(".") == -1) ? `${value}.0` : value;
}

function createNode(filters, commands) {

    const nodes = {};

    for(const command of commands) {

        let scrap = false;
        let commandId = command.split(" ")[0];

        const data = findFilterData(filters, commandId);

        if(!data || !data.name) {
            continue;
        }

        let nodeId = `GMIC_${data.name.replace(/\W/g, "").toLowerCase()}`;
        let author;

        let property = {};
        let commandCode = "";
        
        for(const parameter of data.parameters) {

            let parameterId;
            if(parameter.name) {
                parameterId = `var${parameter.name.replace(/\W/g, "").toLowerCase()}`;
            }

            if(parameter.type === "float") {
                property[parameterId] = {
                    type: "FloatProperty",
                    name: parameter.name,
                    default: addZero(parameter.default),
                    min: addZero(parameter.min),
                    max: addZero(parameter.max)
                }
                commandCode += `{self.${parameterId}},`;
            }
            else if(parameter.type === "int") {
                property[parameterId] = {
                    type: "IntProperty",
                    name: parameter.name,
                    default: parameter.default,
                    min: parameter.min,
                    max: parameter.max
                }
                commandCode += `{self.${parameterId}},`;
            }
            else if(parameter.type === "bool") {
                property[parameterId] = {
                    type: "BoolProperty",
                    name: parameter.name,
                    default: parameter.default,
                }
                commandCode += `{self.${parameterId}},`;
            }
            else if(parameter.type === "choice") {
                property[parameterId] = {
                    type: "EnumProperty",
                    name: parameter.name,
                    default: parameter.default,
                    items: Object.values(parameter.choices)
                }
                commandCode += `{self.${parameterId}},`;
            }
            else if(parameter.type === "text") {
                property[parameterId] = {
                    type: "StringProperty",
                    name: parameter.name,
                    default: parameter.default
                }
                commandCode += `{self.${parameterId}},`;
            }
            else if(parameter.type === "color") {
                scrap = true;
            }
            else if(parameter.type === "note") {
                if(parameter.text.match(/\d{4}/gm)) {
                    author = parameter.text.replace(/\s+/g, " ");
                }
            }
        }

        if(scrap) {
            console.log("Node not added as some property is not supported (color)");
            continue;
        }

        nodes[nodeId] = {
            name: data.name,
            author: author,
            property: property,
            command: {
                reference: command,
                final: `${command} ${commandCode}`
            },
        }
    }

    return nodes;

}

async function createTransformer(version, id, commands) {
    try {

        const filters = await readFilter(version);
        if(!filters) {
            throw new Error("No filters found");
        }

        const nodes = createNode(filters, commands);

        fsp.writeFile(path.join(`./json/${id}.gen.json`), JSON.stringify(nodes), "utf-8");


    }
    catch(error) {
        console.log(error);
    }
}

createTransformer("343", "fartistic" , [ "samj_Filtres_Sur_Tuiles" ]);