import { CAutomaton, CFileSystem, CObject, CTree } from './Controllers';
async function main() {
    const fs = new CFileSystem('../config.txt');
    const config = await fs.read();
    const parsedConfig = CObject.parseConfig(config);
    const inputData = new CFileSystem('../' + parsedConfig.input);
    const tree = new CTree(await inputData.read());
    // Generate the Thompson Tree
    const root = tree.generate();

    // Generate a graph for the automaton
    const automaton = new CAutomaton(root);
    console.log(JSON.stringify(root));
}

export default main;