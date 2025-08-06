export class SortedArray {
    constructor(L, N, K) {
        this.L = L;                  // max number of records
        this.N = N;                  // key length
        this.K = K;                  // value length
        this.stride = N + K;         // total record length
        this.capacity = L * this.stride;
        this.data = new Int32Array(this.capacity); // flat buffer
        this.size = 0;               // number of records inserted
        this.overfill = false;
    }

    clear() {
        this.size = 0;
        this.overfill = false;
    }

    isFull() {
        return this.size >= this.L;
    }

    getKey(index) {
        const start = index * this.stride;
        return this.data.subarray(start, start + this.N);
    }

    getValue(index) {
        const start = index * this.stride + this.N;
        return this.data.subarray(start, start + this.K);
    }

    // New method: get mutable value reference
    getValueRef(index) {
        const start = index * this.stride + this.N;
        return this.data.subarray(start, start + this.K);
    }

    // New method: increment frequency at given index
    incrementFrequency(index, amount = 1) {
        if (index >= 0 && index < this.size) {
            const valueStart = index * this.stride + this.N;
            this.data[valueStart] += amount;
            return true;
        }
        return false;
    }

    // New method: decrement frequency at given index
    decrementFrequency(index, amount = 1) {
        if (index >= 0 && index < this.size) {
            const valueStart = index * this.stride + this.N;
            this.data[valueStart] = Math.max(0, this.data[valueStart] - amount);
            return true;
        }
        return false;
    }

    insert(keyArray, valueArray) {
        if (this.isFull()) {
            this.overfill = true;
            return false;
        }

        // Find insert position (binary search over existing records)
        let left = 0, right = this.size;
        while (left < right) {
            const mid = (left + right) >> 1;
            const cmp = this._compareKeyAt(keyArray, mid);
            if (cmp < 0) right = mid;
            else left = mid + 1;
        }
        const insertPos = left;

        // Shift existing records to the right
        for (let i = this.size; i > insertPos; i--) {
            const src = (i - 1) * this.stride;
            const dst = i * this.stride;
            for (let j = 0; j < this.stride; j++) {
                this.data[dst + j] = this.data[src + j];
            }
        }

        // Insert key + value
        const base = insertPos * this.stride;
        for (let i = 0; i < this.N; i++) {
            this.data[base + i] = keyArray[i];
        }
        for (let i = 0; i < this.K; i++) {
            this.data[base + this.N + i] = valueArray[i];
        }

        this.size++;
        return true;
    }

    _compareKeyAt(key, recordIndex) {
        const offset = recordIndex * this.stride;
        for (let i = 0; i < this.N; i++) {
            const diff = key[i] - this.data[offset + i];
            if (diff !== 0) return diff;
        }
        return 0;
    }

    // New method: find key and increment its frequency
    findAndIncrement(keyArray, amount = 1) {
        const index = this.findIndex(keyArray);
        if (index !== -1) {
            return this.incrementFrequency(index, amount);
        }
        return false;
    }

    // New method: binary search to find key index
    findIndex(keyArray) {
        let left = 0, right = this.size;
        while (left < right) {
            const mid = (left + right) >> 1;
            const cmp = this._compareKeyAt(keyArray, mid);
            if (cmp === 0) return mid;
            else if (cmp < 0) right = mid;
            else left = mid + 1;
        }
        return -1;
    }
    
    _compareShortKeyAt(key, recordIndex) {
        const offset = recordIndex * this.stride;
        for (let i = 0; i < this.N - 1; i++) {
            const diff = key[i] - this.data[offset + i];
            if (diff !== 0) return diff;
        }
        return 0;
    }
    // New method: binary search to find key index
    findShortIndex(keyArray) {
        let left = 0, right = this.size;
        while (left < right) {
            const mid = (left + right) >> 1;
            const cmp = this._compareShortKeyAt(keyArray, mid);
            if (cmp === 0) return mid;
            else if (cmp < 0) right = mid;
            else left = mid + 1;
        }
        return -1;
    }
    
    findFirstIndex(keyArray, startPoint){
        let cmp = this._compareShortKeyAt(keyArray, startPoint);
        while(cmp === 0){
            startPoint--;
            cmp = this._compareShortKeyAt(keyArray, startPoint);
        }
        return ++startPoint;
    }
    findLastIndex(keyArray, startPoint){
        let cmp = this._compareShortKeyAt(keyArray, startPoint);
        while(cmp === 0){
            startPoint++;
            cmp = this._compareShortKeyAt(keyArray, startPoint);
        }
        return --startPoint;
    }
    
    collectCandidates(firstIndex, lastIndex){
        let candidates = [];
        for( let i = firstIndex; i <= lastIndex; i++){
            let offset = i * this.stride;
            let candidate = [];
            for (let j = 0; j < this.N + this.K; j++) {
                candidate.push (this.data[offset + j]);
            }
            candidates.push(candidate);
        }
        return candidates;
    }
}