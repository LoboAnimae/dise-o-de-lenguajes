import { CAutomaton, CFileSystem, CObject, CTree } from './Controllers';
async function main() {
    const fs = new CFileSystem('../config.txt');
    const config = await fs.read();
    const parsedConfig = CObject.parseConfig(config);
    const inputData = new CFileSystem('../' + parsedConfig.input);
    const parsed: string = await inputData.read();
    const tree = new CTree(parsed);
    // Generate the Thompson Tree
    const root = tree.generate();

    // Generate a graph for the automaton
    const automaton = new CAutomaton(root, parsed);
    automaton.generateGraph();
    console.log(JSON.stringify(root));
}

export default main;