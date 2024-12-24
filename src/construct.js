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
            throw new Error(`No filter found: ${commad}`);
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
                commandCode += `@@{self.${parameterId}}@@,`;
            }
            else if(parameter.type === "color") {

                const v4Color = parameter.default.split(",");

                let v3Color;
                if(v4Color.length > 3) {
                    v3Color = v4Color.slice(0, 3);
                }
                else {
                    v3Color = v4Color;
                }

                for(let i = 0, len = v3Color.length; i < len; i++) {
                    v3Color[i] = addZero(((v3Color[i] * 1) / 255).toString());
                }
                property[parameterId] = {
                    type: "FloatVectorProperty",
                    name: parameter.name,
                    default: `(${v3Color.join(",")})`,
                    min: "0.0",
                    max: "1.0"
                }

                let v4Param = "";
                if(v4Color[3]) {
                    property[`${parameterId}_alpha`] = {
                        type: "FloatProperty",
                        name: parameter.name,
                        default: addZero(((v4Color[3] * 1) / 255).toString()),
                        min: 0.0,
                        max: 1.0
                    }
                    v4Param = `{self.${parameterId}_alpha*255},`;
                }

                commandCode += `{self.${parameterId}[0]*255},{self.${parameterId}[1]*255},{self.${parameterId}[2]*255},${v4Param}`;
                //scrap = true;
            }
            else if(parameter.type === "value") {
                if(parameter.value.indexOf(",") == -1) {
                    commandCode += `${parameter.value},`;
                }
                else {
                    commandCode += `@@${parameter.value}@@,`;
                }
            }
            else if(parameter.type === "point") {
                if(parameter.visibility && parameter.visibility === "0") {

                    commandCode += `${parameter.position},`;

                }
                else {
                    
                    let point = parameter.position.split(",");
                    
                    property[`${parameterId}_x`] = {
                        type: "FloatProperty",
                        name: `${parameter.name} X`,
                        default: addZero(point[0]),
                        min: "0.0",
                        max: "10000.0"
                    }
                    property[`${parameterId}_y`] = {
                        type: "FloatProperty",
                        name: `${parameter.name} Y`,
                        default: addZero(point[1]),
                        min: "0.0",
                        max: "10000.0"
                    }
                    commandCode += `{self.${parameterId}_x},{self.${parameterId}_y},`;

                }
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