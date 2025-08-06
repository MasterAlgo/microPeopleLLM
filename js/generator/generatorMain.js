// /js/generator/generatorMain.js

import { getTokenLength } from '../Globals.js';
import { getMinTokenLength, getMaxTokenLength, getSmallL, getBigL } from '../Globals.js';
import { getTokenDict } from '../Model.js';
import { globalData } from '../Globals.js';

import Tokenizer from '../Tokenizer.js';
// Utility: delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class GeneratorMain {
    
    candidatesAarray = [];
    biggestArray     = new Map();
    chunksNoHead     = [];
    detokenizer      = new Tokenizer(); // same n used during training
    prompt           = '';
    isStopped        = false; // 🔽 Add a flag to control execution
    
    constructor() {
        console.info('GeneratorMain initialized');
    }

    tokenizePrompt() {
        const tokenLength = getTokenLength   ();
        const minTokens   = getMinTokenLength();
        const maxTokens   = getMaxTokenLength();
        
        const promptInput = document.querySelector('#generator-content [data-role="prompt-input"]');
        this.prompt = promptInput ? promptInput.value : '';

        const trimLength    = this.prompt.length % tokenLength;
        const trimmedPrompt = this.prompt.slice(trimLength);   
        const resultPanel = document.querySelector('#generator-content [data-role="result"]');
        resultPanel.textContent = '';
        
        const tokenDict = getTokenDict();
        
        const chunks = [];
        
        for (let i = 0; i < trimmedPrompt.length; i += tokenLength) {
            const chunk = trimmedPrompt.slice(i, i + tokenLength);
            const id    = tokenDict.get(chunk);
            chunks.push(id);
//            resultPanel.textContent += chunk + id + '\n';
        }        
        
        const text = this.detokenizer.detokenize(chunks);        
//console.log('GeneratorMain: tokenizePrompt : chunks, deconenized text = ', Array.from(chunks), text );

        const overflow = chunks.length - maxTokens;
        if (overflow > 0) {
            chunks.splice(0, overflow); // Remove from the head
        }
        return chunks; // 👈 Return chunks so caller can use it
    }
                        // ================ findCandidate ======================
    findCandidate(chunks){
        const minTokens   = getMinTokenLength();
        const bigArrayIndex = chunks.length - minTokens;  // index od bigArray in all bigArrays (not in a specific bigArray)
        this.chunksNoHead  = chunks.splice(1);
        
        const bigArraysNumber = globalData.bigSortedArrays.length;
        this.biggestArray = globalData.bigSortedArrays [bigArrayIndex];
        const candidateIndex = this.biggestArray.findShortIndex(this.chunksNoHead);
        return candidateIndex;
    }
                        // ================ findallCandidates ==================
    findAllCandidates(candidateIndex){
        const firstIndex = this.biggestArray.findFirstIndex(this.chunksNoHead, candidateIndex);
        const lastIndex  = this.biggestArray.findLastIndex (this.chunksNoHead, candidateIndex);
        this.candidatesArray = this.biggestArray.collectCandidates(firstIndex, lastIndex);
        const candidatesPanel = document.querySelector('#generator-content [data-role="candidates-panel"]');
        const lines = [];
        lines.push('CANDIDATES:\n\n');
        for (let i = 0; i < this.candidatesArray.length; i++) {
            const candidate = this.candidatesArray[i]; // ← no need to init []
            let key   = [];
            let value = [];
            for( let j = 0; j < candidate.length - 2; j++){
                key.push(candidate[j]);
            }
            for( let j = candidate.length - 2; j < candidate.length; j++){
                value.push(candidate[j]);
            }
            const text = this.detokenizer.detokenize(key);
            lines.push(`${text.padEnd(20)}${value}`); // Aligns value after 10 chars
        }  
        candidatesPanel.textContent = lines.join('\n');
    }
    

            // ================ start ==============================
    async start() {
        console.log('🚀 GeneratorMain: Start triggered');
        this.isStopped = false;

        const minTokens   = getMinTokenLength  ();
        let   chunks      = this.tokenizePrompt();
        
if(chunks.length < minTokens)        {
    console.warn('The prompt is too short : must be longer then (Min Node Synapses * (Token Length)');
    return;
}
        const resultPanel = document.querySelector('#generator-content [data-role="result"]');

        resultPanel.textContent = '';
        resultPanel.textContent += this.prompt;

        await delay(1); // Very short delay to yield control

        while (true) {
            let candidateIndex = this.findCandidate(chunks);
            while (candidateIndex < 0) {
                chunks = chunks.slice(1); // Use slice, not splice (more readable)
                if (chunks.length < minTokens) {
                    console.error("generatorMain - no candidate... quitting ");
                    resultPanel.textContent += "\n[No candidates found. Stopped.]";
                    return;
                }
                candidateIndex = this.findCandidate(chunks); // Fixed: was `findCandidate` (missing `this.`)
            }

            const firstIndex = this.biggestArray.findFirstIndex(this.chunksNoHead, candidateIndex);
            const lastIndex  = this.biggestArray.findLastIndex(this.chunksNoHead, candidateIndex);
            let candidatesNumber = lastIndex - firstIndex + 1;

            // Shrink further if too few candidates
            while (candidatesNumber < 1) {
                chunks = chunks.slice(1);
                if (chunks.length < minTokens) {
                console.error("generatorMain - too few candidates... quitting ");
                resultPanel.textContent += "\n[Not enough candidates. Stopped.]";
                return;
                }
                candidateIndex = this.findCandidate(chunks);
                const newLastIndex = this.biggestArray.findLastIndex(this.chunksNoHead, candidateIndex);
                candidatesNumber = newLastIndex - firstIndex + 1;
            }
            if (candidateIndex > -1) {
                this.findAllCandidates(candidateIndex); // Fixed: was `candidatesAarray`

                if (this.candidatesArray.length === 0) {
                    console.error("No candidates found in array.");
                    break;
                }

                const randomCandidate = this.candidatesArray[Math.floor(Math.random() * this.candidatesArray.length)];
                const nextTokenIndex = randomCandidate.length - 3; // Your "hack" offset
                let nextPrompt = [];
                for( let j = 0; j < randomCandidate.length - 2; j++){  // 2 is a hack - must check with bigSortedArray on the value length
                    nextPrompt.push(randomCandidate[j]);
                    chunks[j] = randomCandidate[j];
                }

                if (nextTokenIndex >= 0) {
                    const nextToken = [randomCandidate[nextTokenIndex]];
                    const nextTokenText = this.detokenizer.detokenize(nextToken);

                    resultPanel.textContent += nextTokenText;

                    await delay(10); // Adjust: 10ms = fast stream, 50ms = slower typing effect
                    
                }

                // Optional: break after certain length
                if (resultPanel.textContent.length > 10000) {
                    resultPanel.textContent += "\n[Max length reached. Stopped.]";
                    break;
                }
                if (this.isStopped) break;
            }
        }
    }

    /**
     * Stop generation process
     * Placeholder for future implementation
     */
    stop() {
        console.log('🛑 GeneratorMain: Stop triggered');
        this.isStopped = true;  // 👈 Signal the loop to stop        
    }
}    
