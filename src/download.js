import fsp from "fs/promises"
import path from "path";

async function getGMICFilters(version) {
    try {
        const response = await fetch(`https://gmic.eu/update${version}.json`);
        const data = await response.text();
    
        fsp.writeFile(path.join(`./download/${version}.json`), data);
    }
    catch(error) {
        console.log(error);
    }
}

getGMICFilters("343");