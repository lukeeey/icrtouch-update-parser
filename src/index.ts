import chalk from "chalk";
import fetch from "node-fetch";
import { promisify } from "util";
import { parseString } from "xml2js";
import { Update } from "./types";
import fs from "fs";

const OUTPUT_DIR = "./output/markdown";

const DOWNLOAD_URL = "https://www.icrtouch.com/updates/icrtouch";
const UPDATE_URL = "https://www.icrtouch.com/updates/icrtouch/gettoc.php";

async function init() {
    console.log(chalk.green("ICRTouch Updater Fetcher"));
    const updates = await fetchUpdates();

    fs.mkdirSync(OUTPUT_DIR + "/updates", { recursive: true });

    let readme = "";
    readme += "# ICRTouch Updates\n\n";

    const updatesByYear = {} as any;

    for (let answer of updates) {
        const year = answer.DATE[0].split("/")[2];

        if (!updatesByYear[year]) {
            updatesByYear[year] = [];
        }

        updatesByYear[year].push(answer);

        let markdown = "";
        markdown += `# ${answer.VERSIONTEXT} - ${answer.DATE}\n\n`;
        markdown += `__Version ID__: ${answer.VERSIONID}\n<br>`;
        markdown += `__Min Version ID__: ${answer.MINVERID}\n`;
        markdown += "\n";
        markdown += "## Release Notes\n";

        for (let type of Object.keys(answer.RELEASENOTES[0])) {
            const entries = answer.RELEASENOTES[0][type];

            markdown += `### ${type}\n`;

            for (let entry of entries) {
                markdown += `- ${entry["_"] || entry}\n`;
            }

            markdown += "\n";
        }

        markdown += "## Files\n";

        if (!answer.FILE) {
            markdown += "No files found.\n";
        } else {
            for (let file of answer.FILE) {
                markdown += `- [${file.TEXTNAME[0]}](${DOWNLOAD_URL + "/" + file.SOURCE[0]}) (${file.SOURCE[0]})\n`;
                markdown += `  - Target: ${file.TARGET[0]}\n`;
                markdown += `  - Version ID: ${file.VERSIONID[0]}\n`;
                markdown += `  - Size: ${file.SIZE[0]}\n`;
                markdown += `  - OS: ${file.OS[0]}\n`;
            }
        }

        markdown += "\n";

        fs.writeFileSync(`${OUTPUT_DIR}/updates/${answer.VERSIONID}.md`, markdown);
    }

    for (let year of Object.keys(updatesByYear).sort((a: any, b: any) => b - a)) {
        readme += `## ${year}\n\n`;

        for (let update of updatesByYear[year]) {
            readme += `- [${update.VERSIONTEXT}](./updates/${update.VERSIONID}.md) (${update.DATE})\n`;
        }

        readme += "\n";
    }

    fs.writeFileSync(`${OUTPUT_DIR}/README.md`, readme);

    console.log(chalk.blue("Done!"));
}

async function fetchUpdates(type?: "etallib"): Promise<Update[]> {
    const response = await fetch(UPDATE_URL);
    const text = await response.text();

    const result: any = await promisify(parseString)(text);
    return result.TOC.UPDATE;
}

init();