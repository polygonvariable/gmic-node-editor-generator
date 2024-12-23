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

        let nodeId = `${data.name.replace(/\W/g, "").toLowerCase()}`;
        let author;

        let property = {};
        let commandCode = "";
        let index = 0;
        
        for(const parameter of data.parameters) {

            // let parameterId;
            // if(parameter.name) {
            //     parameterId = `var_${parameter.name.replace(/\W/g, "").toLowerCase()}`;
            //     if(parameterId.includes("preview")) {
            //         continue;
            //     }
            // }
            let parameterId = `var_prop${index}`;

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
                commandCode += `{int(self.${parameterId})},`;
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
            else if(parameter.type === "text" || parameter.type === "file") {
                property[parameterId] = {
                    type: "StringProperty",
                    name: parameter.name,
                    default: parameter.default
                }
                commandCode += `{self.${parameterId}},`;
            }
            else if(parameter.type === "color") {

                let pColor = parameter.default.split(",");
                if(pColor.length > 3) {
                    pColor = pColor.slice(0, 3);
                }

                for(let i = 0, len = pColor.length; i < len; i++) {
                    pColor[i] = addZero(pColor[i]);
                }

                property[parameterId] = {
                    type: "FloatVectorProperty",
                    name: parameter.name,
                    default: `(${pColor.join(",")})`,
                    min: "0.0",
                    max: "1.0"
                }
                commandCode += `{self.${parameterId}[0]},{self.${parameterId}[1]},{self.${parameterId}[2]},255,`;
                //scrap = true;
            }
            else if(parameter.type === "value") {
                commandCode += `${Math.abs(parameter.value)},`;
            }
            else if(parameter.type === "point") {
                commandCode += `${parameter.position},`;
            }
            else if(parameter.type === "button") {
                scrap = true;
            }
            else if(parameter.type === "note") {
                if(parameter.text.match(/\d{4}/gm)) {
                    author = parameter.text.replace(/\s+/g, " ");
                }
            }

            index++;

        }

        if(scrap) {
            console.log("Node not added as some property is not supported");
            continue;
        }

        nodes[nodeId] = {
            name: data.name,
            author: author,
            property: property,
            command: {
                reference: command,
                final: `${command} ${commandCode.slice(0, commandCode.length - 1)}`
            },
        }
    }

    return nodes;

}

async function constructB3DFilter(version, id, commands) {
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

//constructB3DFilter("343", "fartistic" , [ "samj_Ellipses_Colorees" ]);

export default constructB3DFilter;