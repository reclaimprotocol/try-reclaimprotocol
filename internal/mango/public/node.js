import { readFileSync } from 'node:fs';
import './wasm_exec.js';

const url = "mango.wasm";

async function main() {
    const wasmBuffer = readFileSync(url);
    const __reclaim_mango = new globalThis.Go();
    globalThis.__reclaim_mango = __reclaim_mango;
    await WebAssembly.instantiate(
        wasmBuffer,
        __reclaim_mango.importObject,
    ).then((result) => {
        __reclaim_mango.run(result.instance);
    });
}

main();
